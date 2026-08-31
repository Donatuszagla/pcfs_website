import { Role, type ContentKind } from "../types.js";

const grants: Record<Role, ContentKind[]> = {
  [Role.SUPER_ADMIN]: ["PAGE", "LEADER", "BRANCH", "MINISTRY", "EVENT", "MEDIA", "MEDIA_CATEGORY", "SITE_SETTINGS", "SUBMISSION", "USER"],
  [Role.CONTENT_ADMIN]: ["PAGE", "LEADER", "BRANCH", "MINISTRY", "SITE_SETTINGS", "SUBMISSION"],
  [Role.MEDIA_MANAGER]: ["MEDIA", "MEDIA_CATEGORY"],
  [Role.EVENT_MANAGER]: ["EVENT"],
};

/** Returns whether a CMS role may manage a content domain. */
export function canManage(role: Role, kind: ContentKind): boolean {
  return grants[role].includes(kind);
}

/** Throws when an actor does not have access to a content domain. */
export function requirePermission(role: Role | undefined, kind: ContentKind): void {
  if (!role || !canManage(role, kind)) throw new Error("You do not have permission to perform this action");
}
