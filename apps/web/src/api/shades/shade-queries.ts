import type { ShadeParams } from "@color-bank-hub/contracts/shade";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getShade, getShades } from "./shades.api";

export const useShades = (params: ShadeParams) =>
  useQuery({
    queryKey: ["shades", "list", params],
    queryFn: ({ signal }) => getShades(params, signal),
    // Keep the current rows on screen while a new page or filter loads.
    placeholderData: keepPreviousData,
  });

export const useShade = (id: string | null) =>
  useQuery({
    queryKey: ["shades", "detail", id],
    queryFn: ({ signal }) => getShade(id ?? "", signal),
    enabled: !!id,
  });

export const useShadeTotal = (params: ShadeParams = {}) => {
  const query = { ...params, pageSize: 1 };
  return useQuery({
    queryKey: ["shades", "list", query],
    queryFn: ({ signal }) => getShades(query, signal),
    select: (page) => page.pagination.total,
  });
};

export const useShadeSearch = (search: string) => {
  const query = { search, pageSize: 8 };
  return useQuery({
    queryKey: ["shades", "list", query],
    queryFn: ({ signal }) => getShades(query, signal),
    select: (page) => page.items,
    enabled: search.length >= 2,
  });
};
