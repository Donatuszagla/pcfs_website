export const seedData = {
  settings: {
    key: "default",
    name: "Paradise City of Faith Sanctuary",
    shortName: "PCFS",
    description: "A young, vibrant, charismatic ministry building effective people for Kingdom assignment through sound doctrine, practical ministry training and opportunities.",
    vision: "Go and raise me a people. Isaiah 45:1–5, 13–14; Nehemiah 4:1.",
    mission: "We become all things to all men so that we might by all means win some for Christ. 1 Corinthians 9:22.",
    socialLinks: [],
    status: "PUBLISHED",
  },
  pages: [
    { title: "Home", slug: "home", status: "PUBLISHED", sections: [{ type: "HOME_COMPOSITION", enabled: true, order: 0, content: { showMandate: true, showPillars: true, showLeadership: true, showFeaturedEvent: true } }] },
    { title: "About Us", slug: "about", status: "PUBLISHED", sections: [{ type: "RICH_TEXT", enabled: true, order: 0, content: { heading: "A people raised for Kingdom assignment", body: "Paradise City of Faith Sanctuary is a young, vibrant, charismatic ministry centred on sound doctrine, practical ministry training and opportunities to serve." } }] },
    { title: "Privacy", slug: "privacy", status: "PUBLISHED", sections: [{ type: "RICH_TEXT", enabled: true, order: 0, content: { heading: "Privacy", body: "This policy is a temporary administrative draft and must be reviewed before production launch." } }] },
    { title: "Terms", slug: "terms", status: "PUBLISHED", sections: [{ type: "RICH_TEXT", enabled: true, order: 0, content: { heading: "Terms", body: "These terms are a temporary administrative draft and must be reviewed before production launch." } }] },
  ],
  branches: [
    { name: "PCFS Headquarters", slug: "headquarters-accra", region: "Greater Accra", city: "Accra", location: "Sapeiman-Zinga, near Free Ridge School", description: "The headquarters branch of Paradise City of Faith Sanctuary.", image: "/images/Takoradi-branch.jpeg", imageIsPlaceholder: true, order: 1, status: "PUBLISHED" },
    { name: "Western Regional Branch", slug: "western-regional-takoradi", region: "Western", city: "Takoradi", location: "Mpintsin New Site, High Tension Down", description: "The Western Regional expression of Paradise City of Faith Sanctuary.", image: "/images/Takoradi-branch.jpeg", imageIsPlaceholder: true, order: 2, status: "PUBLISHED" },
    ...["Ngyiresia", "Sofokrom", "Ahinkofi"].map((city, index) => ({ name: `${city} Branch`, slug: `${city.toLowerCase()}-branch`, region: "Western", city, location: "Location details pending confirmation", description: "Branch details will be updated by the PCFS communications team.", image: "/images/Takoradi-branch.jpeg", imageIsPlaceholder: true, order: index + 3, status: "PUBLISHED" })),
  ],
  events: [{ title: "RFMC 2026", slug: "rfmc-2026", theme: "FIGHT THE GOOD FIGHT!", description: "A PCFS ministry conference held during the church's 10th-anniversary season, centred on 1 Timothy 6:12.", startAt: new Date("2026-09-18T18:00:00Z"), endAt: new Date("2026-09-20T21:00:00Z"), venue: "Church Auditorium, Mpintsin New Site, High Tension Down", speakers: ["Pastor David Komlagah", "Reverend Bernard O. Boayeg"], image: "/images/rfmc-worship.png", featured: true, status: "PUBLISHED" }],
  media: [{ title: "Growing Through Sound Doctrine", slug: "growing-through-sound-doctrine", type: "VIDEO", speaker: "PCFS Teaching Ministry", category: "Teaching", description: "A temporary featured-media entry ready to be replaced with an official PCFS message.", publishedAt: new Date("2026-08-24T10:00:00Z"), image: "/images/featured-teaching.png", featured: true, status: "PUBLISHED" }, ...[1, 2, 3].map((part) => ({ title: `Shepherding P${part}`, slug: `shepherding-p${part}`, type: "AUDIO", speaker: "PCFS Teaching Ministry", category: "Sermon", description: "Audio details and official link pending upload by the PCFS media team.", publishedAt: new Date(`2026-08-${21 - part}T10:00:00Z`), image: "/images/featured-teaching.png", featured: false, status: "PUBLISHED" }))],
  leaders: [{ name: "Rev. Dr. Seth Lartey", title: "General Overseer", bio: "Official biography pending approval from PCFS leadership.", portrait: "/images/Rev-Seth2.jpeg", order: 1, status: "PUBLISHED" }, { name: "Rev. David Komlagah", title: "Head Pastor, Takoradi Branch", bio: "Official biography pending approval from PCFS leadership.", portrait: "/images/Rev-David.jpeg", order: 2, status: "PUBLISHED" }],
  ministries: [{ name: "Kiddie Ministry International", slug: "kiddie-ministry", audience: "Ages 1–5", description: "Faith foundation, listening, storytelling, creativity and simple service tasks.", order: 1, status: "PUBLISHED" }, { name: "Star Ministry International", slug: "star-ministry", audience: "Ages 6–12", description: "Biblical literacy, gifts discovery, team activities and peer service.", order: 2, status: "PUBLISHED" }, { name: "Future Leaders Ministry International", slug: "future-leaders", audience: "Ages 13–16", description: "Leadership, mentoring, practical skills and personal discipleship.", order: 3, status: "PUBLISHED" }],
  categories: [{ name: "Teaching", slug: "teaching", status: "PUBLISHED" }, { name: "Sermon", slug: "sermon", status: "PUBLISHED" }],
};
