import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/color-bank-api";
export function useCatalog() {
  const brands = useQuery({
    queryKey: ["brands"],
    queryFn: ({ signal }) => api.brands(signal),
  });
  const products = useQuery({
    queryKey: ["products"],
    queryFn: ({ signal }) => api.products(signal),
  });
  const formats = useQuery({
    queryKey: ["formats"],
    queryFn: ({ signal }) => api.formats(signal),
  });
  return {
    brands,
    products,
    formats,
    items: formats.data?.flatMap((format) => format.items) ?? [],
  };
}
