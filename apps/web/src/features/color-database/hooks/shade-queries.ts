import type { ShadeParams } from "@color-bank-hub/contracts/shade";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { getShades } from "../api/shades.api";

// Other features (e.g. Home) reuse these, so the cache is shared and invalidating `all` refreshes every shade view.
export const shadeQueries = {
  all: ["shades"] as const,
  list: (params: ShadeParams) =>
    queryOptions({
      queryKey: ["shades", "list", params],
      queryFn: ({ signal }) => getShades(params, signal),
    }),
};

export const useShadeTotal = (params: ShadeParams = {}) =>
  useQuery({
    ...shadeQueries.list({ ...params, pageSize: 1 }),
    select: (page) => page.pagination.total,
  });

export const useShadeSearch = (search: string) =>
  useQuery({
    ...shadeQueries.list({ search, pageSize: 8 }),
    select: (page) => page.items,
    enabled: search.length >= 2,
  });
