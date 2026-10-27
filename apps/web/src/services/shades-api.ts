import { get, patch, post } from "@/services/http";
import type {
  Page,
  Shade,
  ShadeInput,
  ShadeParams,
  ShadePatch,
  StoredShade,
} from "@/types/api";

export const shadesApi = {
  shades: (params: ShadeParams, signal?: AbortSignal) =>
    get<Page<Shade>>("/shades", params, signal),
  shade: (id: string, signal?: AbortSignal) =>
    get<Shade>(`/shades/${id}`, undefined, signal),
  createShade: (body: ShadeInput) => post<StoredShade>("/shades", body),
  updateShade: (id: string, body: ShadePatch) =>
    patch<StoredShade>(`/shades/${id}`, body),
};
