export type PublishStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface SeoFields {
  title: string;
  description: string;
  image?: string;
}

export interface Branch {
  id: string;
  name: string;
  slug: string;
  region: string;
  city: string;
  location: string;
  description: string;
  serviceTimes?: string;
  phone?: string;
  directionsUrl?: string;
  image: string;
  imageIsPlaceholder: boolean;
  status: PublishStatus;
}

export interface Event {
  id: string;
  title: string;
  slug: string;
  theme: string;
  description: string;
  startAt: string;
  endAt: string;
  venue: string;
  speakers: string[];
  registrationUrl?: string;
  image: string;
  featured: boolean;
  status: PublishStatus;
}

export interface MediaItem {
  id: string;
  title: string;
  slug: string;
  type: "VIDEO" | "AUDIO" | "PHOTO";
  speaker: string;
  category: string;
  description: string;
  publishedAt: string;
  externalUrl?: string;
  image: string;
  featured: boolean;
  status: PublishStatus;
}

export interface Leader {
  id: string;
  name: string;
  title: string;
  bio: string;
  image?: string;
  portrait?: string;
  imageIsPlaceholder?: boolean;
  status: PublishStatus;
}

export interface Ministry {
  id: string;
  name: string;
  slug: string;
  audience: string;
  description: string;
  status: PublishStatus;
}

export interface SiteData {
  settings: {
    name: string;
    shortName: string;
    description: string;
    vision: string;
    mission: string;
    contactEmail?: string;
    contactPhone?: string;
    socialLinks: Array<{ label: string; url: string }>;
  };
  branches: Branch[];
  events: Event[];
  media: MediaItem[];
  leaders: Leader[];
  ministries: Ministry[];
}

declare global {
  interface Window {
    __PCFS_DATA__: SiteData;
    turnstile?: {
      render: (element: HTMLElement, options: { sitekey: string; callback: (token: string) => void }) => string;
      remove: (widgetId: string) => void;
    };
  }
}
