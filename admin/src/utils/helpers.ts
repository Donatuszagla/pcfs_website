import type { ContentKind, ContentRecord } from "../graphql";

export function slugify(text: string): string {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/[\s_-]+/g, "-").replace(/^-+|-+$/g, "");
}

export function getDefaultValuesForKind(kind: ContentKind): Record<string, any> {
  switch (kind) {
    case "EVENT":
      return { title: "", slug: "", theme: "", venue: "", startAt: "", endAt: "", speakers: [], image: "", description: "", featured: false };
    case "BRANCH":
      return { name: "", slug: "", region: "Western", city: "", location: "", phone: "", email: "", description: "", image: "", order: 1 };
    case "LEADER":
      return { name: "", title: "", bio: "", portrait: "", order: 1 };
    case "MINISTRY":
      return { name: "", slug: "", audience: "", description: "", order: 1 };
    case "MEDIA":
      return { title: "", slug: "", type: "VIDEO", speaker: "", category: "Teaching", description: "", image: "", externalUrl: "", mediaUrl: "", featured: false };
    case "PAGE":
      return { title: "", slug: "", description: "", body: "" };
    default:
      return { title: "", slug: "", description: "" };
  }
}

export function formatDatetimeLocal(isoStr?: string): string {
  if (!isoStr) return "";
  try {
    const d = new Date(isoStr);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return "";
  }
}

export function recordLabel(record?: ContentRecord): string {
  if (!record) return "Loading…";
  const values = record.values;
  return String(values.title ?? values.name ?? values.reference ?? values.email ?? "Untitled record");
}

export function recordSecondary(record: ContentRecord): string {
  return String(record.values.slug ?? record.values.region ?? record.values.notificationStatus ?? record.kind.replaceAll("_", " "));
}

export function formatDate(value?: string): string {
  return value ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value)) : "—";
}
