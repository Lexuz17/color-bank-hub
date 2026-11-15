import type { MappingInput } from "@color-bank-hub/contracts/mapping";
import { fail } from "#api/core/errors.js";
import * as repository from "#api/repositories/mapping-repository.js";
import { findActive } from "#api/services/classification-config-service.js";
import { countShadesInFormatItem } from "#api/services/shade-service.js";

export async function createMapping(input: MappingInput, ownerId: string) {
  const shadeIds = [...new Set(input.shadeIds)];
  if ((await countShadesInFormatItem(shadeIds, input.productFormatItemId)) !== shadeIds.length)
    fail("BUSINESS_RULE", "Every shade must exist and belong to the selected format", "MAPPING_FORMAT_MISMATCH");
  const custom = input.viewMode === "custom";
  return repository.createMapping({
    ownerId,
    name: input.name,
    productFormatItemId: input.productFormatItemId,
    shadeIds,
    viewMode: input.viewMode,
    axisX: custom ? input.axisX : null,
    axisY: custom ? input.axisY : null,
    showPhoto: input.showPhoto,
    hideProductName: input.hideProductName,
    classificationConfig: await findActive(input.productFormatItemId),
    useActiveConfig: false,
  });
}
