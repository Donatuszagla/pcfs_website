import type { Model } from "mongoose";
import { BranchModel, EventModel, FormSubmissionModel, LeaderModel, MediaCategoryModel, MediaModel, MinistryModel, PageModel, SiteSettingsModel, UserModel } from "../models.js";
import { type Actor, type ContentKind } from "../types.js";
import { requirePermission } from "./permissions.js";

const registry: Record<ContentKind, Model<any>> = {
  PAGE: PageModel, LEADER: LeaderModel, BRANCH: BranchModel, MINISTRY: MinistryModel, EVENT: EventModel, MEDIA: MediaModel, MEDIA_CATEGORY: MediaCategoryModel, SITE_SETTINGS: SiteSettingsModel, SUBMISSION: FormSubmissionModel, USER: UserModel,
};

/** Loads published content for the public website in one stable payload. */
export async function getPublicSite(): Promise<Record<string, unknown>> {
  const [settings, pages, branches, events, media, leaders, ministries] = await Promise.all([
    SiteSettingsModel.findOne({ status: "PUBLISHED" }).lean(),
    PageModel.find({ status: "PUBLISHED" }).sort({ title: 1 }).lean(),
    BranchModel.find({ status: "PUBLISHED" }).sort({ order: 1, name: 1 }).lean(),
    EventModel.find({ status: "PUBLISHED" }).sort({ startAt: 1 }).lean(),
    MediaModel.find({ status: "PUBLISHED" }).sort({ featured: -1, publishedAt: -1 }).lean(),
    LeaderModel.find({ status: "PUBLISHED" }).sort({ order: 1 }).lean(),
    MinistryModel.find({ status: "PUBLISHED" }).sort({ order: 1 }).lean(),
  ]);
  return { settings, pages, branches, events, media, leaders, ministries };
}

/** Lists CMS records for a permitted domain with bounded pagination and optional text search. */
export async function listAdminRecords(actor: Actor, data: { kind: ContentKind; search?: string; limit?: number; after?: string }): Promise<unknown[]> {
  requirePermission(actor.role, data.kind);
  const model = registry[data.kind];
  const filter: Record<string, unknown> = {};
  if (data.after) filter._id = { $lt: data.after };
  if (data.search && ["MEDIA"].includes(data.kind)) filter.$text = { $search: data.search };
  else if (data.search) filter.$or = [{ name: { $regex: escapeRegExp(data.search), $options: "i" } }, { title: { $regex: escapeRegExp(data.search), $options: "i" } }];
  return model.find(filter).sort({ _id: -1 }).limit(Math.min(data.limit ?? 50, 100)).lean();
}

/** Creates or updates one domain-owned CMS record. */
export async function saveContent(actor: Actor, data: { kind: ContentKind; id?: string; values: Record<string, unknown> }): Promise<unknown> {
  requirePermission(actor.role, data.kind);
  if (["USER", "SUBMISSION"].includes(data.kind)) throw new Error("Use the dedicated workflow for this record type");
  const model = registry[data.kind];
  const values = sanitizeValues(data.values);
  validateDomainValues(data.kind, values);
  if (data.id) return model.findByIdAndUpdate(data.id, { $set: values }, { new: true, runValidators: true }).lean();
  return (await model.create(values)).toObject();
}

/** Classifies an event relative to a supplied instant for stable filtering and tests. */
export function classifyEvent(startAt: Date | string, endAt: Date | string, now = new Date()): "UPCOMING" | "ONGOING" | "PAST" {
  const start = new Date(startAt).getTime();
  const end = new Date(endAt).getTime();
  if (end < now.getTime()) return "PAST";
  if (start <= now.getTime()) return "ONGOING";
  return "UPCOMING";
}

/** Publishes a CMS record while preserving its earlier draft history in timestamps. */
export async function publishContent(actor: Actor, data: { kind: ContentKind; id: string }): Promise<unknown> {
  requirePermission(actor.role, data.kind);
  if (["USER", "SUBMISSION"].includes(data.kind)) throw new Error("This record cannot be published");
  return registry[data.kind].findByIdAndUpdate(data.id, { $set: { status: "PUBLISHED", publishedAt: new Date() } }, { new: true }).lean();
}

/** Archives a CMS record without permanently deleting it. */
export async function archiveContent(actor: Actor, data: { kind: ContentKind; id: string }): Promise<unknown> {
  requirePermission(actor.role, data.kind);
  if (["USER", "SUBMISSION"].includes(data.kind)) throw new Error("This record uses a dedicated lifecycle");
  return registry[data.kind].findByIdAndUpdate(data.id, { $set: { status: "ARCHIVED" } }, { new: true }).lean();
}

/** Reorders records in a domain using explicit IDs and stable integer positions. */
export async function reorderContent(actor: Actor, data: { kind: ContentKind; ids: string[] }): Promise<boolean> {
  requirePermission(actor.role, data.kind);
  await registry[data.kind].bulkWrite(data.ids.map((id, index) => ({ updateOne: { filter: { _id: id }, update: { $set: { order: index } } } })));
  return true;
}

function sanitizeValues(values: Record<string, unknown>): Record<string, unknown> {
  const blocked = new Set(["_id", "createdAt", "updatedAt", "passwordHash", "notificationError"]);
  return Object.fromEntries(Object.entries(values).filter(([key]) => !blocked.has(key)));
}

function validateDomainValues(kind: ContentKind, values: Record<string, unknown>): void {
  if (kind === "MEDIA" && typeof values.externalUrl === "string" && values.externalUrl) {
    const host = new URL(values.externalUrl).hostname.replace(/^www\./, "");
    const approvedHosts = ["youtube.com", "youtu.be", "vimeo.com", "soundcloud.com", "facebook.com"];
    if (!approvedHosts.some((approved) => host === approved || host.endsWith(`.${approved}`))) throw new Error("Media embeds must use an approved provider");
  }
  if (kind === "EVENT" && typeof values.registrationUrl === "string" && values.registrationUrl && new URL(values.registrationUrl).protocol !== "https:") throw new Error("Registration links must use HTTPS");
  if (kind === "PAGE" && Array.isArray(values.sections)) {
    const allowed = new Set(["HOME_COMPOSITION", "HERO", "RICH_TEXT", "CARD_GRID", "CTA", "MEDIA_GRID", "EVENT_LIST", "BRANCH_LIST", "LEADER_LIST"]);
    for (const section of values.sections) {
      if (!section || typeof section !== "object" || !allowed.has(String((section as Record<string, unknown>).type))) throw new Error("Page contains an unsupported section type");
    }
  }
}

function escapeRegExp(value: string): string { return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
