import type { SiteData } from "./types.js";
import { logger } from "./utils/logger.js";

export const fallbackSiteData: SiteData = {
  settings: {
    name: "Paradise City of Faith Sanctuary",
    shortName: "PCFS",
    description:
      "A young, vibrant, charismatic ministry building effective people for Kingdom assignment through sound doctrine, practical ministry training and opportunities.",
    vision: "Go and raise me a people. Isaiah 45:1–5, 13–14; Nehemiah 4:1.",
    mission:
      "We become all things to all men so that we might by all means win some for Christ. 1 Corinthians 9:22.",
    socialLinks: [],
  },
  branches: [
    {
      id: "branch-accra",
      name: "PCFS Headquarters",
      slug: "headquarters-accra",
      region: "Greater Accra",
      city: "Accra",
      location: "Sapeiman-Zinga, near Free Ridge School",
      description: "The headquarters branch of Paradise City of Faith Sanctuary.",
      image: "/images/Takoradi-branch.jpeg",
      imageIsPlaceholder: false,
      status: "PUBLISHED",
    },
    {
      id: "branch-takoradi",
      name: "Western Regional Branch",
      slug: "western-regional-takoradi",
      region: "Western",
      city: "Takoradi",
      location: "Mpintsin New Site, High Tension Down",
      description: "The Western Regional expression of Paradise City of Faith Sanctuary.",
      image: "/images/Takoradi-branch.jpeg",
      imageIsPlaceholder: false,
      status: "PUBLISHED",
    },
    {
      id: "branch-ngyiresia",
      name: "Ngyiresia Branch",
      slug: "ngyiresia-branch",
      region: "Western",
      city: "Ngyiresia",
      location: "Main Coastal Road, Ngyiresia, Sekondi-Takoradi",
      description: "A vibrant community worshipping center serving the Ngyiresia district with weekly prayer, preaching, and youth outreach.",
      image: "/images/Takoradi-branch.jpeg",
      imageIsPlaceholder: false,
      status: "PUBLISHED",
    },
    {
      id: "branch-sofokrom",
      name: "Sofokrom Branch",
      slug: "sofokrom-branch",
      region: "Western",
      city: "Sofokrom",
      location: "Near Sofokrom Station, Takoradi",
      description: "Bringing the Gospel of faith and sound teaching to the Sofokrom township through engaging services and family ministry.",
      image: "/images/Takoradi-branch.jpeg",
      imageIsPlaceholder: false,
      status: "PUBLISHED",
    },
    {
      id: "branch-ahinkofi",
      name: "Ahinkofi Branch",
      slug: "ahinkofi-branch",
      region: "Western",
      city: "Ahinkofi",
      location: "Ahinkofi Junction, Off Takoradi Highway",
      description: "A welcoming branch dedicated to raising believers rooted in biblical truth, fellowship, and compassionate community service.",
      image: "/images/Takoradi-branch.jpeg",
      imageIsPlaceholder: false,
      status: "PUBLISHED",
    },
  ],
  events: [
    {
      id: "event-rfmc-2026",
      title: "RFMC 2026",
      slug: "rfmc-2026",
      theme: "FIGHT THE GOOD FIGHT!",
      description:
        "A PCFS ministry conference held during the church's 10th-anniversary season, centred on 1 Timothy 6:12.",
      startAt: "2026-09-18T18:00:00+00:00",
      endAt: "2026-09-20T21:00:00+00:00",
      venue: "Church Auditorium, Mpintsin New Site, High Tension Down",
      speakers: ["Pastor David Komlagah", "Reverend Bernard O. Boayeg"],
      image: "/images/4.jpg",
      featured: true,
      status: "PUBLISHED",
    },
  ],
  media: [
    {
      id: "media-featured",
      title: "Growing Through Sound Doctrine",
      slug: "growing-through-sound-doctrine",
      type: "VIDEO",
      speaker: "PCFS Teaching Ministry",
      category: "Teaching",
      description: "An inspiring message on building a firm spiritual foundation through sound doctrine, prayer, and kingdom service.",
      publishedAt: "2026-08-24T10:00:00+00:00",
      image: "/images/2.jpg",
      featured: true,
      status: "PUBLISHED",
    },
    ...["Shepherding P1", "Shepherding P2", "Shepherding P3"].map((title, index) => ({
      id: `media-shepherding-${index + 1}`,
      title,
      slug: `shepherding-p${index + 1}`,
      type: "AUDIO" as const,
      speaker: "PCFS Teaching Ministry",
      category: "Sermon",
      description: "A profound teaching series on pastoral leadership, spiritual maturity, and shepherding God's people.",
      publishedAt: `2026-08-${20 - index}T10:00:00+00:00`,
      image: "/images/9.jpg",
      featured: false,
      status: "PUBLISHED" as const,
    })),
  ],
  leaders: [
    {
      id: "leader-seth-lartey",
      name: "Rev. Dr. Seth Lartey",
      title: "General Overseer",
      bio: "Rev. Dr. Seth Lartey serves as the General Overseer of Paradise City of Faith Sanctuary. Driven by a passion for sound doctrine, church planting, and raising effective leaders for Kingdom assignment, Dr. Lartey leads the ministry with apostolic vision and spiritual clarity.",
      status: "PUBLISHED",
      image: "/images/Rev-Seth2.jpeg",
      portrait: "/images/Rev-Seth2.jpeg",
      imageIsPlaceholder: false,
    },
    {
      id: "leader-david-komlagah",
      name: "Rev. David Komlagah",
      title: "Head Pastor, Takoradi Branch",
      bio: "Rev. David Komlagah is the Head Pastor of the PCFS Western Regional Branch in Takoradi. He is dedicated to shepherd care, discipleship training, and equipping believers to fulfill their God-given potential in practical ministry.",
      status: "PUBLISHED",
      image: "/images/Rev-David.jpeg",
      portrait: "/images/Rev-David.jpeg",
      imageIsPlaceholder: false,
    },
  ],
  ministries: [
    { id: "acm", name: "All Campus Ministry", slug: "all-campus-ministry", audience: "Basic schools - Tertiary institutions", description: "Teaching and training young people for the Kingdom assignment through camps, conferences etc in a controlled environment.", status: "PUBLISHED" },
    { id: "kmi", name: "Kiddie Ministry International", slug: "kiddie-ministry", audience: "Ages 1–5", description: "Faith foundation, listening, storytelling, creativity and simple service tasks.", status: "PUBLISHED" },
    { id: "smi", name: "Star Ministry International", slug: "star-ministry", audience: "Ages 6–12", description: "Biblical literacy, gifts discovery, team activities and peer service.", status: "PUBLISHED" },
    { id: "flmi", name: "Future Leaders Ministry International", slug: "future-leaders", audience: "Ages 13–16", description: "Leadership, mentoring, practical skills and personal discipleship.", status: "PUBLISHED" },
  ],
};

const PUBLIC_SITE_QUERY = `query PublicSite { publicSite { settings { name shortName description vision mission contactEmail contactPhone socialLinks { label url } } branches { id name slug region city location description serviceTimes phone directionsUrl image imageIsPlaceholder status } events { id title slug theme description startAt endAt venue speakers registrationUrl image featured status } media { id title slug type speaker category description publishedAt externalUrl image featured status } leaders { id name title bio portrait status } ministries { id name slug audience description status } } }`;

/** Loads published CMS content and falls back to the approved seed content when the API is unavailable. */
export async function loadSiteData(apiUrl?: string): Promise<SiteData> {
  const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env;
  const resolvedUrl = apiUrl || metaEnv?.VITE_API_URL || (typeof process !== "undefined" && process.env?.API_URL) || "http://localhost:4000/graphql";
  logger.data(`Fetching live site data from ${resolvedUrl}...`);
  try {
    const response = await fetch(resolvedUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ query: PUBLIC_SITE_QUERY }),
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) {
      logger.warn("SiteData", `Backend returned HTTP ${response.status}. Using fallback seed dataset.`);
      return fallbackSiteData;
    }
    const payload = (await response.json()) as { data?: { publicSite?: Partial<SiteData> } };
    const siteData = payload.data?.publicSite;
    if (!siteData) {
      logger.warn("SiteData", "No publicSite payload in response. Using fallback seed dataset.");
      return fallbackSiteData;
    }
    logger.success(`Live site data loaded (${siteData.branches?.length ?? 0} branches, ${siteData.events?.length ?? 0} events, ${siteData.media?.length ?? 0} media)`);
    return {
      ...fallbackSiteData,
      ...siteData,
      settings: siteData.settings ?? fallbackSiteData.settings,
      branches: siteData.branches?.length ? siteData.branches : fallbackSiteData.branches,
      events: siteData.events?.length ? siteData.events : fallbackSiteData.events,
      media: siteData.media?.length ? siteData.media : fallbackSiteData.media,
      leaders: siteData.leaders?.length ? siteData.leaders : fallbackSiteData.leaders,
      ministries: siteData.ministries?.length ? siteData.ministries : fallbackSiteData.ministries,
    };
  } catch (error) {
    logger.warn("SiteData", `Failed to reach live API (${error instanceof Error ? error.message : "Network error"}). Serving fallback site data.`);
    return fallbackSiteData;
  }
}
