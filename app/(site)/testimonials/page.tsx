import type { Metadata } from "next";
import { TestimonialsContent } from "./testimonials-content";

export const metadata: Metadata = {
  title: "Testimonials",
  description: "Stories from people who found support on Ituze.",
};

export default function TestimonialsPage() {
  return <TestimonialsContent />;
}
