import type { Mapping, MappingDetail, MappingInput } from "@color-bank-hub/contracts/mapping";
import { get, patch, post } from "@/lib/http";

export function createMapping(body: MappingInput) {
  return post<Mapping>("/mappings", body);
}

export function updateMapping(id: string, body: MappingInput) {
  return patch<Mapping>(`/mappings/${id}`, body);
}

export function getMapping(id: string, signal?: AbortSignal) {
  return get<MappingDetail>(`/mappings/${id}`, undefined, signal);
}
