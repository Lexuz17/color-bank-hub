import type { ShadePatch, StoredShade } from "@color-bank-hub/contracts/shade";
import { patch } from "@/lib/http";

export function updateShade(id: string, body: ShadePatch) {
  return patch<StoredShade>(`/shades/${id}`, body);
}
