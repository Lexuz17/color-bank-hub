import { isAxiosError } from "axios";
import { httpClient } from "@/lib/http-client";
import type {
  Brand,
  StoredShade,
  Product,
  ProductFormat,
  Page,
  Shade,
  ShadeInput,
  ShadePatch,
  ShadeParams,
  Report,
  ReportInput,
  PrototypeInput,
  PrototypeRequest,
  RequestStatus,
  ImportPreview,
  CompositionItem,
} from "@/types/api";
interface Response<T> {
  data: T;
}
async function get<T>(path: string, params?: object, signal?: AbortSignal) {
  return (await httpClient.get<Response<T>>(path, { params, signal })).data
    .data;
}
async function post<T>(path: string, body: unknown) {
  return (await httpClient.post<Response<T>>(path, body)).data.data;
}
async function patch<T>(path: string, body: unknown) {
  return (await httpClient.patch<Response<T>>(path, body)).data.data;
}
export const api = {
  brands: (signal?: AbortSignal) => get<Brand[]>("/brands", undefined, signal),
  products: (signal?: AbortSignal) =>
    get<Product[]>("/products", undefined, signal),
  formats: (signal?: AbortSignal) =>
    get<ProductFormat[]>("/product-formats", undefined, signal),
  createBrand: (body: { name: string; isOwn: boolean }) =>
    post<Brand>("/brands", body),
  createFormat: (body: {
    name: string;
    items: { name: string; code: string }[];
  }) => post<ProductFormat>("/product-formats", body),
  createProduct: (body: {
    brandId: string;
    formatItemId: number;
    name: string;
    ingredientsInci: string;
  }) => post<Product>("/products", body),
  shades: (params: ShadeParams, signal?: AbortSignal) =>
    get<Page<Shade>>("/shades", params, signal),
  shade: (id: string, signal?: AbortSignal) =>
    get<Shade>(`/shades/${id}`, undefined, signal),
  createShade: (body: ShadeInput) => post<StoredShade>("/shades", body),
  updateShade: (id: string, body: ShadePatch) =>
    patch<StoredShade>(`/shades/${id}`, body),
  reports: (
    params: { page: number; pageSize: number; status?: Report["status"] },
    signal?: AbortSignal,
  ) => get<Page<Report>>("/reports", params, signal),
  createReport: (body: ReportInput) => post<Report>("/reports", body),
  updateReport: (id: string, status: Report["status"]) =>
    patch<Report>(`/reports/${id}`, { status }),
  requests: (
    params: {
      page: number;
      pageSize: number;
      status?: RequestStatus;
      formatItemId?: number;
    },
    signal?: AbortSignal,
  ) => get<Page<PrototypeRequest>>("/prototype-requests", params, signal),
  request: (id: string, signal?: AbortSignal) =>
    get<PrototypeRequest>(`/prototype-requests/${id}`, undefined, signal),
  createRequest: (body: PrototypeInput) =>
    post<PrototypeRequest>("/prototype-requests", body),
  transitionRequest: (
    id: string,
    status: Exclude<RequestStatus, "pending">,
    declineReason?: string,
  ) =>
    patch<PrototypeRequest>(`/prototype-requests/${id}/status`, {
      status,
      ...(declineReason ? { declineReason } : {}),
    }),
  saveFormulation: (
    id: string,
    body: {
      resultPhotoUrl?: string;
      resultNotes?: string;
      ingredientsInci?: string;
      composition?: CompositionItem[];
    },
  ) => patch<PrototypeRequest>(`/prototype-requests/${id}/formulation`, body),
  previewImport: (rows: unknown[]) =>
    post<ImportPreview>("/imports/preview", { rows }),
  commitImport: (rows: unknown[]) =>
    post<{ imported: number; items: StoredShade[] }>("/imports/commit", {
      rows,
    }),
};
export function apiError(error: unknown): string {
  if (isAxiosError(error)) {
    const details = error.response?.data?.error;
    if (details?.issues?.length)
      return details.issues
        .map(
          (issue: { path: string; message: string }) =>
            `${issue.path ? `${issue.path}: ` : ""}${issue.message}`,
        )
        .join("; ");
    if (details?.message) return details.message;
    if (!error.response)
      return "Cannot reach the API. Check that the API and database are running.";
    if (error.response.status >= 500)
      return "The API could not load this data. Check its database connection and retry.";
  }
  return error instanceof Error
    ? error.message
    : "Unable to complete the request.";
}
