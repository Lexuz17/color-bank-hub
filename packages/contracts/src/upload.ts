import { z } from "zod";
import type { Permission } from "./rbac.js";

const MB = 1024 * 1024;
const images = ["image/jpeg", "image/png", "image/webp"];

// One rule per upload purpose
export const uploadRules = {
  "shade-photo": {
    types: images,
    maxBytes: 5 * MB,
    permission: "catalog:write",
  },
  "report-attachment": {
    types: [...images, "application/pdf"],
    maxBytes: 10 * MB,
    permission: "report:create",
  },
  "prototype-result": {
    types: images,
    maxBytes: 5 * MB,
    permission: "prototype:process",
  },
} satisfies Record<
  string,
  { types: string[]; maxBytes: number; permission: Permission }
>;

export type UploadPurpose = keyof typeof uploadRules;

export function checkUpload(
  purpose: UploadPurpose,
  file: { contentType: string; size: number },
) {
  const rule = uploadRules[purpose];
  if (!rule.types.includes(file.contentType))
    return `File type must be one of: ${rule.types.join(", ")}`;
  if (file.size > rule.maxBytes)
    return `File must be ${rule.maxBytes / MB} MB or smaller`;
  return null;
}

const purposes = Object.keys(uploadRules) as UploadPurpose[]; //get keys  -> ["shade-photo", "report-attachment", "prototype-result"]

export const uploadRequest = z
  .object({
    purpose: z.enum(purposes),
    contentType: z.string(),
    size: z.number().int().positive(),
  })
  .strict();
export type UploadRequest = z.infer<typeof uploadRequest>;

export interface UploadTicket {
  key: string;
  uploadUrl: string;
}
