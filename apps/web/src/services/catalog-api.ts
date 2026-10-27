import { get, post } from "@/services/http";
import type { Brand, Product, ProductFormat } from "@/types/api";

export const catalogApi = {
  brands: (signal?: AbortSignal) => get<Brand[]>("/brands", undefined, signal),
  products: (signal?: AbortSignal) =>
    get<Product[]>("/products", undefined, signal),
  formats: (signal?: AbortSignal) =>
    get<ProductFormat[]>("/product-formats", undefined, signal),
  createBrand: (body: { name: string; isOwn: boolean }) =>
    post<Brand>("/brands", body),
  createFormat: (body: {
    name: string;
    items: { name: string; code: string }[];
  }) => post<ProductFormat>("/product-formats", body),
  createProduct: (body: {
    brandId: string;
    formatItemId: number;
    name: string;
    ingredientsInci: string;
  }) => post<Product>("/products", body),
};
