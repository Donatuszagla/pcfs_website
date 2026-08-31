import argon2 from "argon2";
import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { config } from "../config.js";
import { RefreshTokenModel, UserModel, type UserRecord } from "../models.js";
import { Role, type Actor } from "../types.js";

interface AccessPayload { sub: string; email: string; role: Role; type: "access"; }
interface RefreshPayload { sub: string; jti: string; type: "refresh"; }

/** Hashes a CMS password using Argon2id. */
export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, { type: argon2.argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 });
}

/** Verifies a candidate password without exposing hash details. */
export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  return argon2.verify(hash, password);
}

/** Authenticates a CMS user and issues a short-lived access token plus rotating refresh token. */
export async function login(data: { email: string; password: string }): Promise<{ actor: Actor; accessToken: string; refreshToken: string }> {
  const user = await UserModel.findOne({ email: data.email.toLowerCase(), active: true }).lean<UserRecord>();
  if (!user || !(await verifyPassword(user.passwordHash, data.password))) throw new Error("Invalid email or password");
  await UserModel.updateOne({ _id: user._id }, { $set: { lastLoginAt: new Date() } });
  return issueSession(user);
}

/** Rotates a valid refresh token and revokes the token that was presented. */
export async function rotateRefreshToken(rawToken: string): Promise<{ actor: Actor; accessToken: string; refreshToken: string }> {
  const payload = jwt.verify(rawToken, config.JWT_REFRESH_SECRET) as RefreshPayload;
  if (payload.type !== "refresh") throw new Error("Invalid refresh token");
  const currentHash = tokenHash(rawToken);
  const stored = await RefreshTokenModel.findOne({ tokenHash: currentHash, revokedAt: null, expiresAt: { $gt: new Date() } });
  if (!stored) throw new Error("Refresh token is expired or revoked");
  const user = await UserModel.findOne({ _id: payload.sub, active: true }).lean<UserRecord>();
  if (!user) throw new Error("User is unavailable");
  const next = await issueSession(user);
  await RefreshTokenModel.updateOne({ _id: stored._id }, { $set: { revokedAt: new Date(), replacedByHash: tokenHash(next.refreshToken) } });
  return next;
}

/** Revokes a refresh token if it exists. */
export async function logout(rawToken?: string): Promise<boolean> {
  if (!rawToken) return true;
  await RefreshTokenModel.updateOne({ tokenHash: tokenHash(rawToken), revokedAt: null }, { $set: { revokedAt: new Date() } });
  return true;
}

/** Resolves an access token to the actor subset allowed into domain services. */
export function actorFromAccessToken(rawToken?: string): Actor | undefined {
  if (!rawToken) return undefined;
  try {
    const payload = jwt.verify(rawToken, config.JWT_ACCESS_SECRET) as AccessPayload;
    if (payload.type !== "access") return undefined;
    return { id: payload.sub, email: payload.email, role: payload.role };
  } catch { return undefined; }
}

/** Creates a CMS user after service-level role validation. */
export async function createUser(data: { email: string; name: string; password: string; role: Role }): Promise<{ id: string; email: string; name: string; role: Role }> {
  const user = await UserModel.create({ email: data.email.toLowerCase(), name: data.name, passwordHash: await hashPassword(data.password), role: data.role, active: true });
  return { id: user.id, email: user.email, name: user.name, role: user.role as Role };
}

async function issueSession(user: UserRecord): Promise<{ actor: Actor; accessToken: string; refreshToken: string }> {
  const id = user._id.toString();
  const actor = { id, email: user.email, role: user.role as Role };
  const accessToken = jwt.sign({ sub: id, email: user.email, role: user.role, type: "access" } satisfies AccessPayload, config.JWT_ACCESS_SECRET, { expiresIn: `${config.ACCESS_TOKEN_MINUTES}m` as jwt.SignOptions["expiresIn"] });
  const refreshToken = jwt.sign({ sub: id, jti: crypto.randomUUID(), type: "refresh" } satisfies RefreshPayload, config.JWT_REFRESH_SECRET, { expiresIn: `${config.REFRESH_TOKEN_DAYS}d` as jwt.SignOptions["expiresIn"] });
  await RefreshTokenModel.create({ userId: user._id, tokenHash: tokenHash(refreshToken), expiresAt: new Date(Date.now() + config.REFRESH_TOKEN_DAYS * 86_400_000) });
  return { actor, accessToken, refreshToken };
}

function tokenHash(value: string): string { return crypto.createHash("sha256").update(value).digest("hex"); }
