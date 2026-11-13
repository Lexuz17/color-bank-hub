import {
  checkUpload,
  type UploadPurpose,
  type UploadTicket,
} from "@color-bank-hub/contracts/upload";
import axios from "axios";
import { post } from "./http";

/**
 * Uploads a file straight to storage and returns its key.
 * Save the key in the form payload (e.g. `lipPhotoKey`), never a URL.
 */
export async function uploadFile(
  file: File,
  purpose: UploadPurpose,
  onProgress?: (percent: number) => void,
) {
  const problem = checkUpload(purpose, {
    contentType: file.type,
    size: file.size,
  });

  if (problem) throw new Error(problem);
  const ticket = await post<UploadTicket>("/uploads", {
    purpose,
    contentType: file.type,
    size: file.size,
  });

  await axios.put(ticket.uploadUrl, file, {
    headers: { "Content-Type": file.type },
    onUploadProgress: (event) =>
      event.total &&
      onProgress?.(Math.round((event.loaded / event.total) * 100)),
  });
  return ticket.key;
}
