import type { BrandInput } from "@color-bank-hub/contracts/catalog";
import type { Executor } from "#api/lib/db.js";
import * as repository from "#api/repositories/brand-repository.js";

export const listBrands = () => repository.listBrands();
export const findBrandsByNames = (names: string[]) => repository.findBrandsByNames(names);
export const createBrand = (tx: Executor, input: BrandInput) => repository.createBrand(tx, input);
