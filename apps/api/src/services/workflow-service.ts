import type {
  FormulationInput,
  PrototypeInput,
  PrototypeQuery,
  TransitionInput,
} from "@color-bank-hub/contracts/prototype";
import * as repository from "#api/repositories/workflow-repository.js";

export const listRequests = (query: PrototypeQuery) =>
  repository.listRequests(query);
export const findRequest = (id: string) => repository.findRequest(id);
export const createRequest = (input: PrototypeInput, actorId: string) =>
  repository.createRequest(input, actorId);
export const transition = (
  id: string,
  input: TransitionInput,
  actorId: string,
) => repository.transitionRequest(id, input, actorId);
export const updateFormulation = (id: string, input: FormulationInput) =>
  repository.updateFormulation(id, input);
