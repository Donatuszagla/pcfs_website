import { Article, CalendarDots, ImageSquare, Buildings, UsersThree, Sparkle, EnvelopeSimple } from "@phosphor-icons/react";
import type { ContentKind } from "../graphql";

export const contentSections: { kind: ContentKind; label: string; icon: typeof Article }[] = [
  { kind: "PAGE", label: "Pages", icon: Article },
  { kind: "EVENT", label: "Events", icon: CalendarDots },
  { kind: "MEDIA", label: "Media", icon: ImageSquare },
  { kind: "BRANCH", label: "Branches", icon: Buildings },
  { kind: "LEADER", label: "Leaders", icon: UsersThree },
  { kind: "MINISTRY", label: "Ministries", icon: Sparkle },
  { kind: "SUBMISSION", label: "Enquiries", icon: EnvelopeSimple },
];
