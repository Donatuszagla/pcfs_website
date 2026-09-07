import crypto from "node:crypto";
import path from "node:path";
import { Client as MinioClient } from "minio";
import sharp from "sharp";
import { config } from "../config.js";
import { AssetModel } from "../models.js";
import type { Actor } from "../types.js";

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const minio = new MinioClient({ endPoint: config.MINIO_ENDPOINT, port: config.MINIO_PORT, useSSL: config.MINIO_USE_SSL, accessKey: config.MINIO_ACCESS_KEY, secretKey: config.MINIO_SECRET_KEY });

/** Validates and stores an uploaded image plus three responsive WebP variants. */
export async function storeImage(actor: Actor, file: Express.Multer.File, alt: string): Promise<Record<string, unknown>> {
  if (!alt.trim()) throw new Error("Alt text is required");
  if (!allowedMimeTypes.has(file.mimetype)) throw new Error("Only JPEG, PNG and WebP images are allowed");
  if (file.size > 10 * 1024 * 1024) throw new Error("Images must not exceed 10 MB");
  await ensureBucket();

  const metadata = await sharp(file.buffer).metadata();
  if (!metadata.width || !metadata.height) throw new Error("The uploaded image is invalid");
  const baseName = `${Date.now()}-${crypto.randomUUID()}`;
  const originalExtension = extensionForMime(file.mimetype);
  const originalKey = `original/${baseName}${originalExtension}`;
  await minio.putObject(config.MINIO_BUCKET, originalKey, file.buffer, file.size, { "Content-Type": file.mimetype });

  const variants = await Promise.all([480, 960, 1600].map(async (width) => {
    const output = await sharp(file.buffer).resize({ width, withoutEnlargement: true }).webp({ quality: 84 }).toBuffer({ resolveWithObject: true });
    const key = `responsive/${baseName}-${width}.webp`;
    await minio.putObject(config.MINIO_BUCKET, key, output.data, output.data.byteLength, { "Content-Type": "image/webp" });
    return { name: `${width}w`, key, url: publicUrl(key), width: output.info.width, height: output.info.height };
  }));

  const asset = await AssetModel.create({ key: originalKey, url: publicUrl(originalKey), mimeType: file.mimetype, size: file.size, width: metadata.width, height: metadata.height, alt: alt.trim(), variants, uploadedBy: actor.id });
  return asset.toObject();
}

async function ensureBucket(): Promise<void> {
  try {
    if (!(await minio.bucketExists(config.MINIO_BUCKET))) {
      await minio.makeBucket(config.MINIO_BUCKET);
    }
  } catch (error) {
    // Bucket already exists or provider manages bucket lifecycle
  }
  try {
    await minio.setBucketPolicy(config.MINIO_BUCKET, JSON.stringify({ Version: "2012-10-17", Statement: [{ Effect: "Allow", Principal: { AWS: ["*"] }, Action: ["s3:GetObject"], Resource: [`arn:aws:s3:::${config.MINIO_BUCKET}/*`] }] }));
  } catch (error) {
    // Bucket policy setting is optional or managed in Cloudflare Dashboard
  }
}

function publicUrl(key: string): string { return `${config.PUBLIC_MEDIA_URL.replace(/\/$/, "")}/${key}`; }
function extensionForMime(mimeType: string): string { return mimeType === "image/jpeg" ? ".jpg" : `.${path.extname(`image/${mimeType.split("/")[1]}`).slice(1)}`; }
