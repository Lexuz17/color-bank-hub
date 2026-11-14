import type { FormatInput } from "@color-bank-hub/contracts/catalog";
import * as repository from "#api/repositories/product-format-repository.js";

export const listFormats = () => repository.listFormats();
export const createFormat = (input: FormatInput) => repository.createFormat(input);
