import mongoose from "mongoose";
import { createApp } from "./app.js";
import { config } from "./config.js";

process.on("unhandledRejection", (reason) => {
  console.error("[BACKEND:FATAL] Unhandled Rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("[BACKEND:FATAL] Uncaught Exception:", error);
});

console.log("Connecting to MongoDB database...");
await mongoose.connect(config.MONGODB_URI);
console.log("Connected to MongoDB successfully.");
const app = await createApp();
app.listen(config.PORT, "0.0.0.0", () => {
  console.log(`PCFS API server running on http://localhost:${config.PORT}`);
});
