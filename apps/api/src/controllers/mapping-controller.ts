// Shade maps. Used by: My Mappings (library cards, pin, edit, delete), Shade Mapping (open, Save).
// Client decision (2026-11-11):
// - "All mappings" = system maps, the same for every account: one per own brand (brands.is_own) + sub-category,
//   e.g. "Emina — Lip Tint Gloss". Not stored: computed from shades on every read, so new products appear automatically.
// - "Mine" = maps a user saved. Private: only the owner can read, edit or delete them (admin too has no access).
// - No draft. A map that is not saved is not stored.
//
// Method Path                   Handler        Input (contracts)                       DB
// GET    /api/mappings          listMappings   mappingQuery: library=all|pinned|mine,   all:  read shades + products + brands + product_format_items
//                                              brandId?, productFormatId?, search?, page       (group by brand + sub-category -> one card each)
//                                                                                       mine: read mappings where owner_id = user (+ swatch dots)
// GET    /api/mappings/:id      findMapping    uuid                                    read  mappings + shades of shadeIds
// POST   /api/mappings          createMapping  mappingInput: name, productFormatItemId, write mappings (ownerId = user)
//                                              shadeIds, viewMode, axisX?, axisY?, showPhoto, hideProductName,
//                                              classificationConfig?, useActiveConfig
// PATCH  /api/mappings/:id      updateMapping  mappingPatch                            write mappings
// DELETE /api/mappings/:id      deleteMapping  uuid                                    write mappings (mapping_pins cascade)
// PUT    /api/mappings/:id/pin  pinMapping     uuid                                    write mapping_pins
// DELETE /api/mappings/:id/pin  unpinMapping   uuid                                    write mapping_pins
// All endpoints: any signed-in user (no extra permission); ownership is checked in the service.
//
// System map: the card opens Shade Mapping with GET /api/shades?brandId=&productFormatItemId=. Editing it and clicking
// Save creates a new "Mine" map (createMapping).
//
// To add first: contracts/mapping.ts (mappingInput, mappingPatch, mappingQuery, Mapping and SystemMapping types).
// Rules (service):
// - Not the owner -> NOT_FOUND MAPPING_NOT_FOUND (do not reveal that a private map exists).
// - All shadeIds exist and belong to productFormatItemId -> BUSINESS_RULE MAPPING_FORMAT_MISMATCH (format is locked).
// - axisX/axisY only for the custom view.
// Config (labels on the map are computed when shown, with classifyColor(hex, config), not read from shades):
// - useActiveConfig = true (Default): the active classification_config_versions row of the category, read live.
//   System maps always use this.
// - useActiveConfig = false (Custom): classificationConfig, copied from the active config on save, then edited by the user.
//   Only this map uses it; it never becomes a default. Switching keeps classificationConfig.
// - Response returns `config` = useActiveConfig ? active config : classificationConfig.
// Waiting for the client:
// - System maps: own brands only, or competitors too? Default view (season or color family)? Card name format?
// - Can system maps be pinned? If yes, a pin needs brand + sub-category instead of mapping_id.
// Later: thumbnailUrl -> thumbnail key via upload-service (store keys, not URLs).

export {};
