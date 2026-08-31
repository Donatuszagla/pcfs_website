import "dotenv/config";
import { z } from "zod";

const schema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().default("mongodb://localhost:27017/pcfs"),
  WEBSITE_ORIGIN: z.string().default("http://localhost:4173"),
  ADMIN_ORIGIN: z.string().default("http://localhost:4174"),
  JWT_ACCESS_SECRET: z.string().min(24).default("development-access-secret-change-me"),
  JWT_REFRESH_SECRET: z.string().min(24).default("development-refresh-secret-change-me"),
  ACCESS_TOKEN_MINUTES: z.coerce.number().default(15),
  REFRESH_TOKEN_DAYS: z.coerce.number().default(7),
  TURNSTILE_SECRET_KEY: z.string().optional(),
  SMTP_HOST: z.string().default("localhost"),
  SMTP_PORT: z.coerce.number().default(1025),
  SMTP_USER: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  CONTACT_TO_EMAIL: z.string().email().default("admin@example.invalid"),
  MINIO_ENDPOINT: z.string().default("localhost"),
  MINIO_PORT: z.coerce.number().default(9000),
  MINIO_USE_SSL: z.coerce.boolean().default(false),
  MINIO_ACCESS_KEY: z.string().default("pcfsminio"),
  MINIO_SECRET_KEY: z.string().default("pcfsminiochange"),
  MINIO_BUCKET: z.string().default("pcfs-media"),
  PUBLIC_MEDIA_URL: z.string().default("http://localhost:9000/pcfs-media"),
});

export const config = schema.parse(process.env);
