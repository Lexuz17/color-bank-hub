import type { Brand } from "@color-bank-hub/contracts/catalog";
import { get } from "@/lib/http";

export function getBrands(signal?: AbortSignal) {
  return get<Brand[]>("/brands", undefined, signal);
}
