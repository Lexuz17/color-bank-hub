import { useQuery } from "@tanstack/react-query";
import { getBrands } from "./brands.api";

export const useBrands = () =>
  useQuery({
    queryKey: ["brands", "list"],
    queryFn: ({ signal }) => getBrands(signal),
  });
