import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "#api/env.js";

const { bucket, endpoint, region, ...credentials } = env.s3;

const s3 = new S3Client({
  endpoint,
  region,
  credentials,
  // Otherwise presigned PUTs carry a CRC32 of an empty body and storage rejects the upload.
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

const UPLOAD_URL_TTL = 5 * 60;
const DOWNLOAD_URL_TTL = 60 * 60;

/** Presigned PUT. The browser must send exactly this Content-Type and size. */
export function presignUpload(key: string, contentType: string, size: number) {
  return getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
      ContentLength: size,
    }),
    {
      expiresIn: UPLOAD_URL_TTL,
      signableHeaders: new Set(["content-type", "content-length"]),
    },
  );
}

/** Presigned GET for showing a private object. */
export function presignDownload(key: string) {
  return getSignedUrl(s3, new GetObjectCommand({ Bucket: bucket, Key: key }), {
    expiresIn: DOWNLOAD_URL_TTL,
  });
}

/** Object metadata, or null when the key does not exist. */
export async function headObject(key: string) {
  try {
    const head = await s3.send(
      new HeadObjectCommand({ Bucket: bucket, Key: key }),
    );
    return { size: head.ContentLength ?? 0, contentType: head.ContentType };
  } catch (error) {
    const status = (error as { $metadata?: { httpStatusCode?: number } })
      .$metadata?.httpStatusCode;
    if (status === 404) return null;
    throw error;
  }
}

export async function deleteObject(key: string) {
  await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
}
