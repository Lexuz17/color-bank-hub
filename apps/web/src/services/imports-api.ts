import { post } from "@/services/http";
import type { ImportPreview, StoredShade } from "@/types/api";

export const importsApi = {
  previewImport: (rows: unknown[]) =>
    post<ImportPreview>("/imports/preview", { rows }),
  commitImport: (rows: unknown[]) =>
    post<{ imported: number; items: StoredShade[] }>("/imports/commit", {
      rows,
    }),
};
