import type { BrandInput } from "@color-bank-hub/contracts/catalog";
import * as repository from "#api/repositories/brand-repository.js";

export const listBrands = () => repository.listBrands();
export const createBrand = (input: BrandInput) => repository.createBrand(input);
