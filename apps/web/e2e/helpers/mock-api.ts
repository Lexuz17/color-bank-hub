import type { Page, Route } from "@playwright/test";

export const mockBrands = [
  {
    id: "brand-1",
    name: "Color Lab Studio",
    isOwn: true,
  },
  {
    id: "brand-2",
    name: "Aura Cosmetics",
    isOwn: false,
  },
];

export const mockFormats = [
  {
    id: 1,
    name: "Lips",
    count: 5,
    items: [
      {
        id: 1,
        formatId: 1,
        name: "Matte Lipstick",
        code: "LIP-MATTE",
        count: 3,
      },
      {
        id: 2,
        formatId: 1,
        name: "Liquid Tint",
        code: "LIP-TINT",
        count: 2,
      },
    ],
  },
  {
    id: 2,
    name: "Face",
    count: 4,
    items: [
      {
        id: 3,
        formatId: 2,
        name: "Silk Foundation",
        code: "FACE-FND",
        count: 4,
      },
    ],
  },
];

export const mockProducts = [
  {
    id: "prod-1",
    brandId: "brand-1",
    formatItemId: 1,
    name: "Velvet Satin Lipstick",
    ingredientsInci: "Dimethicone, Silica, Red 7 Lake",
    baseType: "oil",
  },
  {
    id: "prod-2",
    brandId: "brand-2",
    formatItemId: 3,
    name: "Skin Glow Foundation",
    ingredientsInci: "Water, Glycerin, Titanium Dioxide",
    baseType: "emulsion",
  },
];

export const mockShades = [
  {
    id: "shade-1",
    productId: "prod-1",
    sku: "CV-01",
    name: "Crimson Velvet",
    hex: "#aa6d78",
    undertone: "cool" as const,
    season: "winter" as const,
    colorFamily: "Red",
    valueClass: "Medium",
    chromaClass: "Vivid",
    hslH: 349,
    hslS: 28,
    hslL: 55,
    lipPhotoUrl: null,
    swatchPhotoUrl: null,
    mayContain: null,
    composition: [{ name: "Red 7 Lake", percentage: 5.5 }],
    brand: { id: "brand-1", name: "Color Lab Studio", isOwn: true },
    product: {
      id: "prod-1",
      brandId: "brand-1",
      formatItemId: 1,
      name: "Velvet Satin Lipstick",
      baseType: "oil",
      ingredientsInci: "Dimethicone, Silica, Red 7 Lake",
    },
    formatItem: {
      id: 1,
      formatId: 1,
      name: "Matte Lipstick",
      code: "LIP-MATTE",
      count: 3,
    },
  },
  {
    id: "shade-2",
    productId: "prod-1",
    sku: "SC-02",
    name: "Solar Coral",
    hex: "#e07a5f",
    undertone: "warm" as const,
    season: "summer" as const,
    colorFamily: "Orange",
    valueClass: "Light",
    chromaClass: "Vivid",
    hslH: 13,
    hslS: 69,
    hslL: 62,
    lipPhotoUrl: null,
    swatchPhotoUrl: null,
    mayContain: null,
    composition: [{ name: "Yellow 6 Lake", percentage: 3.2 }],
    brand: { id: "brand-1", name: "Color Lab Studio", isOwn: true },
    product: {
      id: "prod-1",
      brandId: "brand-1",
      formatItemId: 1,
      name: "Velvet Satin Lipstick",
      baseType: "oil",
      ingredientsInci: "Dimethicone, Silica, Red 7 Lake",
    },
    formatItem: {
      id: 1,
      formatId: 1,
      name: "Matte Lipstick",
      code: "LIP-MATTE",
      count: 3,
    },
  },
];

export const mockReports = [
  {
    id: "rep-00000001",
    brandId: "brand-1",
    shadeId: "shade-1",
    description:
      "Sample #44 displays noticeable yellow shift vs master swatch.",
    priority: "high" as const,
    status: "pending" as const,
    createdAt: "2026-01-15T10:00:00Z",
    resolvedAt: null,
    attachmentUrls: [],
  },
];

export const mockRequests = [
  {
    id: "req-00000001",
    type: "benchmark_matching" as const,
    priority: "high" as const,
    description: "Targeting Q3 launch campaign",
    brandNameNew: "Color Lab Studio",
    productNameNew: "Velvet Satin Lipstick",
    shadeNameNew: "Autumn Rose",
    autoName: "Autumn Rose Formulation",
    formatItemId: 1,
    targetHex: "#c85a6a",
    targetDeltaE: "1.0",
    status: "pending" as const,
    requestedBy: "user-1",
    assignedTo: null,
    season: "autumn" as const,
    declineReason: null,
    resultPhotoUrl: null,
    resultNotes: null,
    ingredientsInci: null,
    composition: null,
    createdAt: "2026-02-01T12:00:00Z",
    updatedAt: "2026-02-01T12:00:00Z",
    brand: { id: "brand-1", name: "Color Lab Studio", isOwn: true },
    formatItem: {
      id: 1,
      formatId: 1,
      name: "Matte Lipstick",
      code: "LIP-MATTE",
      count: 3,
    },
    shade: null,
  },
];

export async function setupApiMocks(page: Page) {
  await page.route("**/api/**", async (route: Route) => {
    const url = new URL(route.request().url());
    const method = route.request().method();
    const pathname = url.pathname.replace(/^\/api/, "");

    // GET /brands, POST /brands
    if (pathname === "/brands") {
      if (method === "GET") {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ data: mockBrands }),
        });
      }
      if (method === "POST") {
        const body = route.request().postDataJSON();
        const newBrand = {
          id: `brand-${Date.now()}`,
          name: body.name,
          isOwn: !!body.isOwn,
        };
        return route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({ data: newBrand }),
        });
      }
    }

    // GET /product-formats, POST /product-formats
    if (pathname === "/product-formats") {
      if (method === "GET") {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ data: mockFormats }),
        });
      }
      if (method === "POST") {
        const body = route.request().postDataJSON();
        const newFormat = {
          id: Date.now(),
          name: body.name,
          count: body.items.length,
          items: body.items.map(
            (item: { name: string; code: string }, index: number) => ({
              id: Date.now() + index,
              formatId: Date.now(),
              name: item.name,
              code: item.code,
              count: 0,
            }),
          ),
        };
        return route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({ data: newFormat }),
        });
      }
    }

    // GET /products, POST /products
    if (pathname === "/products") {
      if (method === "GET") {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ data: mockProducts }),
        });
      }
      if (method === "POST") {
        const body = route.request().postDataJSON();
        const newProduct = {
          id: `prod-${Date.now()}`,
          ...body,
        };
        return route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({ data: newProduct }),
        });
      }
    }

    // GET /shades/:id, PATCH /shades/:id
    const shadeIdMatch = pathname.match(/^\/shades\/([^/]+)$/);
    if (shadeIdMatch) {
      const shadeId = shadeIdMatch[1];
      const found = mockShades.find((s) => s.id === shadeId) || mockShades[0];
      if (method === "GET") {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ data: found }),
        });
      }
      if (method === "PATCH") {
        const body = route.request().postDataJSON();
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ data: { ...found, ...body } }),
        });
      }
    }

    // GET /shades, POST /shades
    if (pathname === "/shades") {
      if (method === "GET") {
        const search = url.searchParams.get("search")?.toLowerCase();
        let items = mockShades;
        if (search) {
          items = items.filter(
            (s) =>
              s.name.toLowerCase().includes(search) ||
              s.hex.toLowerCase().includes(search),
          );
        }
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: {
              items,
              pagination: {
                page: 1,
                pageSize: 20,
                total: items.length,
              },
            },
          }),
        });
      }
      if (method === "POST") {
        const body = route.request().postDataJSON();
        const newShade = {
          id: `shade-${Date.now()}`,
          ...body,
          product: mockProducts[0],
          brand: mockBrands[0],
          formatItem: mockFormats[0].items[0],
        };
        return route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({ data: newShade }),
        });
      }
    }

    // POST /imports/preview
    if (pathname === "/imports/preview" && method === "POST") {
      const body = route.request().postDataJSON();
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            valid: true,
            rowCount: body.rows.length,
            validCount: body.rows.length,
            rows: body.rows.map((r: unknown, i: number) => ({
              row: i + 1,
              valid: true,
              data: r,
              errors: [],
            })),
          },
        }),
      });
    }

    // POST /imports/commit
    if (pathname === "/imports/commit" && method === "POST") {
      const body = route.request().postDataJSON();
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: {
            imported: body.rows.length,
            items: body.rows.map((r: unknown, index: number) => ({
              id: `imported-${index}`,
              ...r,
            })),
          },
        }),
      });
    }

    // GET /reports, POST /reports
    if (pathname === "/reports") {
      if (method === "GET") {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: {
              items: mockReports,
              pagination: {
                page: 1,
                pageSize: 20,
                total: mockReports.length,
              },
            },
          }),
        });
      }
      if (method === "POST") {
        const body = route.request().postDataJSON();
        const newReport = {
          id: `rep-${Date.now()}`,
          ...body,
          status: "pending",
          createdAt: new Date().toISOString(),
          resolvedAt: null,
          attachmentUrls: [],
        };
        return route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({ data: newReport }),
        });
      }
    }

    // PATCH /reports/:id
    const reportIdMatch = pathname.match(/^\/reports\/([^/]+)$/);
    if (reportIdMatch && method === "PATCH") {
      const body = route.request().postDataJSON();
      const updated = { ...mockReports[0], ...body };
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: updated }),
      });
    }

    // GET /prototype-requests/:id
    const requestIdMatch = pathname.match(/^\/prototype-requests\/([^/]+)$/);
    if (requestIdMatch && method === "GET") {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: mockRequests[0] }),
      });
    }

    // PATCH /prototype-requests/:id/status
    if (
      pathname.includes("/prototype-requests/") &&
      pathname.endsWith("/status") &&
      method === "PATCH"
    ) {
      const body = route.request().postDataJSON();
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: { ...mockRequests[0], status: body.status },
        }),
      });
    }

    // PATCH /prototype-requests/:id/formulation
    if (
      pathname.includes("/prototype-requests/") &&
      pathname.endsWith("/formulation") &&
      method === "PATCH"
    ) {
      const body = route.request().postDataJSON();
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: { ...mockRequests[0], ...body },
        }),
      });
    }

    // GET /prototype-requests, POST /prototype-requests
    if (pathname === "/prototype-requests") {
      if (method === "GET") {
        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            data: {
              items: mockRequests,
              pagination: {
                page: 1,
                pageSize: 20,
                total: mockRequests.length,
              },
            },
          }),
        });
      }
      if (method === "POST") {
        const body = route.request().postDataJSON();
        const newReq = {
          id: `req-${Date.now()}`,
          ...body,
          type: "benchmark_matching",
          status: "pending",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          brand: mockBrands[0],
          formatItem: mockFormats[0].items[0],
          shade: null,
        };
        return route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({ data: newReq }),
        });
      }
    }

    // Fallback pass-through
    return route.continue();
  });
}
