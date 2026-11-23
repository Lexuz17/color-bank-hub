export interface BrandInput {
  name: string;
  isOwn: boolean;
}

export interface ProductInput {
  brandId: string;
  productFormatItemId: number;
  name: string;
}

export interface Brand {
  id: string;
  name: string;
  isOwn: boolean;
}

export const benchmarkAllowedWith: Record<string, string[]> = {
  V: ["V", "LM"],
  LM: ["LM", "SM"],
  LV: ["LV", "SG"],
  B: ["B"],
  TG: ["TG"],
  TM: ["TM"],
  TW: ["TW"],
  LO: ["LO"],
  BP: ["BP"],
  BL: ["BL"],
  ES: ["ES"],
  EM: ["EM"],
};

// True when the selection mixes formats that cannot be benchmarked together: no one format in it allows all the others.
export const breaksBenchmarkRule = (codes: string[]) =>
  codes.length > 1 && !codes.some((code) => codes.every((other) => benchmarkAllowedWith[code]?.includes(other)));

export interface FormatItem {
  id: number;
  productFormatId: number;
  name: string;
  code: string;
  baseType: string | null;
  count: number;
}
export interface ProductFormat {
  id: number;
  name: string;
  items: FormatItem[];
  count: number;
}
export interface Product {
  id: string;
  brandId: string;
  productFormatItemId: number;
  name: string;
}
