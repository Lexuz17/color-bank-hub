import type { PrototypeParams } from "@color-bank-hub/contracts/prototype";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getRequest, getRequests } from "../api/prototypes.api";

// Keys start with "prototype-requests": invalidating that prefix refreshes the list and the open detail.

export const useRequests = (params: PrototypeParams) =>
  useQuery({
    queryKey: ["prototype-requests", "list", params],
    queryFn: ({ signal }) => getRequests(params, signal),
    placeholderData: keepPreviousData,
  });

export const useRequest = (id: string | null) =>
  useQuery({
    queryKey: ["prototype-requests", "detail", id],
    queryFn: ({ signal }) => getRequest(id ?? "", signal),
    enabled: !!id,
  });
