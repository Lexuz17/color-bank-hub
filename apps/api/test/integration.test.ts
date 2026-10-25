import { test, after } from "node:test";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
// Only run database writes when an explicit integration database URL is supplied.
const testUrl = process.env.TEST_DATABASE_URL;
if (testUrl) {
  process.env.DATABASE_URL = testUrl;
  after(async () => {
    const { closeDatabase } = await import("@color-bank-hub/db");
    await closeDatabase();
  });
}

test("PostgreSQL API integration: catalog, imports, reports and prototype lifecycle", {
  skip: !testUrl,
}, async () => {
  const { createApp } = await import("../src/app.js");
  const {
    db,
    brands,
    products,
    productFormats,
    productFormatItems,
    shades,
    reports,
    prototypeRequests,
    auditLogs,
    users,
  } = await import("@color-bank-hub/db");
  const { eq, inArray } = await import("drizzle-orm");
  const prefix = `API_TEST_${randomUUID().slice(0, 8)}`;
  const ids = {
    brands: [] as string[],
    products: [] as string[],
    shades: [] as string[],
    reports: [] as string[],
    requests: [] as string[],
  };
  let formatId: number | undefined;
  let itemId: number | undefined;
  const actorBefore = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, "development-api@color-bank.invalid"));
  const app = createApp();
  async function call(
    path: string,
    method = "GET",
    body?: unknown,
    status = 200,
  ) {
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
    assert.equal(
      response.status,
      status,
      `${method} ${path}: ${JSON.stringify(result)}`,
    );
    return result;
  }
  try {
    const format = (
      await call(
        "/api/product-formats",
        "POST",
        {
          name: prefix,
          items: [
            {
              name: "Test tint",
              code: randomUUID().replace(/-/g, "").slice(0, 4),
            },
          ],
        },
        201,
      )
    ).data;
    formatId = format.id;
    itemId = format.items[0].id;
    const own = (
      await call(
        "/api/brands",
        "POST",
        { name: `${prefix} OWN`, isOwn: true },
        201,
      )
    ).data;
    ids.brands.push(own.id);
    const external = (
      await call("/api/brands", "POST", { name: `${prefix} EXTERNAL` }, 201)
    ).data;
    ids.brands.push(external.id);
    const product = (
      await call(
        "/api/products",
        "POST",
        {
          brandId: own.id,
          formatItemId: itemId,
          name: `${prefix} Tint`,
          ingredientsInci: "Aqua, Glycerin",
        },
        201,
      )
    ).data;
    ids.products.push(product.id);
    const externalProduct = (
      await call(
        "/api/products",
        "POST",
        {
          brandId: external.id,
          formatItemId: itemId,
          name: `${prefix} External tint`,
          ingredientsInci: "Aqua",
        },
        201,
      )
    ).data;
    ids.products.push(externalProduct.id);
    const shadeInput = {
      productId: product.id,
      sku: `${prefix}-1`,
      name: "Rose test",
      hex: "#AA6D78",
      composition: [{ name: "Red", percentage: 20 }],
    };
    const shade = (await call("/api/shades", "POST", shadeInput, 201)).data;
    ids.shades.push(shade.id);
    assert.equal(shade.hex, "#aa6d78");
    assert.equal(shade.r, 170);
    assert.equal(shade.season, null);
    assert.equal(
      (await call(`/api/shades?search=${prefix}&pageSize=1`)).data.pagination
        .total,
      1,
    );
    assert.equal(
      (await call(`/api/shades?brandId=${own.id}&formatItemId=${itemId}`)).data
        .items.length,
      1,
    );
    assert.ok((await call(`/api/shades/${shade.id}`)).data.composition);
    await call("/api/shades", "POST", shadeInput, 409);
    await call(
      "/api/shades",
      "POST",
      { ...shadeInput, productId: externalProduct.id, sku: `${prefix}-ext` },
      422,
    );
    const externalShade = (
      await call(
        "/api/shades",
        "POST",
        {
          productId: externalProduct.id,
          sku: `${prefix}-external`,
          name: "External",
          hex: "#ff0000",
        },
        201,
      )
    ).data;
    ids.shades.push(externalShade.id);
    assert.equal(
      "composition" in (await call(`/api/shades/${externalShade.id}`)).data,
      false,
    );
    const changed = (
      await call(`/api/shades/${shade.id}`, "PATCH", { hex: "#ff0000" })
    ).data;
    assert.equal(changed.hslH, 0);
    assert.equal(changed.hslS, 100);
    assert.equal(changed.season, null);
    const importRow = {
      productId: product.id,
      sku: `${prefix}-2`,
      name: "Imported",
      hex: "#cc6677",
    };
    const preview = (
      await call("/api/imports/preview", "POST", { rows: [importRow] })
    ).data;
    assert.equal(preview.valid, true);
    assert.equal(
      (await db.select().from(shades).where(eq(shades.sku, importRow.sku)))
        .length,
      0,
    );
    assert.equal(
      (
        await call("/api/imports/preview", "POST", {
          rows: [importRow, importRow],
        })
      ).data.valid,
      false,
    );
    await call(
      "/api/imports/commit",
      "POST",
      {
        rows: [
          importRow,
          { ...importRow, sku: `${prefix}-bad`, hex: "invalid" },
        ],
      },
      422,
    );
    assert.equal(
      (await db.select().from(shades).where(eq(shades.sku, importRow.sku)))
        .length,
      0,
    );
    const imported = (
      await call("/api/imports/commit", "POST", { rows: [importRow] }, 201)
    ).data;
    ids.shades.push(imported.items[0].id);
    assert.equal(imported.imported, 1);
    const formats = (await call("/api/product-formats")).data;
    assert.equal(
      formats.find((item: { id: number }) => item.id === formatId).count,
      3,
    );
    const report = (
      await call(
        "/api/reports",
        "POST",
        {
          brandId: own.id,
          shadeId: shade.id,
          description: "Integration test shade correction",
        },
        201,
      )
    ).data;
    ids.reports.push(report.id);
    assert.ok(report.reporterId);
    assert.equal(
      (await call(`/api/reports/${report.id}`, "PATCH", { status: "resolved" }))
        .data.status,
      "resolved",
    );
    assert.equal(
      (await call(`/api/reports/${report.id}`, "PATCH", { status: "pending" }))
        .data.resolvedAt,
      null,
    );
    const prototypeBody = {
      type: "gap_filling",
      formatItemId: itemId,
      brandNameNew: "Test brand",
      productNameNew: "Test tint",
      shadeNameNew: "Test rose",
      targetHex: "#aa6d78",
    };
    const request = (
      await call("/api/prototype-requests", "POST", prototypeBody, 201)
    ).data;
    ids.requests.push(request.id);
    assert.ok(request.requesterId);
    await call(
      `/api/prototype-requests/${request.id}/status`,
      "PATCH",
      { status: "completed" },
      409,
    );
    await call(
      `/api/prototype-requests/${request.id}/formulation`,
      "PATCH",
      { resultNotes: "Too early" },
      409,
    );
    const approved = (
      await call(`/api/prototype-requests/${request.id}/status`, "PATCH", {
        status: "approved",
      })
    ).data;
    assert.ok(approved.autoName);
    assert.ok(approved.sequenceNo);
    await call(
      `/api/prototype-requests/${request.id}/status`,
      "PATCH",
      { status: "approved" },
      409,
    );
    await call(`/api/prototype-requests/${request.id}/status`, "PATCH", {
      status: "formulating",
    });
    await call(
      `/api/prototype-requests/${request.id}/status`,
      "PATCH",
      { status: "completed" },
      422,
    );
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
    const decline = (
      await call("/api/prototype-requests", "POST", prototypeBody, 201)
    ).data;
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
    await call(
      `/api/prototype-requests/${decline.id}/status`,
      "PATCH",
      { status: "approved" },
      409,
    );
    assert.equal(
      (await call(`/api/prototype-requests?formatItemId=${itemId}`)).data
        .pagination.total,
      2,
    );
    await call(`/api/shades/${randomUUID()}`, "GET", undefined, 404);
  } finally {
    // Cleanup only fixture IDs and the test-owned format. Never truncate shared tables.
    await db.transaction(async (tx) => {
      const targets = [...ids.reports, ...ids.requests];
      if (targets.length)
        await tx.delete(auditLogs).where(inArray(auditLogs.targetId, targets));
      if (ids.reports.length)
        await tx.delete(reports).where(inArray(reports.id, ids.reports));
      if (ids.requests.length)
        await tx
          .delete(prototypeRequests)
          .where(inArray(prototypeRequests.id, ids.requests));
      if (ids.shades.length)
        await tx.delete(shades).where(inArray(shades.id, ids.shades));
      if (ids.products.length)
        await tx.delete(products).where(inArray(products.id, ids.products));
      if (ids.brands.length)
        await tx.delete(brands).where(inArray(brands.id, ids.brands));
      if (itemId)
        await tx
          .delete(productFormatItems)
          .where(eq(productFormatItems.id, itemId));
      if (formatId)
        await tx.delete(productFormats).where(eq(productFormats.id, formatId));
    });
    if (!actorBefore.length) {
      const [actor] = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, "development-api@color-bank.invalid"));
      if (actor) {
        const refs = await Promise.all([
          db.select().from(reports).where(eq(reports.reporterId, actor.id)),
          db
            .select()
            .from(prototypeRequests)
            .where(eq(prototypeRequests.requesterId, actor.id)),
        ]);
        if (refs.every((rows) => !rows.length))
          await db.delete(users).where(eq(users.id, actor.id));
      }
    }
  }
});
