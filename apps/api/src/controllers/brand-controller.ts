// Brands. Used by: brand dropdowns and filters (Data Input, Color Database, Shade Mapping, Report), My Mappings "By brand".
// Status: GET built in catalog-controller.ts, move the code here (plus brand-service, brand-repository, brand-routes).
//
// Method Path         Handler     Permission  Input  DB
// GET    /api/brands  listBrands  (auth)      -      read brands
//
// No create endpoint: brands are created by POST /api/data-input/commit (find or create by name).
// POST /api/brands exists today only for the old CatalogSetup UI; delete it (see data-input-controller.ts).

export {};
