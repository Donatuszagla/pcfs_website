import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./auth.service.js";
import { submitContact } from "./contact.service.js";
import { classifyEvent, saveContent } from "./content.service.js";
import { storeAudio, storeImage } from "./upload.service.js";
import { Role } from "../types.js";

describe("security and validation services", () => {
  it("hashes passwords with Argon2id and verifies only the correct candidate", async () => {
    const hash = await hashPassword("a-long-example-password");
    expect(hash.startsWith("$argon2id$")).toBe(true);
    await expect(verifyPassword(hash, "a-long-example-password")).resolves.toBe(true);
    await expect(verifyPassword(hash, "wrong-password")).resolves.toBe(false);
  });

  it("rejects a failed CAPTCHA before persisting contact data", async () => {
    await expect(submitContact({ name: "Visitor", email: "visitor@example.org", subject: "Visit", message: "Please share the current service schedule.", captchaToken: "invalid-token" })).rejects.toThrow("CAPTCHA is not configured");
  });

  it("rejects unsupported media before connecting to object storage", async () => {
    const actor = { id: "507f1f77bcf86cd799439011", email: "media@example.org", role: Role.MEDIA_MANAGER };
    const file = { mimetype: "application/pdf", size: 120, buffer: Buffer.from("not-an-image") } as Express.Multer.File;
    await expect(storeImage(actor, file, "Event flyer")).rejects.toThrow("Only JPEG, PNG and WebP");
    await expect(storeImage(actor, { ...file, mimetype: "image/png" }, "")).rejects.toThrow("Alt text is required");
    await expect(storeAudio(actor, file, "Sermon audio")).rejects.toThrow("Only audio files");
  });

  it("classifies past, ongoing and upcoming event dates", () => {
    const now = new Date("2026-08-30T12:00:00Z");
    expect(classifyEvent("2026-08-01", "2026-08-02", now)).toBe("PAST");
    expect(classifyEvent("2026-08-30T10:00:00Z", "2026-08-30T14:00:00Z", now)).toBe("ONGOING");
    expect(classifyEvent("2026-09-18", "2026-09-20", now)).toBe("UPCOMING");
  });

  it("restricts media providers, registration links and page section types", async () => {
    const mediaActor = { id: "507f1f77bcf86cd799439011", email: "media@example.org", role: Role.MEDIA_MANAGER };
    const eventActor = { ...mediaActor, role: Role.EVENT_MANAGER };
    const contentActor = { ...mediaActor, role: Role.CONTENT_ADMIN };
    await expect(saveContent(mediaActor, { kind: "MEDIA", values: { title: "Unsafe", externalUrl: "https://unapproved.example/video" } })).rejects.toThrow("approved provider");
    await expect(saveContent(eventActor, { kind: "EVENT", values: { title: "Unsafe", registrationUrl: "http://example.org/register" } })).rejects.toThrow("HTTPS");
    await expect(saveContent(contentActor, { kind: "PAGE", values: { title: "Unsafe", sections: [{ type: "SCRIPT" }] } })).rejects.toThrow("unsupported section type");
  });
});
