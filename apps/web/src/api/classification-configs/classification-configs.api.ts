import type { ClassificationConfig } from "@color-bank-hub/contracts/color-classification";
import { get } from "@/lib/http";

export function getActiveConfig(productFormatItemId: number, signal?: AbortSignal) {
  return get<ClassificationConfig>("/classification-configs/active", { productFormatItemId }, signal);
}
