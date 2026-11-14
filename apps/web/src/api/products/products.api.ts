import type { Product } from "@color-bank-hub/contracts/catalog";
import { get } from "@/lib/http";

export function getProducts(signal?: AbortSignal) {
  return get<Product[]>("/products", undefined, signal);
}
