import { NextResponse } from "next/server";
import { getData } from "@/lib/crosswalk";

export async function GET() {
  const { stats, combined, ghg, toxics, provinces } = getData();
  return NextResponse.json({
    meta: {
      retrieved: "2026-10-10",
      vintage: stats.vintage,
      licence: "Open Government Licence - Canada",
      sources: [
        "NPRI bulk files for all years (ECCC), dataset 40e01423-7728-429c-ac9d-2954385ccdfb",
        "GHGRP emissions by gas 2004-present (ECCC), dataset a8ba14b7-7f23-462a-bdbb-83b0ef629823",
      ],
      limitations: [
        "2024 reporting year on both sides; preliminary 2025 not used",
        "NPRI toxic totals are releases, disposals and transfers summed in kilograms; units normalized from source",
        "GHGRP totals are tonnes CO2 equivalent as published",
      ],
    },
    stats,
    ranking_combined: combined,
    ranking_ghg: ghg,
    ranking_toxics: toxics,
    provinces,
  });
}
