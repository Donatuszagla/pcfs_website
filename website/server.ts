import compression from "compression";
import express from "express";
import fs from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createServer as createViteServer, type ViteDevServer } from "vite";
import { loadSiteData } from "./src/data.js";

const root = process.cwd();
const production = process.env.NODE_ENV === "production";
const port = Number(readArg("--port") ?? process.env.PORT ?? 4173);
const host = readArg("--host") ?? process.env.HOST ?? "0.0.0.0";

/** Creates and starts the PCFS SSR website server. */
async function startServer(): Promise<void> {
  const app = express();
  let vite: ViteDevServer | undefined;
  const siteUrl = (process.env.PUBLIC_SITE_URL ?? "https://pcfs.example").replace(/\/$/, "");
  app.use(compression());

  if (!production) {
    vite = await createViteServer({ root, server: { middlewareMode: true }, appType: "custom" });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(root, "dist/client"), { index: false, maxAge: "1y" }));
  }

  app.get("/robots.txt", (_request, response) => response.type("text/plain").send(`User-agent: *\nAllow: /\nSitemap: ${siteUrl}/sitemap.xml\n`));
  app.get("/sitemap.xml", async (_request, response) => {
    const data = await loadSiteData();
    const paths = ["/", "/about", "/branches", "/media", "/events", "/contact", "/privacy", "/terms", ...data.branches.map((item) => `/branches/${item.slug}`), ...data.events.map((item) => `/events/${item.slug}`), ...data.media.map((item) => `/media/${item.slug}`)];
    response.type("application/xml").send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((item) => `<url><loc>${siteUrl}${item}</loc></url>`).join("")}</urlset>`);
  });

  app.use(async (request, response, next) => {
    try {
      const url = request.originalUrl;
      let template = await fs.readFile(path.join(root, production ? "dist/client/index.html" : "index.html"), "utf8");
      if (vite) template = await vite.transformIndexHtml(url, template);
      const renderer = production ? await import(pathToFileURL(path.join(root, "dist/ssr/entry-server.js")).href) : await vite!.ssrLoadModule("/src/entry-server.tsx");
      const data = await loadSiteData();
      const rendered = await renderer.render(url, data) as { html: string; head: string };
      const serializedData = JSON.stringify(data).replace(/</g, "\\u003c");
      response.status(isKnownPath(url, data) ? 200 : 404).type("html").send(template.replace("<!--app-head-->", rendered.head).replace("<!--app-html-->", rendered.html).replace("<!--app-data-->", serializedData));
    } catch (error) {
      vite?.ssrFixStacktrace(error as Error);
      next(error);
    }
  });

  app.listen(port, host, () => console.log(`PCFS website listening on http://${host}:${port}`));
}

function isKnownPath(url: string, data: Awaited<ReturnType<typeof loadSiteData>>): boolean {
  const pathname = url.split("?")[0];
  const staticPaths = new Set(["/", "/about", "/branches", "/media", "/events", "/contact", "/privacy", "/terms", "/robots.txt", "/sitemap.xml"]);
  return staticPaths.has(pathname) || data.branches.some((item) => pathname === `/branches/${item.slug}`) || data.events.some((item) => pathname === `/events/${item.slug}`) || data.media.some((item) => pathname === `/media/${item.slug}`);
}

function readArg(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

void startServer();
