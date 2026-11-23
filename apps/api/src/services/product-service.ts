import type { ProductInput } from "@color-bank-hub/contracts/catalog";
import type { Executor } from "#api/lib/db.js";
import * as repository from "#api/repositories/product-repository.js";

export const listProducts = () => repository.listProducts();

export const findProduct = (id: string) => repository.findProduct(id);

export const findProductsByNames = (brandIds: string[], names: string[]) => repository.findProductsByNames(brandIds, names);

export const createProduct = (tx: Executor, input: ProductInput) => repository.createProduct(tx, input);
