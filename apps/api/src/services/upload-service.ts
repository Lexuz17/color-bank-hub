import { can, type Role } from "@color-bank-hub/contracts/rbac";
import {
  checkUpload,
  type UploadPurpose,
  type UploadRequest,
  type UploadTicket,
  uploadRules,
} from "@color-bank-hub/contracts/upload";
import { randomUUID } from "node:crypto";
import { fail } from "#api/core/errors.js";
import {
  headObject,
  presignDownload,
  presignUpload,
} from "#api/lib/storage.js";

// check access, pick a unique key, return a presigned PUT URL.
export async function createUpload(
  { purpose, contentType, size }: UploadRequest,
  role: Role,
): Promise<UploadTicket> {
  if (!can(role, uploadRules[purpose].permission))
    fail(
      "FORBIDDEN",
      "You do not have permission for this action",
      "MISSING_PERMISSION",
    );
  const problem = checkUpload(purpose, { contentType, size });
  if (problem) fail("VALIDATION_ERROR", problem, "FILE_REJECTED");
  const key = `${purpose}/${randomUUID()}.${contentType.split("/")[1]}`;
  return { key, uploadUrl: await presignUpload(key, contentType, size) };
}

// before saving a key: it must belong to this purpose and exist in storage.
export async function verifyUpload(key: string, purpose: UploadPurpose) {
  if (!key.startsWith(`${purpose}/`))
    fail(
      "BUSINESS_RULE",
      "File was uploaded for another module",
      "UPLOAD_PURPOSE_MISMATCH",
    );
  const object = await headObject(key);
  if (!object)
    fail("BUSINESS_RULE", "Upload the file before saving", "UPLOAD_NOT_FOUND");
  const problem = checkUpload(purpose, {
    contentType: object.contentType ?? "",
    size: object.size,
  });
  if (problem) fail("BUSINESS_RULE", problem, "UPLOAD_INVALID");
}

// Stored key to a short-lived link for responses; null stays null.
export async function getFileUrl(key: string | null) {
  return key ? presignDownload(key) : null;
}
