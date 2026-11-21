import type { ProductInput } from "@color-bank-hub/contracts/catalog";
import * as repository from "#api/repositories/product-repository.js";

export const listProducts = () => repository.listProducts();

export const findProduct = (id: string) => repository.findProduct(id);

export const createProduct = (input: ProductInput) => repository.createProduct(input);
