import mongoose from "mongoose";
import { config } from "../config.js";
import { BranchModel, EventModel, LeaderModel, MediaCategoryModel, MediaModel, MinistryModel, PageModel, SiteSettingsModel } from "../models.js";
import { seedData } from "../seed-data.js";

await mongoose.connect(config.MONGODB_URI);
await Promise.all([
  SiteSettingsModel.findOneAndUpdate({ key: seedData.settings.key }, { $set: seedData.settings }, { upsert: true }),
  ...seedData.pages.map((record) => PageModel.findOneAndUpdate({ slug: record.slug }, { $set: record }, { upsert: true })),
  ...seedData.branches.map((record) => BranchModel.findOneAndUpdate({ slug: record.slug }, { $set: record }, { upsert: true })),
  ...seedData.events.map((record) => EventModel.findOneAndUpdate({ slug: record.slug }, { $set: record }, { upsert: true })),
  ...seedData.media.map((record) => MediaModel.findOneAndUpdate({ slug: record.slug }, { $set: record }, { upsert: true })),
  ...seedData.leaders.map((record) => LeaderModel.findOneAndUpdate({ name: record.name }, { $set: record }, { upsert: true })),
  ...seedData.ministries.map((record) => MinistryModel.findOneAndUpdate({ slug: record.slug }, { $set: record }, { upsert: true })),
  ...seedData.categories.map((record) => MediaCategoryModel.findOneAndUpdate({ slug: record.slug }, { $set: record }, { upsert: true })),
]);
console.log("PCFS content seed completed.");
await mongoose.disconnect();
