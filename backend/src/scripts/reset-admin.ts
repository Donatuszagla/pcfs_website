import mongoose from "mongoose";
import { config } from "../config.js";
import { UserModel } from "../models.js";
import { hashPassword } from "../services/auth.service.js";

async function resetAdmin() {
  await mongoose.connect(config.MONGODB_URI);
  const email = process.env.ADMIN_EMAIL || "admin@pcfs.org";
  const password = process.env.ADMIN_PASSWORD || "AdminPassword123!";
  
  const hash = await hashPassword(password);
  
  const updated = await UserModel.findOneAndUpdate(
    { email: email.toLowerCase() },
    { $set: { passwordHash: hash, active: true, name: "PCFS Administrator", role: "SUPER_ADMIN" } },
    { upsert: true, new: true }
  );

  console.log(`Successfully reset administrator account!`);
  console.log(`Email: ${updated.email}`);
  console.log(`Password: ${password}`);
  
  await mongoose.disconnect();
}

resetAdmin().catch(console.error);
