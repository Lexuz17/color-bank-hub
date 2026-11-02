import type { Page } from "@color-bank-hub/contracts/common";
import type {
  FormulationInput,
  PrototypeInput,
  PrototypeParams,
  PrototypeRequest,
  TransitionInput,
} from "@color-bank-hub/contracts/prototype";
import { get, patch, post } from "@/services/http";

export const prototypesApi = {
  requests: (params: PrototypeParams, signal?: AbortSignal) =>
    get<Page<PrototypeRequest>>("/prototype-requests", params, signal),
  request: (id: string, signal?: AbortSignal) =>
    get<PrototypeRequest>(`/prototype-requests/${id}`, undefined, signal),
  createRequest: (body: PrototypeInput) =>
    post<PrototypeRequest>("/prototype-requests", body),
  transitionRequest: (
    id: string,
    status: TransitionInput["status"],
    declineReason?: string,
  ) =>
    patch<PrototypeRequest>(`/prototype-requests/${id}/status`, {
      status,
      ...(declineReason ? { declineReason } : {}),
    }),
  saveFormulation: (id: string, body: FormulationInput) =>
    patch<PrototypeRequest>(`/prototype-requests/${id}/formulation`, body),
};
