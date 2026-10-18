import type { ApiResponse, SampleItem } from "@/types/sample-item";
import { httpClient } from "@/lib/http-client";

export async function getSampleItems(): Promise<SampleItem[]> {
  const response =
    await httpClient.get<ApiResponse<SampleItem[]>>("/sample-items");
  return response.data.data;
}
