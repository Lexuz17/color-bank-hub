// Data Input: add shades by File Upload (.xlsx) or Manual Entry (form, one shade). Saved shades show in Color Database.
// Template: apps/web/public/templates/shade-import-template.xlsx (sheet "Guide" explains every column).
//
// Method Path                     Handler  Permission     Called when                                      DB
// POST   /api/data-input/preview  preview  catalog:write  File: user picks the .xlsx (check, no save)      read only
// POST   /api/data-input/commit   commit   catalog:write  File: user clicks Import after a clean preview   write brands, products, shades, shade_benchmarks
//                                                         Manual: user clicks Submit (rows = [one row])  (one transaction)
//
// Flow
// - File:   user picks the .xlsx + photos (several files or one .zip). Web parses the .xlsx, uploads each photo named in
//           "Lip Photo File" / "Swatch Photo File" via POST /api/uploads ("shade-photo"), puts the keys in lipPhotoKey /
//           swatchPhotoKey -> rows JSON -> preview (errors per row/column + computed labels)
//           -> user fixes the file and re-uploads, or clicks Import -> commit.
// - Manual: form -> commit with one row. Errors come back as `issues` on the form fields.
// - After commit the web invalidates shades + product-formats queries, so Color Database shows the new rows.
//
// - Schema-nya nanti ada di file baru contracts/data-input.ts, yang menggantikan contracts/import.ts.
// - Yang dikirim adalah nama, bukan ID. Contohnya brand: "Emina", bukan brandId: "uuid…". Excel memang berisi teks. API mencari brand dan product dengan nama itu, lalu membuatnya kalau belum ada.
//
// Validation: check ALL rows and return ALL errors at once (max 500 rows). Commit saves nothing if any row fails.
//   Zod (shape)      required fields, hex #RRGGBB, lengths, composition percentages 0-100.
//   Service (rules)  reason                          rule
//                    UNKNOWN_SUB_CATEGORY            subCategoryCode exists
//                    BRAND_ORIGIN_MISMATCH           existing brand has the same origin (own/external)
//                    PRODUCT_FORMAT_MISMATCH         existing product has the same sub-category
//                    DUPLICATE_SHADE                 (product, shade name) not in DB and not twice in the file
//                    DUPLICATE_SKU                   sku not in DB and not twice in the file
//                    EXTERNAL_SKU / EXTERNAL_COMPOSITION / EXTERNAL_BENCHMARK   sku, composition, benchmark only for own (Optional, kenya kl ada juga gpp)
//                    COMPOSITION_OVER_100            composition total <= 100%
//                    BENCHMARK_NOT_FOUND             benchmark shade exists in DB or in this file, and is external
//                    BENCHMARK_FORMAT_NOT_ALLOWED    same sub-category (or allowed pair, kenya ini notice message aja warning.. gk perlu merah.. tpi ttp kasih info)
//                    UPLOAD_*                        photo keys pass verifyUpload("shade-photo")
//   Web (before upload) PHOTO_FILE_MISSING            a file name in the sheet matches a picked photo (exact name + extension,
//                                                     case ignored)
//
// Store (commit, one transaction): find or create brand -> find or create product -> classifyColor(hex, active config
//   of the category) -> insert shade -> insert shade_benchmarks.
//
// Remove once this works: POST /api/brands, POST /api/products, POST /api/product-formats, /api/imports/*,
// apps/web/src/components/catalog/catalog-setup.tsx, create functions in apps/web/src/services/catalog-api.ts,
// the "Paste from Excel" method in the Data Input page, and matching cases in apps/api/test/*.test.ts.
// Web needs an .xlsx parser and, for .zip, an unzip library (propose dependencies first, e.g. read-excel-file, fflate).

export {};
