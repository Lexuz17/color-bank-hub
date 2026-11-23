import * as repository from "#api/repositories/product-format-repository.js";

export const listFormats = () => repository.listFormats();
export const listFormatItemsByCodes = (codes: string[]) => repository.listFormatItemsByCodes(codes);
