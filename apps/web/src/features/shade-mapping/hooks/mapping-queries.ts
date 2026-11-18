import { useQuery } from "@tanstack/react-query";
import { getMapping } from "../api/mappings.api";

export const useMapping = (id: string | null) =>
  useQuery({
    queryKey: ["mappings", "detail", id],
    queryFn: ({ signal }) => getMapping(id ?? "", signal),
    enabled: !!id,
  });
