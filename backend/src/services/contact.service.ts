import crypto from "node:crypto";
import nodemailer from "nodemailer";
import { z } from "zod";
import { config } from "../config.js";
import { FormSubmissionModel } from "../models.js";
import type { Actor } from "../types.js";
import { requirePermission } from "./permissions.js";

const submissionSchema = z.object({ name: z.string().min(2).max(100), email: z.union([z.string().email(), z.literal("")]).optional(), phone: z.string().max(40).optional(), subject: z.string().min(2).max(120), message: z.string().min(10).max(5000), preferredContactMethod: z.string().max(40).optional(), captchaToken: z.string().min(1) }).refine((value) => Boolean(value.email || value.phone), { message: "Email or phone is required" });

/** Validates, stores and attempts delivery of a public contact submission. */
export async function submitContact(data: unknown): Promise<{ accepted: true; reference: string }> {
  const input = submissionSchema.parse(data);
  await verifyCaptcha(input.captchaToken);
  const reference = `PCFS-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${crypto.randomBytes(3).toString("hex").toUpperCase()}`;
  const submission = await FormSubmissionModel.create({ reference, name: input.name, email: input.email, phone: input.phone, subject: input.subject, message: input.message, preferredContactMethod: input.preferredContactMethod, notificationStatus: "PENDING" });
  await deliverSubmission(submission.id);
  return { accepted: true, reference };
}

/** Retries delivery for a failed contact notification after permission validation. */
export async function retryContact(actor: Actor, data: { id: string }): Promise<boolean> {
  requirePermission(actor.role, "SUBMISSION");
  await deliverSubmission(data.id);
  return true;
}

async function verifyCaptcha(token: string): Promise<void> {
  if (config.NODE_ENV !== "production" && token === "dev-bypass") return;
  if (!config.TURNSTILE_SECRET_KEY && token === "no-captcha") return;
  if (!config.TURNSTILE_SECRET_KEY) throw new Error("CAPTCHA is not configured");
  const response = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body: new URLSearchParams({ secret: config.TURNSTILE_SECRET_KEY, response: token }) });
  const result = await response.json() as { success?: boolean };
  if (!result.success) throw new Error("CAPTCHA verification failed");
}

async function deliverSubmission(id: string): Promise<void> {
  const submission = await FormSubmissionModel.findById(id);
  if (!submission) throw new Error("Submission not found");
  try {
    const transport = nodemailer.createTransport({ host: config.SMTP_HOST, port: config.SMTP_PORT, secure: false, auth: config.SMTP_USER ? { user: config.SMTP_USER, pass: config.SMTP_PASSWORD } : undefined });
    await transport.sendMail({ from: "PCFS Website <website@pcfs.local>", to: config.CONTACT_TO_EMAIL, replyTo: submission.email || undefined, subject: `[${submission.reference}] ${submission.subject}`, text: `Name: ${submission.name}\nEmail: ${submission.email || "Not provided"}\nPhone: ${submission.phone || "Not provided"}\n\n${submission.message}` });
    submission.notificationStatus = "SENT"; submission.notificationError = undefined;
  } catch (error) {
    submission.notificationStatus = "FAILED"; submission.notificationError = error instanceof Error ? error.message.slice(0, 500) : "Unknown mail error";
  }
  await submission.save();
}
