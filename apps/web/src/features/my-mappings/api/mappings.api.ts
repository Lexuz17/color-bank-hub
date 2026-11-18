import type { MappingFolderInput, MappingList, MappingParams } from "@color-bank-hub/contracts/mapping";
import { del, get, patch, post, put } from "@/lib/http";

export function getMappings(params: MappingParams, signal?: AbortSignal) {
  return get<MappingList>("/mappings", params, signal);
}

export function deleteMapping(id: string) {
  return del<{ id: string }>(`/mappings/${id}`);
}

export function moveToFolder(id: string, folderId: string | null) {
  return put<{ id: string }>(`/mappings/${id}/folder`, { folderId });
}

export function createFolder(body: MappingFolderInput) {
  return post<{ id: string; name: string }>("/mapping-folders", body);
}

export function renameFolder(id: string, body: MappingFolderInput) {
  return patch<{ id: string; name: string }>(`/mapping-folders/${id}`, body);
}

export function deleteFolder(id: string) {
  return del<{ id: string }>(`/mapping-folders/${id}`);
}
