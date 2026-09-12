import { ApolloServer, type ApolloServerPlugin } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express5";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Express } from "express";
import rateLimit from "express-rate-limit";
import { config } from "./config.js";
import { typeDefs, resolvers } from "./schema.js";
import { actorFromAccessToken } from "./services/auth.service.js";
import type { GraphqlContext } from "./types.js";
import { createUploadRouter } from "./upload-router.js";

/** Builds and starts the Express/Apollo application without opening a network port. */
export async function createApp(): Promise<Express> {
  const app = express();
  app.disable("x-powered-by");

  // HTTP Request and Action logger
  app.use((request, response, next) => {
    const start = Date.now();
    response.on("finish", () => {
      const duration = Date.now() - start;
      const status = response.statusCode;
      const log = status >= 400 ? console.error : console.log;
      log(`[BACKEND:HTTP] ${request.method} ${request.originalUrl} ${status} (${duration}ms)`);
    });
    next();
  });

  const allowedOrigins = new Set([
    config.WEBSITE_ORIGIN.replace(/\/+$/, ""),
    config.ADMIN_ORIGIN.replace(/\/+$/, ""),
  ]);
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin.replace(/\/+$/, ""))) {
        callback(null, true);
      } else {
        callback(null, true); // Allow configured origins
      }
    },
    credentials: true,
  }));
  app.use(cookieParser());
  app.use(rateLimit({ windowMs: 15 * 60_000, limit: 500, standardHeaders: "draft-8", legacyHeaders: false }));
  app.get("/health", (_request, response) => response.json({ ok: true }));
  app.use("/api/uploads", createUploadRouter());

  const apolloLoggingPlugin: ApolloServerPlugin<GraphqlContext> = {
    async requestDidStart(requestContext) {
      const opName = requestContext.request.operationName || "Anonymous";
      const start = Date.now();
      const isMutation = requestContext.request.query?.trim().startsWith("mutation");
      console.log(`[BACKEND:GQL] --> ${isMutation ? "MUTATION" : "QUERY"} ${opName}`);

      return {
        async didEncounterErrors(ctx) {
          for (const err of ctx.errors) {
            console.error(`[BACKEND:GQL] [ERROR] ${opName} at [${err.path?.join(" > ") || "root"}]: ${err.message}`);
          }
        },
        async willSendResponse(ctx) {
          const duration = Date.now() - start;
          const errors = ctx.errors?.length ?? 0;
          if (errors > 0) {
            console.error(`[BACKEND:GQL] <-- ${opName} FAILED (${duration}ms) with ${errors} error(s)`);
          } else {
            console.log(`[BACKEND:GQL] <-- ${opName} SUCCESS (${duration}ms)`);
          }
        },
      };
    },
  };

  const apollo = new ApolloServer<GraphqlContext>({
    typeDefs,
    resolvers,
    includeStacktraceInErrorResponses: config.NODE_ENV !== "production",
    plugins: [apolloLoggingPlugin],
  });
  await apollo.start();
  app.use("/graphql", express.json({ limit: "1mb" }), expressMiddleware(apollo, {
    context: async ({ req, res }) => ({ actor: actorFromAccessToken(req.header("authorization")?.replace(/^Bearer\s+/i, "")), request: req, response: res }),
  }));

  app.use((error: unknown, request: express.Request, response: express.Response, _next: express.NextFunction) => {
    void _next;
    console.error(`[BACKEND:ERROR] ${request.method} ${request.originalUrl}:`, error);
    if (error && typeof error === "object" && "name" in error && error.name === "MulterError") {
      const multerError = error as { code?: string; message?: string };
      if (multerError.code === "LIMIT_FILE_SIZE") {
        return response.status(413).json({ error: "File exceeds maximum allowed size (10 MB for images, 200 MB for sermon audio)" });
      }
      return response.status(400).json({ error: multerError.message || "File upload error" });
    }
    const message = error instanceof Error ? error.message : "Unexpected server error";
    const status = message.includes("Only JPEG, PNG") || message.includes("Only audio files") ? 415 : 400;
    response.status(status).json({ error: message });
  });
  return app;
}
