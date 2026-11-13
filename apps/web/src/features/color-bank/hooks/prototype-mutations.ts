import type {
  FormulationInput,
  TransitionInput,
} from "@color-bank-hub/contracts/prototype";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiError } from "@/lib/api-error";
import {
  createRequest,
  saveFormulation,
  transitionRequest,
} from "../api/prototypes.api";

export function useCreateRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["prototype-requests"] });
      toast.success("Prototype request submitted");
    },
    onError: (error) => toast.error(apiError(error)),
  });
}

export function useTransitionRequest(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      status,
      reason,
    }: {
      status: TransitionInput["status"];
      reason?: string;
    }) => transitionRequest(id, status, reason),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["prototype-requests"] });
      toast.success("Request updated");
    },
    onError: (error) => toast.error(apiError(error)),
  });
}

export function useSaveFormulation(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: FormulationInput) => saveFormulation(id, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["prototype-requests"] });
      toast.success("Formulation saved");
    },
    onError: (error) => toast.error(apiError(error)),
  });
}
