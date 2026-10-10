import type { Metadata } from "next";
import "@fontsource/newsreader/400.css";
import "@fontsource/newsreader/400-italic.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "./globals.css";
import { LangProvider } from "@/i18n";

export const metadata: Metadata = {
  metadataBase: new URL("https://facilities.canada.nshipyard.com"),
  title: "The Facility Crosswalk: which carbon emitters are also the worst toxic polluters",
  description:
    "ECCC's two facility registries (NPRI and the Greenhouse Gas Reporting Program) share no published key. This project links 1,879 GHG-reporting facilities to the pollutant registry for 2024: anchor matches on self-reported NPRI IDs, entity resolution for the rest, quarantine for the ambiguous. Facility explorer, combined rankings, REST API, OpenAPI docs, and MCP tools. Open data, MIT licensed.",
  openGraph: {
    title: "The Facility Crosswalk: which carbon emitters are also the worst toxic polluters",
    description:
      "Linking 1,546 of 1,879 carbon emitters to Canada's toxic-pollutant registry for 2024: anchor matches, entity resolution, quarantine for the ambiguous.",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "The Facility Crosswalk: which carbon emitters are also the worst toxic polluters",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Facility Crosswalk: which carbon emitters are also the worst toxic polluters",
    description:
      "Linking 1,546 of 1,879 carbon emitters to Canada's toxic-pollutant registry for 2024: anchor matches, entity resolution, quarantine for the ambiguous.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <LangProvider>{children}</LangProvider>
      </body>
    </html>
  );
}
