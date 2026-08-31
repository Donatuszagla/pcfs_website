import mongoose, { model, Schema, type InferSchemaType } from "mongoose";
import { Role } from "./types.js";

const seoSchema = new Schema({ title: String, description: String, image: String }, { _id: false });
const baseOptions = { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } } as const;

const siteSettingsSchema = new Schema({ key: { type: String, default: "default", unique: true }, name: String, shortName: String, description: String, vision: String, mission: String, contactEmail: String, contactPhone: String, socialLinks: [{ label: String, url: String }], status: { type: String, default: "PUBLISHED" }, seo: seoSchema }, baseOptions);
const pageSchema = new Schema({ title: { type: String, required: true }, slug: { type: String, required: true, unique: true }, sections: [{ type: { type: String }, enabled: Boolean, order: Number, content: Schema.Types.Mixed }], status: { type: String, default: "DRAFT", index: true }, seo: seoSchema, publishedAt: Date }, baseOptions);
const leaderSchema = new Schema({ name: { type: String, required: true }, title: String, bio: String, portrait: String, order: { type: Number, default: 0 }, status: { type: String, default: "DRAFT", index: true }, publishedAt: Date }, baseOptions);
const branchSchema = new Schema({ name: { type: String, required: true }, slug: { type: String, required: true, unique: true }, region: String, city: String, location: String, description: String, serviceTimes: String, phone: String, directionsUrl: String, image: String, imageIsPlaceholder: { type: Boolean, default: true }, order: { type: Number, default: 0 }, status: { type: String, default: "DRAFT", index: true }, seo: seoSchema, publishedAt: Date }, baseOptions);
const ministrySchema = new Schema({ name: { type: String, required: true }, slug: { type: String, required: true, unique: true }, audience: String, description: String, leaderIds: [Schema.Types.ObjectId], order: { type: Number, default: 0 }, status: { type: String, default: "DRAFT", index: true }, publishedAt: Date }, baseOptions);
const eventSchema = new Schema({ title: { type: String, required: true }, slug: { type: String, required: true, unique: true }, theme: String, description: String, startAt: Date, endAt: Date, venue: String, speakers: [String], registrationUrl: String, image: String, featured: { type: Boolean, default: false }, status: { type: String, default: "DRAFT", index: true }, seo: seoSchema, publishedAt: Date }, baseOptions);
const mediaCategorySchema = new Schema({ name: { type: String, required: true }, slug: { type: String, required: true, unique: true }, status: { type: String, default: "DRAFT", index: true } }, baseOptions);
const mediaSchema = new Schema({ title: { type: String, required: true }, slug: { type: String, required: true, unique: true }, type: { type: String, enum: ["VIDEO", "AUDIO", "PHOTO"] }, speaker: String, category: String, description: String, publishedAt: Date, externalUrl: String, image: String, featured: { type: Boolean, default: false }, status: { type: String, default: "DRAFT", index: true }, seo: seoSchema }, baseOptions);
mediaSchema.index({ title: "text", speaker: "text", description: "text" });
const assetSchema = new Schema({ key: { type: String, required: true, unique: true }, url: String, mimeType: String, size: Number, width: Number, height: Number, alt: { type: String, required: true }, variants: [{ name: String, key: String, url: String, width: Number, height: Number }], uploadedBy: Schema.Types.ObjectId, archivedAt: Date }, baseOptions);
const formSubmissionSchema = new Schema({ reference: { type: String, required: true, unique: true }, name: String, email: String, phone: String, subject: String, message: String, preferredContactMethod: String, notificationStatus: { type: String, enum: ["PENDING", "SENT", "FAILED"], default: "PENDING", index: true }, notificationError: String, contactedAt: Date }, baseOptions);
const userSchema = new Schema({ email: { type: String, required: true, unique: true, lowercase: true }, name: { type: String, required: true }, passwordHash: { type: String, required: true }, role: { type: String, enum: Object.values(Role), required: true }, active: { type: Boolean, default: true }, lastLoginAt: Date }, baseOptions);
const refreshTokenSchema = new Schema({ userId: { type: Schema.Types.ObjectId, required: true, index: true }, tokenHash: { type: String, required: true, unique: true }, expiresAt: { type: Date, required: true, index: { expires: 0 } }, revokedAt: Date, replacedByHash: String }, baseOptions);

export const SiteSettingsModel = mongoose.models.SiteSettings ?? model("SiteSettings", siteSettingsSchema);
export const PageModel = mongoose.models.Page ?? model("Page", pageSchema);
export const LeaderModel = mongoose.models.Leader ?? model("Leader", leaderSchema);
export const BranchModel = mongoose.models.Branch ?? model("Branch", branchSchema);
export const MinistryModel = mongoose.models.Ministry ?? model("Ministry", ministrySchema);
export const EventModel = mongoose.models.Event ?? model("Event", eventSchema);
export const MediaCategoryModel = mongoose.models.MediaCategory ?? model("MediaCategory", mediaCategorySchema);
export const MediaModel = mongoose.models.Media ?? model("Media", mediaSchema);
export const AssetModel = mongoose.models.Asset ?? model("Asset", assetSchema);
export const FormSubmissionModel = mongoose.models.FormSubmission ?? model("FormSubmission", formSubmissionSchema);
export const UserModel = mongoose.models.User ?? model("User", userSchema);
export const RefreshTokenModel = mongoose.models.RefreshToken ?? model("RefreshToken", refreshTokenSchema);

export type UserRecord = InferSchemaType<typeof userSchema> & { _id: { toString(): string } };
