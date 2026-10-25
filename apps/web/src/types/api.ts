export type Season = "spring" | "summer" | "autumn" | "winter";
export type Undertone = "warm" | "neutral" | "cool";
export type Priority = "low" | "medium" | "high";
export interface Brand {
  id: string;
  name: string;
  isOwn: boolean;
}
export interface FormatItem {
  id: number;
  formatId: number;
  name: string;
  code: string;
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
  formatItemId: number;
  name: string;
  baseType: string | null;
  ingredientsInci: string | null;
}
export interface CompositionItem {
  name: string;
  percentage: number;
}
export interface Shade {
  id: string;
  productId: string;
  sku: string;
  name: string;
  hex: string;
  undertone: Undertone | null;
  season: Season | null;
  colorFamily: string | null;
  valueClass: string | null;
  chromaClass: string | null;
  hslH: number | null;
  hslS: number | null;
  hslL: number | null;
  lipPhotoUrl: string | null;
  swatchPhotoUrl: string | null;
  mayContain: string | null;
  composition?: CompositionItem[] | null;
  product: Product;
  brand: Brand;
  formatItem: FormatItem;
}
export interface Page<T> {
  items: T[];
  pagination: { page: number; pageSize: number; total: number };
}
export interface ShadeInput {
  productId: string;
  sku: string;
  name: string;
  hex: string;
  lipPhotoUrl?: string;
  swatchPhotoUrl?: string;
  mayContain?: string;
  composition?: CompositionItem[];
}
export type ShadePatch = Partial<Omit<ShadeInput, "productId">>;
export interface Report {
  id: string;
  brandId: string | null;
  shadeId: string | null;
  description: string;
  priority: Priority;
  status: "pending" | "resolved";
  createdAt: string;
  resolvedAt: string | null;
  attachmentUrls: string[] | null;
}
export interface ReportInput {
  description: string;
  brandId?: string;
  shadeId?: string;
  attachmentUrls?: string[];
  priority: Priority;
}
export type RequestStatus =
  | "pending"
  | "approved"
  | "formulating"
  | "completed"
  | "declined";
export interface PrototypeRequest {
  id: string;
  type: "benchmark_matching" | "gap_filling";
  priority: Priority;
  description: string | null;
  brandNameNew: string | null;
  productNameNew: string | null;
  shadeNameNew: string | null;
  targetHex: string | null;
  formatItemId: number;
  targetSeason: Season | null;
  autoName: string | null;
  status: RequestStatus;
  declineReason: string | null;
  ingredientsInci: string | null;
  composition: CompositionItem[] | null;
  resultPhotoUrl: string | null;
  resultNotes: string | null;
  createdAt: string;
}
export interface PrototypeInput {
  type: PrototypeRequest["type"];
  priority: Priority;
  description?: string;
  brandNameNew: string;
  productNameNew: string;
  shadeNameNew: string;
  targetHex: string;
  formatItemId: number;
  targetSeason?: Season;
}
export interface ImportPreview {
  valid: boolean;
  rowCount: number;
  validCount: number;
  rows: {
    row: number;
    valid: boolean;
    data?: ShadeInput;
    errors: { path: string; message: string }[];
  }[];
}
export interface ShadeParams {
  page?: number;
  pageSize?: number;
  search?: string;
  brandId?: string;
  formatItemId?: number;
  season?: Season;
  undertone?: Undertone;
  sort?: string;
  direction?: "asc" | "desc";
}

export type StoredShade = Omit<Shade, "product" | "brand" | "formatItem">;
