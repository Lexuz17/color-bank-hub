import type { Page } from "@color-bank-hub/contracts/common";
import type {
  Shade,
  ShadeInput,
  ShadeParams,
  ShadePatch,
  StoredShade,
} from "@color-bank-hub/contracts/shade";
import { get, patch, post } from "@/services/http";

export const shadesApi = {
  shades: (params: ShadeParams, signal?: AbortSignal) =>
    get<Page<Shade>>("/shades", params, signal),
  shade: (id: string, signal?: AbortSignal) =>
    get<Shade>(`/shades/${id}`, undefined, signal),
  createShade: (body: ShadeInput) => post<StoredShade>("/shades", body),
  updateShade: (id: string, body: ShadePatch) =>
    patch<StoredShade>(`/shades/${id}`, body),
};
