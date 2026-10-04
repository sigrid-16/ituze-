import type { Metadata } from "next";
import { SignupContent } from "./signup-content";

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Join Ituze with just a nickname or your real name. It takes a minute.",
};

export default function SignupPage() {
  return <SignupContent />;
}
