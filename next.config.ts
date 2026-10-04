import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Old demo routes from the first build, kept so shared links still land somewhere sensible
  async redirects() {
    return [
      { source: "/demo", destination: "/login", permanent: false },
      { source: "/onboarding", destination: "/signup", permanent: false },
      { source: "/app/cohort", destination: "/app/community", permanent: false },
      { source: "/app/me/journey", destination: "/app/me", permanent: false },
    ];
  },
};

export default nextConfig;
