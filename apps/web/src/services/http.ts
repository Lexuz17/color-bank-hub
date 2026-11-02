import type { ApiResponse } from "@color-bank-hub/contracts/common";
import { httpClient } from "@/lib/http-client";

export async function get<T>(
  path: string,
  params?: object,
  signal?: AbortSignal,
) {
  return (await httpClient.get<ApiResponse<T>>(path, { params, signal })).data
    .data;
}

export async function post<T>(path: string, body: unknown) {
  return (await httpClient.post<ApiResponse<T>>(path, body)).data.data;
}

export async function patch<T>(path: string, body: unknown) {
  return (await httpClient.patch<ApiResponse<T>>(path, body)).data.data;
}
