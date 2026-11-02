import type {
  ImportPreview,
  ImportResult,
} from "@color-bank-hub/contracts/import";
import { post } from "@/services/http";

export const importsApi = {
  previewImport: (rows: unknown[]) =>
    post<ImportPreview>("/imports/preview", { rows }),
  commitImport: (rows: unknown[]) =>
    post<ImportResult>("/imports/commit", { rows }),
};
