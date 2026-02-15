/**
 * Object storage: Backblaze B2.
 * Set B2_APPLICATION_KEY_ID, B2_APPLICATION_KEY, B2_BUCKET_NAME (and B2_REGION) in .env.
 */
import {
  isB2Configured,
  uploadToB2,
  deleteFromB2,
  getB2PublicUrl,
  getObjectFromB2,
} from "./b2.js";

export const isStorageConfigured = isB2Configured;

export async function upload(buffer, key, contentType = "application/pdf") {
  if (!isB2Configured) throw new Error("B2 is not configured");
  return uploadToB2(buffer, key, contentType);
}

export async function deleteObject(key) {
  if (!isB2Configured) throw new Error("B2 is not configured");
  return deleteFromB2(key);
}

export function getPublicUrl(key) {
  return getB2PublicUrl(key);
}

export async function getObject(key) {
  if (!isB2Configured) throw new Error("B2 is not configured");
  return getObjectFromB2(key);
}
