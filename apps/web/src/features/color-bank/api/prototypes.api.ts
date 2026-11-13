import type { Page } from "@color-bank-hub/contracts/common";
import type {
  FormulationInput,
  PrototypeInput,
  PrototypeParams,
  PrototypeRequest,
  TransitionInput,
} from "@color-bank-hub/contracts/prototype";
import { get, patch, post } from "@/lib/http";

export function getRequests(params: PrototypeParams, signal?: AbortSignal) {
  return get<Page<PrototypeRequest>>("/prototype-requests", params, signal);
}

export function getRequest(id: string, signal?: AbortSignal) {
  return get<PrototypeRequest>(`/prototype-requests/${id}`, undefined, signal);
}

export function createRequest(body: PrototypeInput) {
  return post<PrototypeRequest>("/prototype-requests", body);
}

export function transitionRequest(
  id: string,
  status: TransitionInput["status"],
  declineReason?: string,
) {
  return patch<PrototypeRequest>(`/prototype-requests/${id}/status`, {
    status,
    ...(declineReason ? { declineReason } : {}),
  });
}

export function saveFormulation(id: string, body: FormulationInput) {
  return patch<PrototypeRequest>(`/prototype-requests/${id}/formulation`, body);
}
