import { test, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
// Only run database writes when an explicit integration database URL is supplied.
const testUrl = process.env.TEST_DATABASE_URL;
if (testUrl) {
  process.env.DATABASE_URL = testUrl;
  after(async () => {
    const { closeDb } = await import("@color-bank-hub/db");
    const { db } = await import("../src/lib/db.js");
    await closeDb(db);
  });
}

test("PostgreSQL API integration: catalog, imports, reports and prototype lifecycle", {
  skip: !testUrl,
}, async () => {
  const { createApp } = await import("../src/app.js");
  const { db } = await import("../src/lib/db.js");
  const { brands, products, productFormats, productFormatItems, shades, reports, prototypeRequests, auditLogs, users } = await import(
    "@color-bank-hub/db"
  );
  const { eq, inArray } = await import("drizzle-orm");
  const prefix = `API_TEST_${randomUUID().slice(0, 8)}`;
  const ids = {
    brands: [] as string[],
    products: [] as string[],
    shades: [] as string[],
    reports: [] as string[],
    requests: [] as string[],
  };
  let productFormatId: number | undefined;
  let itemId: number | undefined;
  const [actor] = await db
    .insert(users)
    .values({
      name: `${prefix} actor`,
      email: `${prefix.toLowerCase()}@test.invalid`,
      role: "admin",
      status: "active",
      emailVerified: true,
    })
    .returning();
  if (!actor) throw new Error("Failed to create test actor");
  const app = createApp({
    resolveUser: async () => ({
      id: actor.id,
      email: actor.email,
      name: actor.name,
      role: "admin",
    }),
  });
  async function call(path: string, method = "GET", body?: unknown, status = 200) {
    const response = await app.request(path, {
      method,
      ...(body
        ? {
            headers: { "content-type": "application/json" },
            body: JSON.stringify(body),
          }
        : {}),
    });
    const result = await response.json();
    assert.equal(response.status, status, `${method} ${path}: ${JSON.stringify(result)}`);
    return result;
  }
  try {
    const [format] = await db.insert(productFormats).values({ name: prefix }).returning();
    productFormatId = format.id;
    const [item] = await db
      .insert(productFormatItems)
      .values({ productFormatId: format.id, name: "Test tint", code: randomUUID().replace(/-/g, "").slice(0, 4) })
      .returning();
    itemId = item.id;
    const [own, external] = await db
      .insert(brands)
      .values([{ name: `${prefix} OWN`, isOwn: true }, { name: `${prefix} EXTERNAL` }])
      .returning();
    ids.brands.push(own.id, external.id);
    const [product, externalProduct] = await db
      .insert(products)
      .values([
        { brandId: own.id, productFormatItemId: itemId, name: `${prefix} Tint` },
        { brandId: external.id, productFormatItemId: itemId, name: `${prefix} External tint` },
      ])
      .returning();
    ids.products.push(product.id, externalProduct.id);
    const { colorMetrics } = await import("@color-bank-hub/contracts/color");
    const [shade, externalShade] = await db
      .insert(shades)
      .values([
        {
          productId: product.id,
          sku: `${prefix}-1`,
          name: "Rose test",
          ingredientsInci: "Aqua, Glycerin",
          composition: [{ name: "Red", percentage: 20 }],
          hex: "#aa6d78",
          ...colorMetrics("#aa6d78"),
        },
        { productId: externalProduct.id, sku: `${prefix}-external`, name: "External", hex: "#ff0000", ...colorMetrics("#ff0000") },
      ])
      .returning();
    ids.shades.push(shade.id, externalShade.id);
    assert.equal((await call(`/api/shades?search=${prefix}&pageSize=1`)).data.pagination.total, 2);
    assert.equal((await call(`/api/shades?brandId=${own.id}&productFormatItemId=${itemId}`)).data.items.length, 1);
    assert.ok((await call(`/api/shades/${shade.id}`)).data.composition);
    assert.equal("composition" in (await call(`/api/shades/${externalShade.id}`)).data, false);
    const changed = (await call(`/api/shades/${shade.id}`, "PATCH", { hex: "#ff0000" })).data;
    assert.equal(changed.hslH, 0);
    assert.equal(changed.hslS, 100);
    assert.equal(changed.season, null);
    // Data Input creates the brand and product by name. It uses the seeded sub-category TM, so this test's own format has no config.
    const importRow = {
      origin: "own",
      brand: `${prefix} IMPORT`,
      productName: `${prefix} Imported tint`,
      subCategoryCode: "TM",
      shadeName: "Imported",
      sku: `${prefix}-2`,
      hex: "#cc6677",
      ingredientsInci: "Aqua, Glycerin",
    };
    const preview = (await call("/api/data-input/preview", "POST", { rows: [importRow] })).data;
    assert.equal(preview.valid, true);
    assert.equal(preview.newBrandCount, 1);
    assert.equal((await db.select().from(shades).where(eq(shades.sku, importRow.sku))).length, 0);
    assert.equal((await call("/api/data-input/preview", "POST", { rows: [importRow, importRow] })).data.valid, false);
    await call(
      "/api/data-input/commit",
      "POST",
      { rows: [importRow, { ...importRow, shadeName: "Bad", sku: `${prefix}-bad`, hex: "invalid" }] },
      422,
    );
    assert.equal((await db.select().from(shades).where(eq(shades.sku, importRow.sku))).length, 0);
    const imported = (await call("/api/data-input/commit", "POST", { rows: [importRow] }, 201)).data;
    assert.deepEqual(imported, { imported: 1, createdBrands: 1, createdProducts: 1 });
    const [importedBrand] = await db.select().from(brands).where(eq(brands.name, importRow.brand));
    ids.brands.push(importedBrand.id);
    const importedProducts = await db.select().from(products).where(eq(products.brandId, importedBrand.id));
    ids.products.push(...importedProducts.map((row) => row.id));
    const importedShades = await db.select().from(shades).where(eq(shades.sku, importRow.sku));
    ids.shades.push(...importedShades.map((row) => row.id));
    assert.equal(importedShades.length, 1);
    assert.ok(importedShades[0].colorFamily);
    const formats = (await call("/api/product-formats")).data;
    assert.equal(formats.find((item: { id: number }) => item.id === productFormatId).count, 2);
    const report = (
      await call(
        "/api/reports",
        "POST",
        {
          issueType: "incorrect_shade_data",
          shadeId: shade.id,
          description: "Integration test shade correction",
        },
        201,
      )
    ).data;
    ids.reports.push(report.id);
    assert.ok(report.reporterId);
    assert.equal((await call(`/api/reports/${report.id}`, "PATCH", { status: "resolved" })).data.status, "resolved");
    assert.equal((await call(`/api/reports/${report.id}`, "PATCH", { status: "pending" })).data.resolvedAt, null);
    const prototypeBody = {
      type: "gap_filling",
      productFormatItemId: itemId,
      brandNameNew: "Test brand",
      productNameNew: "Test tint",
      shadeNameNew: "Test rose",
      targetHex: "#aa6d78",
    };
    const request = (await call("/api/prototype-requests", "POST", prototypeBody, 201)).data;
    ids.requests.push(request.id);
    assert.ok(request.requesterId);
    await call(`/api/prototype-requests/${request.id}/status`, "PATCH", { status: "completed" }, 409);
    await call(`/api/prototype-requests/${request.id}/formulation`, "PATCH", { resultNotes: "Too early" }, 409);
    const approved = (
      await call(`/api/prototype-requests/${request.id}/status`, "PATCH", {
        status: "approved",
      })
    ).data;
    assert.ok(approved.autoName);
    assert.ok(approved.sequenceNo);
    await call(`/api/prototype-requests/${request.id}/status`, "PATCH", { status: "approved" }, 409);
    await call(`/api/prototype-requests/${request.id}/status`, "PATCH", {
      status: "formulating",
    });
    await call(`/api/prototype-requests/${request.id}/status`, "PATCH", { status: "completed" }, 422);
    await call(`/api/prototype-requests/${request.id}/formulation`, "PATCH", {
      resultPhotoUrl: "https://example.com/test-result.png",
      resultNotes: "Test result",
      composition: [{ name: "Red", percentage: 20 }],
    });
    assert.equal(
      (
        await call(`/api/prototype-requests/${request.id}/status`, "PATCH", {
          status: "completed",
        })
      ).data.status,
      "completed",
    );
    const decline = (await call("/api/prototype-requests", "POST", prototypeBody, 201)).data;
    ids.requests.push(decline.id);
    assert.equal(
      (
        await call(`/api/prototype-requests/${decline.id}/status`, "PATCH", {
          status: "declined",
          declineReason: "Test decline",
        })
      ).data.status,
      "declined",
    );
    await call(`/api/prototype-requests/${decline.id}/status`, "PATCH", { status: "approved" }, 409);
    assert.equal((await call(`/api/prototype-requests?productFormatItemId=${itemId}`)).data.pagination.total, 2);
    await call(`/api/shades/${randomUUID()}`, "GET", undefined, 404);
  } finally {
    // Cleanup only fixture IDs and the test-owned format. Never truncate shared tables.
    await db.transaction(async (tx) => {
      const targets = [...ids.reports, ...ids.requests];
      if (targets.length) await tx.delete(auditLogs).where(inArray(auditLogs.targetId, targets));
      if (ids.reports.length) await tx.delete(reports).where(inArray(reports.id, ids.reports));
      if (ids.requests.length) await tx.delete(prototypeRequests).where(inArray(prototypeRequests.id, ids.requests));
      if (ids.shades.length) await tx.delete(shades).where(inArray(shades.id, ids.shades));
      if (ids.products.length) await tx.delete(products).where(inArray(products.id, ids.products));
      if (ids.brands.length) await tx.delete(brands).where(inArray(brands.id, ids.brands));
      if (itemId) await tx.delete(productFormatItems).where(eq(productFormatItems.id, itemId));
      if (productFormatId) await tx.delete(productFormats).where(eq(productFormats.id, productFormatId));
    });
    await db.delete(auditLogs).where(eq(auditLogs.actorId, actor.id));
    await db.delete(users).where(eq(users.id, actor.id));
  }
});
