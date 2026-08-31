import { describe, expect, it } from "vitest";
import { Role } from "../types.js";
import { canManage } from "./permissions.js";

describe("CMS role matrix", () => {
  it("gives super administrators full access", () => expect(canManage(Role.SUPER_ADMIN, "USER")).toBe(true));
  it("limits media managers to media domains", () => { expect(canManage(Role.MEDIA_MANAGER, "MEDIA")).toBe(true); expect(canManage(Role.MEDIA_MANAGER, "EVENT")).toBe(false); });
  it("allows event managers to manage events only", () => { expect(canManage(Role.EVENT_MANAGER, "EVENT")).toBe(true); expect(canManage(Role.EVENT_MANAGER, "PAGE")).toBe(false); });
  it("allows content administrators to manage pages and submissions", () => { expect(canManage(Role.CONTENT_ADMIN, "PAGE")).toBe(true); expect(canManage(Role.CONTENT_ADMIN, "SUBMISSION")).toBe(true); expect(canManage(Role.CONTENT_ADMIN, "USER")).toBe(false); });
});
