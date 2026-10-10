import { NextResponse } from "next/server";

const spec = {
  openapi: "3.1.0",
  info: {
    title: "The Facility Crosswalk API",
    version: "1.0.0",
    description:
      "ECCC's two facility registries, the National Pollutant Release Inventory (NPRI) and the Greenhouse Gas Reporting Program (GHGRP), publish no shared facility key. This API serves the open crosswalk linking 2024 GHG-reporting facilities to the pollutant registry: anchor matches on self-reported NPRI IDs, entity resolution on names and addresses for the rest, quarantine for the ambiguous. Match methods and confidence tiers are on every record. Sources: NPRI bulk files and GHGRP emissions-by-gas file via open.canada.ca. Open Government Licence - Canada. Derived tables MIT licensed.",
  },
  servers: [{ url: "https://crosswalk.canada.nshipyard.com/api/v1" }],
  paths: {
    "/facility/search": {
      get: {
        summary: "Search matched facilities by name, company, or city, filterable by province and match method",
        parameters: [
          { name: "q", in: "query", required: false, schema: { type: "string" }, example: "Syncrude" },
          { name: "province", in: "query", required: false, schema: { type: "string" }, example: "AB" },
          { name: "method", in: "query", required: false, schema: { type: "string", enum: ["anchored", "resolved"] } },
          { name: "limit", in: "query", required: false, schema: { type: "integer", default: 50, maximum: 200 } },
        ],
        responses: { "200": { description: "Total plus matched facility records with GHG and toxic totals" } },
      },
    },
    "/facility/lookup": {
      get: {
        summary: "Full combined record for one facility: GHG emissions alongside toxic releases, disposals, and transfers",
        parameters: [
          { name: "npri_id", in: "query", required: false, schema: { type: "string" }, example: "1" },
          { name: "ghgrp_id", in: "query", required: false, schema: { type: "string" }, example: "G10001" },
        ],
        responses: { "200": { description: "Facility record" }, "404": { description: "No matched facility for that id" } },
      },
    },
    "/crosswalk/summary": {
      get: {
        summary: "Match statistics, combined emitter/polluter rankings, and per-province aggregates",
        responses: { "200": { description: "Summary with methodology notes" } },
      },
    },
  },
};

export async function GET() {
  return NextResponse.json(spec);
}
