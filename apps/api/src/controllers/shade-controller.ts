// Shades. Used by: Color Database table, Shade Mapping (select SKUs + map + detail panel), Data Input manual entry / manage.
// Status: built in catalog-controller.ts, move the code here.
// POST /api/shades is not called by Data Input (it uses data-input-controller); keep it only if a caller appears.
//
// Method Path               Handler      Permission     Input (contracts)   DB
// GET    /api/shades        listShades   (auth)         shade.shadeQuery    read  shades + products + brands + product_format_items
// GET    /api/shades/:id    findShade    (auth)         uuid                read  same + shade_benchmarks (both directions)
// POST   /api/shades        createShade  catalog:write  shade.shadeInput    write shades
// PATCH  /api/shades/:id    updateShade  catalog:write  shade.shadePatch    write shades, shade_benchmarks
//        Used by Data Input > Manage Database (edit row). Body may include benchmarkShadeIds: uuid[] = the full list;
//        the service replaces this shade's shade_benchmarks rows in the same transaction.
//
// To add:
// - Classify on save: service loads the active classification_config_versions row of the shade's category,
//   runs classifyColor(hex, config) and stores the labels. Today only colorMetrics() runs,
//   so API-created shades have no labels (only the seed fills them).
// - shadeQuery filters for Shade Mapping / Color Database: hueMunsell, valueClass, chromaClass, benchmarked (row exists in shade_benchmarks).
// - List rows: "Benchmark for" / "Benchmarked to" names for the Color Database columns.
// - GET /api/shades/:id/similar (similar shades carousel). Formula still open in the brief; do not build yet.
// Benchmark rules (benchmarkShadeIds): this shade is own and each benchmark external -> BUSINESS_RULE BENCHMARK_DIRECTION;
//   same sub-category or an allowed pair (docs/brief/README.md) -> BUSINESS_RULE BENCHMARK_FORMAT_NOT_ALLOWED;
//   every id exists -> BUSINESS_RULE BENCHMARK_NOT_FOUND.
// Rules (service): composition only for own brands (shade:viewComposition to read it), photo keys via verifyUpload("shade-photo"),
// return signed URLs via getFileUrl(), (productId, name) and sku unique -> CONFLICT.

export {};
