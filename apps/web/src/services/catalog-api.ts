import type {
  Brand,
  BrandInput,
  FormatInput,
  Product,
  ProductFormat,
  ProductInput,
} from "@color-bank-hub/contracts/catalog";
import { get, post } from "@/services/http";

export const catalogApi = {
  brands: (signal?: AbortSignal) => get<Brand[]>("/brands", undefined, signal),
  products: (signal?: AbortSignal) =>
    get<Product[]>("/products", undefined, signal),
  formats: (signal?: AbortSignal) =>
    get<ProductFormat[]>("/product-formats", undefined, signal),
  createBrand: (body: BrandInput) => post<Brand>("/brands", body),
  createFormat: (body: FormatInput) =>
    post<ProductFormat>("/product-formats", body),
  createProduct: (body: ProductInput) => post<Product>("/products", body),
};
