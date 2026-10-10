import fs from "node:fs";
import path from "node:path";

const DATA = path.join(process.cwd(), "public", "data");

export interface Facility {
  npri_id: string;
  ghgrp_id: string;
  facility_name: string;
  company: string;
  city: string;
  province: string;
  lat: string;
  lon: string;
  naics: string;
  sector: string;
  ghg_tco2e: number | null;
  toxic_releases_kg: number;
  toxic_disposals_kg: number;
  toxic_transfers_kg: number;
  toxic_total_kg: number;
  match_method: "anchored" | "resolved";
  confidence: "high" | "medium";
}

export interface Slim {
  npri_id: string;
  ghgrp_id: string;
  facility_name: string;
  company: string;
  city: string;
  province: string;
  ghg_tco2e: number | null;
  toxic_total_kg: number;
  match_method: string;
  confidence: string;
}

export interface Stats {
  vintage: string;
  npri_geo_facilities: number;
  ghgrp_2024_facilities: number;
  anchored: number;
  resolved: number;
  unmatched: number;
  anchor_rate: number;
  match_rate: number;
  npri_id_zero: number;
  npri_id_blank: number;
  temp_ids_found: number;
  temp_ids_resolved: number;
  temp_ids_quarantined: number;
  ghg_total_tco2e: number;
  toxic_releases_total_kg: number;
  matched_with_toxics: number;
  combined_ranked: number;
}

export interface ProvinceAgg {
  facilities: number;
  ghg_tco2e: number;
  toxic_kg: number;
}

interface Cache {
  facilities: Facility[];
  byNpri: Map<string, Facility>;
  byGhgrp: Map<string, Facility>;
  combined: Slim[];
  ghg: Slim[];
  toxics: Slim[];
  stats: Stats;
  provinces: Record<string, ProvinceAgg>;
  quarantine: unknown[];
}

let cache: Cache | null = null;

function read<T>(name: string): T {
  return JSON.parse(fs.readFileSync(path.join(DATA, name), "utf8")) as T;
}

export function getData(): Cache {
  if (cache) return cache;
  const facilities = read<Facility[]>("facilities.json");
  const byNpri = new Map<string, Facility>();
  const byGhgrp = new Map<string, Facility>();
  for (const f of facilities) {
    byNpri.set(f.npri_id, f);
    byGhgrp.set(f.ghgrp_id, f);
  }
  cache = {
    facilities,
    byNpri,
    byGhgrp,
    combined: read<Slim[]>("ranking_combined.json"),
    ghg: read<Slim[]>("ranking_ghg.json"),
    toxics: read<Slim[]>("ranking_toxics.json"),
    stats: read<Stats>("stats.json"),
    provinces: read<Record<string, ProvinceAgg>>("provinces.json"),
    quarantine: read<unknown[]>("quarantine.json"),
  };
  return cache;
}

export function searchFacilities(q: string, province: string, method: string, limit: number) {
  const { facilities } = getData();
  const needle = q.trim().toLowerCase();
  const scored: { f: Facility; score: number }[] = [];
  for (const f of facilities) {
    if (province && f.province !== province) continue;
    if (method && f.match_method !== method) continue;
    if (!needle) {
      scored.push({ f, score: f.ghg_tco2e ?? 0 });
      continue;
    }
    const name = `${f.facility_name} ${f.company} ${f.city}`.toLowerCase();
    const idx = name.indexOf(needle);
    if (idx === -1) continue;
    scored.push({ f, score: idx === 0 ? (f.ghg_tco2e ?? 0) + 1e15 : f.ghg_tco2e ?? 0 });
  }
  scored.sort((a, b) => b.score - a.score);
  return { total: scored.length, hits: scored.slice(0, limit).map((s) => s.f) };
}
