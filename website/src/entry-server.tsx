import { PassThrough } from "node:stream";
import { createElement } from "react";
import { renderToPipeableStream } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { App } from "./App";
import type { SiteData } from "./types";

export interface RenderResult {
  html: string;
  head: string;
}

/** Returns route-specific metadata for server-rendered public pages. */
export function buildHead(url: string, data: SiteData): string {
  const cleanPath = url.split("?")[0];
  const branch = data.branches.find((item) => cleanPath === `/branches/${item.slug}`);
  const event = data.events.find((item) => cleanPath === `/events/${item.slug}`);
  const media = data.media.find((item) => cleanPath === `/media/${item.slug}`);
  const titles: Record<string, string> = {
    "/": `${data.settings.name} | Official Website`,
    "/about": `About Us | ${data.settings.shortName}`,
    "/branches": `Branches | ${data.settings.shortName}`,
    "/media": `Media | ${data.settings.shortName}`,
    "/events": `Events | ${data.settings.shortName}`,
    "/contact": `Contact Us | ${data.settings.shortName}`,
    "/privacy": `Privacy Policy | ${data.settings.shortName}`,
    "/terms": `Website Terms | ${data.settings.shortName}`,
  };
  const title = branch?.name ?? event?.title ?? media?.title ?? titles[cleanPath] ?? `Page Not Found | ${data.settings.shortName}`;
  const description = branch?.description ?? event?.description ?? media?.description ?? data.settings.description;
  const canonicalPath = cleanPath === "/" ? "" : cleanPath;
  const siteUrl = (process.env.PUBLIC_SITE_URL ?? "https://pcfs.example").replace(/\/$/, "");
  const structuredData = event ? { "@context": "https://schema.org", "@type": "Event", name: event.title, description: event.description, startDate: event.startAt, endDate: event.endAt, location: { "@type": "Place", name: event.venue } } : { "@context": "https://schema.org", "@type": "Church", name: data.settings.name, description: data.settings.description };
  return [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<link rel="canonical" href="${siteUrl}${canonicalPath}" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:image" content="${siteUrl}${event?.image ?? media?.image ?? branch?.image ?? "/images/hero-congregation.png"}" />`,
    `<script id="pcfs-route-schema" type="application/ld+json">${JSON.stringify(structuredData)}</script>`,
  ].join("\n");
}

/** Streams the React tree into a string for insertion into Vite's HTML template. */
export async function render(url: string, data: SiteData): Promise<RenderResult> {
  const html = await new Promise<string>((resolve, reject) => {
    const chunks: Buffer[] = [];
    const output = new PassThrough();
    output.on("data", (chunk: Buffer) => chunks.push(chunk));
    output.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    output.on("error", reject);
    const stream = renderToPipeableStream(
      createElement(StaticRouter, { location: url }, createElement(App, { data })),
      {
        onAllReady() { stream.pipe(output); },
        onShellError: reject,
        onError: reject,
      },
    );
  });
  return { html, head: buildHead(url, data) };
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]!);
}
