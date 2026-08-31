import type { Request, Response } from "express";

export enum Role {
  SUPER_ADMIN = "SUPER_ADMIN",
  CONTENT_ADMIN = "CONTENT_ADMIN",
  MEDIA_MANAGER = "MEDIA_MANAGER",
  EVENT_MANAGER = "EVENT_MANAGER",
}

export interface Actor {
  id: string;
  role: Role;
  email: string;
}

export interface GraphqlContext {
  actor?: Actor;
  request: Request;
  response: Response;
}

export type ContentKind = "PAGE" | "LEADER" | "BRANCH" | "MINISTRY" | "EVENT" | "MEDIA" | "MEDIA_CATEGORY" | "SITE_SETTINGS" | "SUBMISSION" | "USER";
