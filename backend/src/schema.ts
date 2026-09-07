import { GraphQLError, GraphQLScalarType, Kind, type ValueNode } from "graphql";
import { Role, type Actor, type ContentKind, type GraphqlContext } from "./types.js";
import { createUser, login, logout, rotateRefreshToken } from "./services/auth.service.js";
import { archiveContent, getPublicSite, listAdminRecords, publishContent, reorderContent, saveContent } from "./services/content.service.js";
import { retryContact, submitContact } from "./services/contact.service.js";

export const typeDefs = `#graphql
  scalar JSON
  scalar DateTime

  enum Role { SUPER_ADMIN CONTENT_ADMIN MEDIA_MANAGER EVENT_MANAGER }
  enum ContentKind { PAGE LEADER BRANCH MINISTRY EVENT MEDIA MEDIA_CATEGORY SITE_SETTINGS SUBMISSION USER }

  type Seo { title: String description: String image: String }
  type SocialLink { label: String! url: String! }
  type SiteSettings {
    id: ID
    name: String!
    shortName: String
    description: String
    vision: String
    mission: String
    contactEmail: String
    contactPhone: String
    socialLinks: [SocialLink!]!
    seo: Seo
  }
  type Page { id: ID! title: String! slug: String! sections: JSON! status: String! seo: Seo }
  type Branch {
    id: ID!
    name: String!
    slug: String!
    region: String
    city: String
    location: String
    description: String
    serviceTimes: String
    phone: String
    directionsUrl: String
    image: String
    imageIsPlaceholder: Boolean!
    status: String!
  }
  type Event {
    id: ID!
    title: String!
    slug: String!
    theme: String
    description: String
    startAt: DateTime
    endAt: DateTime
    venue: String
    speakers: [String!]!
    registrationUrl: String
    image: String
    featured: Boolean!
    seo: Seo
    status: String!
  }
  type MediaItem {
    id: ID!
    title: String!
    slug: String!
    type: String!
    speaker: String
    category: String
    description: String
    publishedAt: DateTime
    externalUrl: String
    image: String
    featured: Boolean!
    seo: Seo
    status: String!
  }
  type Leader { id: ID! name: String! title: String bio: String portrait: String order: Int! status: String! }
  type Ministry { id: ID! name: String! slug: String! audience: String description: String order: Int! status: String! }
  type PublicSite {
    settings: SiteSettings
    pages: [Page!]!
    branches: [Branch!]!
    events: [Event!]!
    media: [MediaItem!]!
    leaders: [Leader!]!
    ministries: [Ministry!]!
  }

  type Actor { id: ID! email: String! role: Role! }
  type User { id: ID! email: String! name: String! role: Role! }
  type AuthPayload { actor: Actor! accessToken: String! }
  type ContactReceipt { accepted: Boolean! reference: String! }
  type ContentRecord { id: ID! kind: ContentKind! status: String values: JSON! createdAt: DateTime updatedAt: DateTime }

  input LoginInput { email: String! password: String! }
  input ContactInput { name: String! email: String phone: String subject: String! message: String! preferredContactMethod: String captchaToken: String! }
  input AdminRecordsInput { kind: ContentKind! search: String limit: Int after: ID }
  input SaveContentInput { kind: ContentKind! id: ID values: JSON! }
  input RecordActionInput { kind: ContentKind! id: ID! }
  input ReorderContentInput { kind: ContentKind! ids: [ID!]! }
  input CreateUserInput { email: String! name: String! password: String! role: Role! }
  input RetryContactInput { id: ID! }

  type Query {
    publicSite: PublicSite!
    me: Actor
    adminRecords(data: AdminRecordsInput!): [ContentRecord!]!
  }

  type Mutation {
    login(data: LoginInput!): AuthPayload!
    refresh: AuthPayload!
    logout: Boolean!
    submitContact(data: ContactInput!): ContactReceipt!
    saveContent(data: SaveContentInput!): ContentRecord!
    publishContent(data: RecordActionInput!): ContentRecord!
    archiveContent(data: RecordActionInput!): ContentRecord!
    reorderContent(data: ReorderContentInput!): Boolean!
    createUser(data: CreateUserInput!): User!
    retryContact(data: RetryContactInput!): Boolean!
  }
`;

const jsonScalar = new GraphQLScalarType({
  name: "JSON",
  serialize: identity,
  parseValue: identity,
  parseLiteral: parseJsonLiteral,
});

const dateTimeScalar = new GraphQLScalarType({
  name: "DateTime",
  serialize(value): string { return new Date(value as string | number | Date).toISOString(); },
  parseValue(value): Date { return new Date(String(value)); },
  parseLiteral(ast): Date | null { return ast.kind === Kind.STRING ? new Date(ast.value) : null; },
});

export const resolvers = {
  JSON: jsonScalar,
  DateTime: dateTimeScalar,
  Query: {
    publicSite: () => getPublicSite(),
    me: (_root: unknown, _args: unknown, context: GraphqlContext) => context.actor ?? null,
    adminRecords: async (_root: unknown, args: { data: { kind: ContentKind; search?: string; limit?: number; after?: string } }, context: GraphqlContext) => {
      const actor = requireActor(context);
      const records = await listAdminRecords(actor, args.data);
      return records.map((record) => toContentRecord(args.data.kind, record));
    },
  },
  Mutation: {
    login: async (_root: unknown, args: { data: { email: string; password: string } }, context: GraphqlContext) => {
      const session = await login(args.data);
      setRefreshCookie(context, session.refreshToken);
      return { actor: session.actor, accessToken: session.accessToken };
    },
    refresh: async (_root: unknown, _args: unknown, context: GraphqlContext) => {
      const rawToken = context.request.cookies?.pcfs_refresh as string | undefined;
      if (!rawToken) throw new GraphQLError("Refresh session is unavailable", { extensions: { code: "UNAUTHENTICATED" } });
      const session = await rotateRefreshToken(rawToken);
      setRefreshCookie(context, session.refreshToken);
      return { actor: session.actor, accessToken: session.accessToken };
    },
    logout: async (_root: unknown, _args: unknown, context: GraphqlContext) => {
      await logout(context.request.cookies?.pcfs_refresh as string | undefined);
      context.response.clearCookie("pcfs_refresh", { path: "/graphql", sameSite: "none", secure: true });
      return true;
    },
    submitContact: (_root: unknown, args: { data: unknown }) => submitContact(args.data),
    saveContent: async (_root: unknown, args: { data: { kind: ContentKind; id?: string; values: Record<string, unknown> } }, context: GraphqlContext) => toContentRecord(args.data.kind, await saveContent(requireActor(context), args.data)),
    publishContent: async (_root: unknown, args: { data: { kind: ContentKind; id: string } }, context: GraphqlContext) => toContentRecord(args.data.kind, await publishContent(requireActor(context), args.data)),
    archiveContent: async (_root: unknown, args: { data: { kind: ContentKind; id: string } }, context: GraphqlContext) => toContentRecord(args.data.kind, await archiveContent(requireActor(context), args.data)),
    reorderContent: (_root: unknown, args: { data: { kind: ContentKind; ids: string[] } }, context: GraphqlContext) => reorderContent(requireActor(context), args.data),
    createUser: (_root: unknown, args: { data: { email: string; name: string; password: string; role: Role } }, context: GraphqlContext) => {
      const actor = requireActor(context);
      if (actor.role !== Role.SUPER_ADMIN) throw new GraphQLError("You do not have permission to manage users", { extensions: { code: "FORBIDDEN" } });
      return createUser(args.data);
    },
    retryContact: (_root: unknown, args: { data: { id: string } }, context: GraphqlContext) => retryContact(requireActor(context), args.data),
  },
};

function requireActor(context: GraphqlContext): Actor {
  if (!context.actor) throw new GraphQLError("Authentication is required", { extensions: { code: "UNAUTHENTICATED" } });
  return context.actor;
}

function setRefreshCookie(context: GraphqlContext, refreshToken: string): void {
  const isProd = process.env.NODE_ENV === "production" || Boolean(context.request.header("x-forwarded-proto")?.includes("https"));
  context.response.cookie("pcfs_refresh", refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
    path: "/graphql",
    maxAge: 7 * 86_400_000,
  });
}

function toContentRecord(kind: ContentKind, value: unknown): Record<string, unknown> {
  const record = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const id = String(record._id ?? record.id ?? "");
  const values = { ...record };
  delete values._id;
  delete values.id;
  return { id, kind, status: typeof record.status === "string" ? record.status : null, createdAt: record.createdAt ?? null, updatedAt: record.updatedAt ?? null, values };
}

function identity(value: unknown): unknown { return value; }

function parseJsonLiteral(ast: ValueNode): unknown {
  switch (ast.kind) {
    case Kind.STRING:
    case Kind.BOOLEAN:
      return ast.value;
    case Kind.INT:
    case Kind.FLOAT:
      return Number(ast.value);
    case Kind.NULL:
      return null;
    case Kind.LIST:
      return ast.values.map(parseJsonLiteral);
    case Kind.OBJECT:
      return Object.fromEntries(ast.fields.map((field) => [field.name.value, parseJsonLiteral(field.value)]));
    default:
      return null;
  }
}
