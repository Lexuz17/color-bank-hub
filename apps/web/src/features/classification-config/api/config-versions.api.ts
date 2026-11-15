import type { ConfigInput, ConfigVersion } from "@color-bank-hub/contracts/color-classification";
import { get, patch, post } from "@/lib/http";

export function getConfigVersions(productFormatId: number, signal?: AbortSignal) {
  return get<ConfigVersion[]>("/classification-configs", { productFormatId }, signal);
}

export function createConfigVersion(input: ConfigInput) {
  return post<ConfigVersion>("/classification-configs", input);
}

export function activateConfigVersion(id: string) {
  return patch<ConfigVersion>(`/classification-configs/${id}/activate`, {});
}
