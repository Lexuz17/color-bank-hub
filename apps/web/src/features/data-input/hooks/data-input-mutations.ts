// Legacy flow of the old Data Input page; replaced by /data-input/preview and /commit.
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiError } from "@/lib/api-error";
import {
  commitImport,
  createBrand,
  createFormat,
  createProduct,
  createShade,
  previewImport,
} from "../api/data-input.api";

// New shades change the shade lists and the per-format counts.
function useRefreshShades() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ["shades"] }),
      queryClient.invalidateQueries({ queryKey: ["product-formats"] }),
    ]);
}

export function useCreateShade() {
  const refresh = useRefreshShades();
  return useMutation({
    mutationFn: createShade,
    onSuccess: async () => {
      await refresh();
      toast.success("Shade added to the database");
    },
    onError: (error) => toast.error(apiError(error)),
  });
}

export function usePreviewImport() {
  return useMutation({
    mutationFn: previewImport,
    onError: (error) => toast.error(apiError(error)),
  });
}

export function useCommitImport() {
  const refresh = useRefreshShades();
  return useMutation({
    mutationFn: commitImport,
    onSuccess: async (result) => {
      await refresh();
      toast.success(`${result.imported} shades imported`);
    },
    onError: (error) => toast.error(apiError(error)),
  });
}

export type CatalogRecordMode = "brand" | "product" | "format";

export function useCreateCatalogRecord() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      mode,
      data,
    }: {
      mode: CatalogRecordMode;
      data: FormData;
    }) => {
      if (mode === "brand")
        return {
          mode: "brand" as const,
          record: await createBrand({
            name: String(data.get("name")).trim(),
            isOwn: data.get("isOwn") === "on",
          }),
        };
      if (mode === "format")
        return {
          mode: "format" as const,
          record: await createFormat({
            name: String(data.get("parent")).trim(),
            items: [
              {
                name: String(data.get("name")).trim(),
                code: String(data.get("code")).trim(),
              },
            ],
          }),
        };
      return {
        mode: "product" as const,
        record: await createProduct({
          brandId: String(data.get("brandId")),
          productFormatItemId: Number(data.get("productFormatItemId")),
          name: String(data.get("name")).trim(),
        }),
      };
    },
    onSuccess: async (result) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["brands"] }),
        queryClient.invalidateQueries({ queryKey: ["products"] }),
        queryClient.invalidateQueries({ queryKey: ["product-formats"] }),
      ]);
      toast.success(
        `${result.mode[0].toUpperCase() + result.mode.slice(1)} created`,
      );
    },
    onError: (error) => toast.error(apiError(error)),
  });
}
