// Product formats: category (product_formats) + sub-category (product_format_items).
// Used by: format tree in Color Database, Shade Mapping, Color Bank, Data Input, My Mappings.
// Status: GET built in catalog-controller.ts, move the code here.
//
// Method Path                  Handler      Permission  Input  DB
// GET    /api/product-formats  listFormats  (auth)      -      read product_formats, product_format_items,
//                                                              count shades per item (shades + products)
//
// Response: tree with shade counts per category and sub-category, plus `code` and `baseType` per item.
// No create/edit endpoint: formats are fixed by the brief (6 categories / 14 items, see the seed).
// POST /api/product-formats exists today only for the old CatalogSetup UI; delete it (see data-input-controller.ts).

export {};
