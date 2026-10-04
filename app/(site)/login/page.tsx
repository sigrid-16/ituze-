import type { Metadata } from "next";
import { LoginContent } from "./login-content";

export const metadata: Metadata = {
  title: "Log In",
  description: "Sign in to continue your journey and reach the support that matters to you.",
};

export default function LoginPage() {
  return <LoginContent />;
}
