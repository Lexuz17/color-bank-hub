import type { Page } from "@color-bank-hub/contracts/common";
import type { Shade, ShadeParams } from "@color-bank-hub/contracts/shade";
import { get } from "@/services/http";

export function getShades(params: ShadeParams, signal?: AbortSignal) {
  return get<Page<Shade>>("/shades", params, signal);
}
