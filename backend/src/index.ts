import mongoose from "mongoose";
import { createApp } from "./app.js";
import { config } from "./config.js";

await mongoose.connect(config.MONGODB_URI);
const app = await createApp();
app.listen(config.PORT, "0.0.0.0", () => {
  console.log(`PCFS API listening on http://localhost:${config.PORT}`);
});
