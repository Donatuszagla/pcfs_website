import { Router } from "express";
import multer from "multer";
import { actorFromAccessToken } from "./services/auth.service.js";
import { isAudioMime, isVideoMime, storeAudio, storeImage, storeVideo } from "./services/upload.service.js";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 500 * 1024 * 1024 } });

/** Creates the authenticated asset upload router used by the CMS. */
export function createUploadRouter(): Router {
  const router = Router();

  // Helper to store an individual file based on its mime type
  async function processUploadFile(actor: any, file: Express.Multer.File, rawAlt?: string) {
    const title = (rawAlt || file.originalname || "Asset").replace(/\.[^/.]+$/, "").trim();
    if (isAudioMime(file.mimetype)) {
      return storeAudio(actor, file, title);
    }
    if (isVideoMime(file.mimetype)) {
      return storeVideo(actor, file, title);
    }
    return storeImage(actor, file, title || "Asset");
  }

  // Single file upload
  router.post("/", upload.single("file"), async (request, response, next) => {
    try {
      const actor = actorFromAccessToken(request.header("authorization")?.replace(/^Bearer\s+/i, ""));
      if (!actor) {
        console.warn("[BACKEND:UPLOAD] [UNAUTHORIZED] Upload attempted without valid token");
        return response.status(401).json({ error: "Authentication is required" });
      }
      if (!request.file) {
        console.warn(`[BACKEND:UPLOAD] [BAD_REQUEST] User ${actor.email} attempted upload without file`);
        return response.status(400).json({ error: "A file is required" });
      }

      console.log(`[BACKEND:UPLOAD] [START] User ${actor.email} uploading "${request.file.originalname}" (${(request.file.size / 1024).toFixed(1)} KB, ${request.file.mimetype})`);

      const rawTitle = String(request.body.alt ?? request.body.title ?? "");
      const asset = await processUploadFile(actor, request.file, rawTitle);
      console.log(`[BACKEND:UPLOAD] [SUCCESS] Asset stored: ${asset.url}`);
      return response.status(201).json({ asset });
    } catch (error) {
      console.error(`[BACKEND:UPLOAD] [ERROR] Asset upload failed:`, error);
      next(error);
    }
  });

  // Batch multi-file upload for plenty pictures and videos
  router.post("/batch", upload.array("files", 50), async (request, response, next) => {
    try {
      const actor = actorFromAccessToken(request.header("authorization")?.replace(/^Bearer\s+/i, ""));
      if (!actor) {
        return response.status(401).json({ error: "Authentication is required" });
      }
      const files = (request.files as Express.Multer.File[]) || [];
      if (!files.length) {
        return response.status(400).json({ error: "At least one file is required for batch upload" });
      }

      console.log(`[BACKEND:UPLOAD:BATCH] [START] User ${actor.email} batch uploading ${files.length} files`);
      const assets: Record<string, unknown>[] = [];
      const errors: { filename: string; error: string }[] = [];

      for (const file of files) {
        try {
          const asset = await processUploadFile(actor, file, file.originalname);
          assets.push(asset);
          console.log(`[BACKEND:UPLOAD:BATCH] [SUCCESS] ${file.originalname} -> ${asset.url}`);
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : "Upload failed";
          console.error(`[BACKEND:UPLOAD:BATCH] [FAILED] ${file.originalname}: ${errMsg}`);
          errors.push({ filename: file.originalname, error: errMsg });
        }
      }

      return response.status(201).json({
        assets,
        errors,
        total: files.length,
        succeeded: assets.length,
      });
    } catch (error) {
      console.error(`[BACKEND:UPLOAD:BATCH] [ERROR] Batch upload failed:`, error);
      next(error);
    }
  });

  return router;
}
