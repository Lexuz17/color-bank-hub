import { useQuery } from "@tanstack/react-query";
import { getConfigVersions } from "../api/config-versions.api";

export const useConfigVersions = (productFormatId: number | null) =>
  useQuery({
    queryKey: ["classification-configs", "versions", productFormatId],
    queryFn: ({ signal }) => getConfigVersions(productFormatId ?? 0, signal),
    enabled: productFormatId !== null,
  });
