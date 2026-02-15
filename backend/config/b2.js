import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";

// Support both B2_APPLICATION_KEY and B2_APPLICATION_KEY_SECRET (Backblaze secret)
const getB2Secret = () =>
  process.env.B2_APPLICATION_KEY || process.env.B2_APPLICATION_KEY_SECRET;

const getB2Config = () => ({
  applicationKeyId: process.env.B2_APPLICATION_KEY_ID,
  applicationKey: getB2Secret(),
  bucketName: process.env.B2_BUCKET_NAME,
  region: process.env.B2_REGION || "us-west-004",
});

export const isB2Configured = (() => {
  const { applicationKeyId, applicationKey, bucketName } = getB2Config();
  return Boolean(applicationKeyId && applicationKey && bucketName);
})();

function getB2Client() {
  const { applicationKeyId, applicationKey, bucketName, region } = getB2Config();
  if (!applicationKeyId || !applicationKey || !bucketName) {
    throw new Error(
      "B2 is not configured. Set B2_APPLICATION_KEY_ID, B2_APPLICATION_KEY (or B2_APPLICATION_KEY_SECRET), and B2_BUCKET_NAME in .env"
    );
  }
  const endpoint = `https://s3.${region}.backblazeb2.com`;
  return new S3Client({
    region,
    endpoint,
    credentials: {
      accessKeyId: applicationKeyId,
      secretAccessKey: applicationKey,
    },
  });
}

let b2Client = null;
if (isB2Configured) {
  try {
    b2Client = getB2Client();
  } catch (e) {
    console.warn("B2 config present but client init failed:", e.message);
  }
}

/**
 * Upload a file buffer to B2.
 */
export async function uploadToB2(buffer, key, contentType = "application/pdf") {
  const client = b2Client || getB2Client();
  const { bucketName } = getB2Config();
  await client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );
  return key;
}

/**
 * Delete an object from B2 by key.
 */
export async function deleteFromB2(key) {
  const client = b2Client || getB2Client();
  const { bucketName } = getB2Config();
  await client.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    }),
  );
}

/**
 * Get the public URL for a B2 object. Set B2_PUBLIC_URL in .env to your bucket's
 * public URL (e.g. from B2 bucket settings → Bucket Settings → Friendly URL).
 */
export function getB2PublicUrl(key) {
  const base = process.env.B2_PUBLIC_URL;
  if (!base) return null;
  const normalized = base.replace(/\/$/, "");
  return `${normalized}/${key}`;
}

/**
 * Get a readable stream of a B2 object (for serving the file).
 */
export async function getObjectFromB2(key) {
  const client = b2Client || getB2Client();
  const { bucketName } = getB2Config();
  const response = await client.send(
    new GetObjectCommand({
      Bucket: bucketName,
      Key: key,
    }),
  );
  return response;
}

export { b2Client };
