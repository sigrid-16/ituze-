"use client";

import { use } from "react";
import { OrganizerCommunity } from "@/components/organizer/community";
import { OrganizerContent } from "@/components/organizer/content";
import { OrganizerOverview } from "@/components/organizer/overview";
import { OrganizerTestimonials } from "@/components/organizer/testimonials";
import { OrganizerTherapists } from "@/components/organizer/therapists";

export default function OrganizerPage({ params }: { params: Promise<{ section?: string[] }> }) {
  const { section } = use(params);
  switch (section?.[0]) {
    case "community":
      return <OrganizerCommunity />;
    case "content":
      return <OrganizerContent />;
    case "testimonials":
      return <OrganizerTestimonials />;
    case "therapists":
      return <OrganizerTherapists />;
    default:
      return <OrganizerOverview />;
  }
}
