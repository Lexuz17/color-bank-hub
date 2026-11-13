import type { ProductFormat } from "@color-bank-hub/contracts/catalog";
import { get } from "@/lib/http";

export function getProductFormats(signal?: AbortSignal) {
  return get<ProductFormat[]>("/product-formats", undefined, signal);
}
