import type { MappingParams } from "@color-bank-hub/contracts/mapping";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getMappings } from "../api/mappings.api";

export const useMappings = (params: MappingParams) =>
  useQuery({
    queryKey: ["mappings", "list", params],
    queryFn: ({ signal }) => getMappings(params, signal),
    placeholderData: keepPreviousData,
  });
