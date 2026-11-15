import type { Mapping, MappingInput } from "@color-bank-hub/contracts/mapping";
import { post } from "@/lib/http";

export function createMapping(body: MappingInput) {
  return post<Mapping>("/mappings", body);
}
