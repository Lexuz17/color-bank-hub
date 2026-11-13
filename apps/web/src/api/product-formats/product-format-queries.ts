import { useQuery } from "@tanstack/react-query";
import { getProductFormats } from "./product-formats.api";

export const useProductFormats = () =>
  useQuery({
    queryKey: ["product-formats", "list"],
    queryFn: ({ signal }) => getProductFormats(signal),
  });
