import type { Metadata, Viewport } from "next";
import "@fontsource-variable/nunito";
import "./globals.css";
import { Providers, themeBootScript } from "@/components/providers";

export const metadata: Metadata = {
  title: { default: "Ituze · From isolation to connection", template: "%s · Ituze" },
  description:
    "Ituze is a community-centered mental wellness platform in Rwanda: a private journal, verified psychologists and a 12-week healing journey in small cohorts.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F1E8" },
    { media: "(prefers-color-scheme: dark)", color: "#16201C" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootScript }} />
      </head>
      <body className="min-h-dvh">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
