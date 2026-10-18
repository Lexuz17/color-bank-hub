import { useQuery } from "@tanstack/react-query";
import { getSampleItems } from "@/services/get-sample-items";

export const sampleItemsQueryKey = ["sample-items"] as const;

export function useSampleItems() {
  return useQuery({
    queryKey: sampleItemsQueryKey,
    queryFn: getSampleItems,
  });
}
