import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "@/services/catalog-api";
export function useCatalog() {
  const brands = useQuery({
    queryKey: ["brands"],
    queryFn: ({ signal }) => catalogApi.brands(signal),
  });
  const products = useQuery({
    queryKey: ["products"],
    queryFn: ({ signal }) => catalogApi.products(signal),
  });
  const formats = useQuery({
    queryKey: ["formats"],
    queryFn: ({ signal }) => catalogApi.formats(signal),
  });
  return {
    brands,
    products,
    formats,
    items: formats.data?.flatMap((format) => format.items) ?? [],
  };
}
