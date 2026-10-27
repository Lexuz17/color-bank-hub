import { get, patch, post } from "@/services/http";
import type {
  CompositionItem,
  Page,
  PrototypeInput,
  PrototypeRequest,
  RequestStatus,
} from "@/types/api";

export const prototypesApi = {
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
};
