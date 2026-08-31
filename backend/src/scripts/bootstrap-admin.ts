import mongoose from "mongoose";
import { z } from "zod";
import { config } from "../config.js";
import { UserModel } from "../models.js";
import { createUser } from "../services/auth.service.js";
import { Role } from "../types.js";

const input = z.object({ email: z.string().email(), name: z.string().min(2), password: z.string().min(12) }).parse({ email: process.env.ADMIN_EMAIL, name: process.env.ADMIN_NAME, password: process.env.ADMIN_PASSWORD });
await mongoose.connect(config.MONGODB_URI);
if (await UserModel.exists({})) throw new Error("Administrator bootstrap is disabled because at least one user already exists");
const user = await createUser({ ...input, role: Role.SUPER_ADMIN });
console.log(`Created one-time super administrator: ${user.email}`);
await mongoose.disconnect();
