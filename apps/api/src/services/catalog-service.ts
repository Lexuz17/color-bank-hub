import { parse } from "#api/core/errors.js";
import {
  brandInput,
  formatInput,
  productInput,
  shadeInput,
  shadePatch,
  shadeQuery,
  uuid,
} from "#api/models/catalog.js";
import * as repository from "#api/repositories/catalog-repository.js";
export const listShades = (query: unknown) =>
  repository.listShades(parse(shadeQuery, query));
export const findShade = (id: unknown) => repository.findShade(parse(uuid, id));
export const listBrands = () => repository.listBrands();
export const listFormats = () => repository.listFormats();
export const listProducts = () => repository.listProducts();
export const createBrand = (input: unknown) =>
  repository.createBrand(parse(brandInput, input));
export const createProduct = (input: unknown) =>
  repository.createProduct(parse(productInput, input));
export const createShade = async (input: unknown) =>
  (await repository.createShades([parse(shadeInput, input)]))[0];
export const updateShade = (id: unknown, input: unknown) =>
  repository.updateShade(parse(uuid, id), parse(shadePatch, input));

export const createFormat = (input: unknown) =>
  repository.createFormat(parse(formatInput, input));
