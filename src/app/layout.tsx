import type { Metadata } from "next";
import "@fontsource/newsreader/400.css";
import "@fontsource/newsreader/400-italic.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "./globals.css";
import { LangProvider } from "@/i18n";

export const metadata: Metadata = {
  title: "The Facility Crosswalk: which carbon emitters are also the worst toxic polluters",
  description:
    "ECCC's two facility registries (NPRI and the Greenhouse Gas Reporting Program) share no published key. This project links 1,879 GHG-reporting facilities to the pollutant registry for 2024: anchor matches on self-reported NPRI IDs, entity resolution for the rest, quarantine for the ambiguous. Facility explorer, combined rankings, REST API, OpenAPI docs, and MCP tools. Open data, MIT licensed.",
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
