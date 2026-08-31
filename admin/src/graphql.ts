export type Role = "SUPER_ADMIN" | "CONTENT_ADMIN" | "MEDIA_MANAGER" | "EVENT_MANAGER";
export type ContentKind = "PAGE" | "LEADER" | "BRANCH" | "MINISTRY" | "EVENT" | "MEDIA" | "MEDIA_CATEGORY" | "SITE_SETTINGS" | "SUBMISSION" | "USER";
export interface Actor { id: string; email: string; role: Role }
export interface ContentRecord { id: string; kind: ContentKind; status?: string; values: Record<string, unknown>; createdAt?: string; updatedAt?: string }

const endpoint = import.meta.env.VITE_API_URL ?? "http://localhost:4000/graphql";

export async function graphqlRequest<T>(query: string, variables?: Record<string, unknown>, accessToken?: string): Promise<T> {
  const response = await fetch(endpoint, { method: "POST", credentials: "include", headers: { "content-type": "application/json", ...(accessToken ? { authorization: `Bearer ${accessToken}` } : {}) }, body: JSON.stringify({ query, variables }) });
  const body = await response.json() as { data?: T; errors?: { message: string }[] };
  if (!response.ok || body.errors?.length) throw new Error(body.errors?.[0]?.message ?? `Request failed (${response.status})`);
  if (!body.data) throw new Error("The API returned no data");
  return body.data;
}

export const operations = {
  login: `mutation Login($data: LoginInput!) { login(data: $data) { accessToken actor { id email role } } }`,
  refresh: `mutation Refresh { refresh { accessToken actor { id email role } } }`,
  logout: `mutation Logout { logout }`,
  records: `query Records($data: AdminRecordsInput!) { adminRecords(data: $data) { id kind status values createdAt updatedAt } }`,
  save: `mutation Save($data: SaveContentInput!) { saveContent(data: $data) { id kind status values createdAt updatedAt } }`,
  publish: `mutation Publish($data: RecordActionInput!) { publishContent(data: $data) { id kind status values updatedAt } }`,
  archive: `mutation Archive($data: RecordActionInput!) { archiveContent(data: $data) { id kind status values updatedAt } }`,
  retryContact: `mutation Retry($data: RetryContactInput!) { retryContact(data: $data) }`,
  createUser: `mutation CreateUser($data: CreateUserInput!) { createUser(data: $data) { id email name role } }`,
};
