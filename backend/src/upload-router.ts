import { Router } from "express";
import multer from "multer";
import { actorFromAccessToken } from "./services/auth.service.js";
import { isAudioMime, storeAudio, storeImage } from "./services/upload.service.js";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 200 * 1024 * 1024, files: 1 } });

/** Creates the authenticated asset upload router used by the CMS. */
export function createUploadRouter(): Router {
  const router = Router();
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

      if (isAudioMime(request.file.mimetype)) {
        const title = String(request.body.alt ?? request.body.title ?? "");
        const asset = await storeAudio(actor, request.file, title);
        console.log(`[BACKEND:UPLOAD] [SUCCESS] Audio asset stored: ${asset.url}`);
        return response.status(201).json({ asset });
      }

      const asset = await storeImage(actor, request.file, String(request.body.alt ?? ""));
      console.log(`[BACKEND:UPLOAD] [SUCCESS] Image asset stored: ${asset.url}`);
      return response.status(201).json({ asset });
    } catch (error) {
      console.error(`[BACKEND:UPLOAD] [ERROR] Asset upload failed:`, error);
      next(error);
    }
  });
  return router;
}
