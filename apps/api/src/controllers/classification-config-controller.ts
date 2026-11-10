// Classification configs: cut-offs per category (undertone, season, Hue Munsell, family, value, chroma).
// Used by: Data Input auto preview (needs the active config), future admin settings page.
//
// Method Path                                        Handler        Permission             Input (contracts)                       DB
// GET    /api/classification-configs?productFormatId  listConfigs    (auth)                 query productFormatId                   read  classification_config_versions
// GET    /api/classification-configs/active?productFormatItemId
//                                                    findActive     (auth)                 query productFormatItemId                read  classification_config_versions + product_format_items
// POST   /api/classification-configs                 createVersion  classification:manage  { productFormatId, config, note }       write classification_config_versions (version = max + 1, inactive), audit_logs
// PATCH  /api/classification-configs/:id/activate    activate       classification:manage  uuid                                    write classification_config_versions (swap is_active in a transaction), audit_logs
//
// To add first:
// - Zod schema for ClassificationConfig in contracts (shape only), and permission "classification:manage" in contracts/rbac.ts.
// Decided: shades always use the active version. Activating a version re-classifies every shade of that category
// (classifyColor on each hex, update labels) in the same transaction as the is_active swap.
// Mappings on Default read the active version live. Old versions stay as history; rollback = activate an old version.
// audit_logs row per create/activate (actor, before/after version).
// Per-mapping custom cut-offs live in mappings.classificationConfig, never in this table.
// Rules (service): never edit an old version; category exists -> NOT_FOUND.

export {};
