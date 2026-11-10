// Products (brand + sub-category + name + INCI). Used by: Data Input product name suggestions, filters.
// Status: GET built in catalog-controller.ts, move the code here.
//
// Method Path           Handler       Permission  Input (contracts)                              DB
// GET    /api/products  listProducts  (auth)      productQuery: brandId?, productFormatItemId?,  read products
//                                                 search?
//
// Today GET has no filters and returns max 1000 rows; add productQuery when Data Input needs it.
// No create endpoint: products are created by POST /api/data-input/commit (find or create by brand + name).
// POST /api/products exists today only for the old CatalogSetup UI; delete it (see data-input-controller.ts).

export {};
