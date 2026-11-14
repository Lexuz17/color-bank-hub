import { useBrands } from "@/api/brands/brand-queries";
import { useProductFormats } from "@/api/product-formats/product-format-queries";
import { useProducts } from "@/api/products/product-queries";

// Everything the manual form needs to pick a product.
export function useCatalog() {
  const brands = useBrands();
  const products = useProducts();
  const formats = useProductFormats();
  return {
    brands,
    products,
    formats,
    items: formats.data?.flatMap((format) => format.items) ?? [],
  };
}
