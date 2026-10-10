import { NextResponse } from "next/server";
import { getData } from "@/lib/crosswalk";

// Lightweight point set for the showcase map: every matched facility with coordinates.
export async function GET() {
  const { facilities } = getData();
  const pts = [];
  for (const f of facilities) {
    const lat = parseFloat(f.lat);
    const lon = parseFloat(f.lon);
    if (!isFinite(lat) || !isFinite(lon)) continue;
    pts.push({
      n: f.facility_name,
      p: f.province,
      la: lat,
      lo: lon,
      g: f.ghg_tco2e,
      t: f.toxic_total_kg,
    });
  }
  return NextResponse.json({ total: pts.length, points: pts });
}
