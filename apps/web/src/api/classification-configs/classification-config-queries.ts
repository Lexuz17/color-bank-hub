import { useQuery } from "@tanstack/react-query";
import { getActiveConfig } from "./classification-configs.api";

export const useActiveConfig = (productFormatItemId: number | null) =>
  useQuery({
    queryKey: ["classification-configs", "active", productFormatItemId],
    queryFn: ({ signal }) => getActiveConfig(productFormatItemId ?? 0, signal),
    enabled: productFormatItemId !== null,
  });
