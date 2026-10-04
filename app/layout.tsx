import type { Metadata, Viewport } from "next";
import "@fontsource-variable/nunito";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/cormorant-garamond/500-italic.css";
import "@fontsource/cormorant-garamond/600.css";
import "./globals.css";
import { Providers, themeBootScript } from "@/components/providers";

export const metadata: Metadata = {
  title: { default: "Ituze · You don't have to carry everything alone", template: "%s · Ituze" },
  description:
    "Ituze is a calm place for mental wellness in Rwanda: a private journal and helpful resources, small and safe community groups, and private sessions with verified psychologists.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FBF8F3" },
    { media: "(prefers-color-scheme: dark)", color: "#171D1A" },
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
