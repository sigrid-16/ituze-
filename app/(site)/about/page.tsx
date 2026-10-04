import type { Metadata } from "next";
import { AboutContent } from "./about-content";

export const metadata: Metadata = {
  title: "About",
  description: "Why Ituze exists, what guides us, and the verified psychologists who support our community.",
};

export default function AboutPage() {
  return <AboutContent />;
}
