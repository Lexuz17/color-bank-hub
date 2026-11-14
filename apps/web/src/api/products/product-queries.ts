import { useQuery } from "@tanstack/react-query";
import { getProducts } from "./products.api";

export const useProducts = () =>
  useQuery({
    queryKey: ["products", "list"],
    queryFn: ({ signal }) => getProducts(signal),
  });
