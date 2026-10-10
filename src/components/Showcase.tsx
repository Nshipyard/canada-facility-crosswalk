"use client";

import { useEffect, useMemo, useState } from "react";
import { useLang } from "@/i18n";

interface Slim {
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

interface Facility extends Slim {
  lat: string;
  lon: string;
}

interface Summary {
  stats: {
    ghgrp_2024_facilities: number;
    anchored: number;
    resolved: number;
    unmatched: number;
    anchor_rate: number;
    match_rate: number;
    npri_id_zero: number;
    ghg_total_tco2e: number;
    matched_with_toxics: number;
    temp_ids_resolved: number;
  };
  ranking_combined: Slim[];
  ranking_ghg: Slim[];
  ranking_toxics: Slim[];
}

function fmtShort(n: number | null) {
  if (n == null) return "–";
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K`;
  return `${Math.round(n)}`;
}

// Canada bounding box for the facility map (reported coordinates, equirectangular)
const LON0 = -141.5, LON1 = -52, LAT0 = 41.5, LAT1 = 72;
const W = 960, H = 460;

function project(lon: number, lat: number): [number, number] | null {
  if (!isFinite(lon) || !isFinite(lat)) return null;
  if (lon < LON0 || lon > LON1 || lat < LAT0) return null;
  const x = ((lon - LON0) / (LON1 - LON0)) * W;
  const y = H - ((lat - LAT0) / (LAT1 - LAT0)) * H;
  return [x, y];
}

export default function Showcase() {
  const { t, lang } = useLang();
  const [s, setS] = useState<Summary | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [cite, setCite] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/v1/crosswalk/summary").then((r) => r.json()).then(setS);
    fetch("/api/v1/facility/points").then((r) => r.json()).then((d) => {
      const pts = (d.points ?? []).map((p: { n: string; p: string; la: number; lo: number; g: number | null; t: number }) => ({
        name: p.n, prov: p.p, lat: p.la, lon: p.lo, ghg_tco2e: p.g, toxic_total_kg: p.t,
      }));
      setFacilities(pts);
    });
  }, []);

  const points = useMemo(() => {
    return facilities
      .map((f) => {
        const lon = parseFloat(f.lon), lat = parseFloat(f.lat);
        const p = project(lon, lat);
        if (!p) return null;
        const g = f.ghg_tco2e ?? 0;
        const tx = f.toxic_total_kg ?? 0;
        if (!isFinite(g) || !isFinite(tx)) return null;
        // dominance: log-scale ratio of GHG rank signal vs toxics signal, normalized per axis
        const dom = Math.log10(g + 1) - Math.log10(tx + 1);
        const mag = Math.log10(g + tx + 1);
        if (!isFinite(dom) || !isFinite(mag)) return null;
        return { x: p[0], y: p[1], dom, mag, name: f.facility_name, prov: f.province };
      })
      .filter(Boolean) as { x: number; y: number; dom: number; mag: number; name: string; prov: string }[];
  }, [facilities]);

  if (!s) return null;
  const sc = t.showcase;
  const st = s.stats;

  const donut = [
    { label: sc.anchored, value: st.anchored, color: "#d80621" },
    { label: sc.resolved, value: st.resolved, color: "#0a0f1e" },
    { label: sc.unmatched, value: st.unmatched, color: "rgba(10,15,30,0.15)" },
  ];
  const donutTotal = donut.reduce((a, d) => a + d.value, 0);
  let acc = 0;
  const donutSegs = donut.map((d) => {
    const start = (acc / donutTotal) * 360;
    acc += d.value;
    return { ...d, start, sweep: (d.value / donutTotal) * 360 };
  });

  const combined = s.ranking_combined.slice(0, 15);
  const maxCombinedGhg = Math.max(1, ...combined.map((f) => f.ghg_tco2e ?? 0));
  const maxCombinedTox = Math.max(1, ...combined.map((f) => f.toxic_total_kg));
  const topGhg = s.ranking_ghg.slice(0, 10);
  const maxGhg = Math.max(1, ...topGhg.map((f) => f.ghg_tco2e ?? 0));
  const topTox = s.ranking_toxics.slice(0, 10);
  const maxTox = Math.max(1, ...topTox.map((f) => f.toxic_total_kg));

  function copyCite(id: string, text: string) {
    navigator.clipboard?.writeText(text).catch(() => {});
    setCite(id);
    setTimeout(() => setCite(null), 1800);
  }

  return (
    <section id="showcase" className="bg-paper">
      <div className="mx-auto max-w-[1392px] px-6 py-20 md:py-28">
        <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-canada">{sc.kicker}</p>
        <h2 className="display mt-4 max-w-[720px] text-[40px] md:text-[52px]">{sc.title}</h2>
        <p className="mt-5 max-w-[720px] text-[18px] leading-relaxed text-ink/70">{sc.body}</p>

        {/* Match-rate donut */}
        <h3 className="display mt-16 text-[28px] md:text-[34px]">{sc.matchTitle}</h3>
        <p className="mt-2 max-w-[720px] text-[15px] text-ink/60">{sc.matchSub}</p>
        <div className="mt-8 flex flex-col items-center gap-10 md:flex-row md:gap-16">
          <div className="relative h-56 w-56 shrink-0">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
              <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(10,15,30,0.06)" strokeWidth="16" />
              {donutSegs.map((d) => (
                <circle
                  key={d.label}
                  cx="50" cy="50" r="38" fill="none"
                  stroke={d.color} strokeWidth="16"
                  strokeDasharray={`${(d.sweep / 360) * 2 * Math.PI * 38} ${2 * Math.PI * 38}`}
                  strokeDashoffset={-(d.start / 360) * 2 * Math.PI * 38}
                  strokeLinecap="butt"
                />
              ))}
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="display text-[40px] text-canada">{st.match_rate.toFixed(1)}%</p>
              <p className="text-[13px] text-ink/55">{sc.matched}</p>
            </div>
          </div>
          <div className="grid w-full gap-5 sm:grid-cols-3">
            {donutSegs.map((d) => (
              <div key={d.label} className="rounded-[24px] border border-line bg-paper-warm p-6">
                <p className="flex items-center gap-2 text-[14px] font-semibold">
                  <span className="h-3 w-3 rounded-full" style={{ background: d.color }} />
                  {d.label}
                </p>
                <p className="display mt-2 text-[38px]" style={{ color: d.color === "rgba(10,15,30,0.15)" ? "#0a0f1e" : d.color }}>
                  {d.value.toLocaleString(lang === "fr" ? "fr-CA" : "en-CA")}
                </p>
                <p className="mt-1 text-[13px] text-ink/55">{((d.value / donutTotal) * 100).toFixed(1)}% {sc.ofFacilities}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-6 max-w-[720px] text-[15px] leading-relaxed text-ink/60">{sc.zeroNote}</p>

        {/* Map */}
        <h3 className="display mt-20 text-[28px] md:text-[34px]">{sc.mapTitle}</h3>
        <p className="mt-2 max-w-[720px] text-[15px] text-ink/60">{sc.mapSub}</p>
        <div className="mt-8 overflow-hidden rounded-[24px] border border-line bg-paper-warm">
          <svg viewBox={`0 0 ${W} ${H}`} className="block w-full" role="img" aria-label={sc.mapTitle}>
            <rect x="0" y="0" width={W} height={H} fill="#fbfbfb" />
            {Array.from({ length: 9 }, (_, i) => (
              <line key={`v${i}`} x1={(i * W) / 8} y1="0" x2={(i * W) / 8} y2={H} stroke="rgba(10,15,30,0.05)" strokeWidth="1" />
            ))}
            {Array.from({ length: 5 }, (_, i) => (
              <line key={`h${i}`} x1="0" y1={(i * H) / 4} x2={W} y2={(i * H) / 4} stroke="rgba(10,15,30,0.05)" strokeWidth="1" />
            ))}
            {points.map((p, i) => {
              const color = p.dom > 2 ? "#d80621" : p.dom < -2 ? "#1a3a6b" : "#7a8499";
              const r = Math.min(9, 2 + (p.mag / 9) * 7);
              return (
                <circle key={i} cx={p.x} cy={p.y} r={r} fill={color} opacity={0.72}>
                  <title>{`${p.name} (${p.prov})`}</title>
                </circle>
              );
            })}
          </svg>
          <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-line px-6 py-4 text-[13px] text-ink/60">
            <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#d80621]" />{sc.legendGhg}</span>
            <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#1a3a6b]" />{sc.legendTox}</span>
            <span className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-[#7a8499]" />{sc.legendBoth}</span>
            <span className="ml-auto">{sc.mapFoot}</span>
          </div>
        </div>

        {/* Combined ranking */}
        <h3 className="display mt-20 text-[28px] md:text-[34px]">{sc.combinedTitle}</h3>
        <p className="mt-2 max-w-[720px] text-[15px] text-ink/60">{sc.combinedSub}</p>
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => copyCite("combined", sc.citeCombined)}
            className="rounded-full border border-line px-5 py-2 text-[14px] font-semibold hover:border-ink"
          >
            {cite === "combined" ? sc.copied : sc.citeThis}
          </button>
        </div>
        <div className="mt-6 space-y-5">
          {combined.map((f, i) => (
            <div key={f.npri_id} className="rounded-[24px] border border-line bg-paper-warm p-5 md:p-6">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-[15px] font-semibold leading-snug">
                  <span className="mr-2 font-mono text-[13px] text-ink/40">{i + 1}</span>
                  {f.facility_name}
                  <span className="ml-2 font-normal text-ink/50">{f.city}, {f.province}</span>
                </p>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <div className="flex items-baseline justify-between text-[13px]">
                    <span className="font-medium text-ink/60">{sc.ghgLabel}</span>
                    <span className="font-mono font-semibold text-canada-dark">{fmtShort(f.ghg_tco2e)} t</span>
                  </div>
                  <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-ink/5">
                    <div className="h-full rounded-full bg-canada" style={{ width: `${((f.ghg_tco2e ?? 0) / maxCombinedGhg) * 100}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-baseline justify-between text-[13px]">
                    <span className="font-medium text-ink/60">{sc.toxLabel}</span>
                    <span className="font-mono font-semibold text-[#1a3a6b]">{fmtShort(f.toxic_total_kg)} kg</span>
                  </div>
                  <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-ink/5">
                    <div className="h-full rounded-full bg-[#1a3a6b]" style={{ width: `${(f.toxic_total_kg / maxCombinedTox) * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* GHG only */}
        <h3 className="display mt-20 text-[28px] md:text-[34px]">{sc.ghgTitle}</h3>
        <p className="mt-2 max-w-[720px] text-[15px] text-ink/60">{sc.ghgSub}</p>
        <div className="mt-8 space-y-3">
          {topGhg.map((f, i) => (
            <div key={f.npri_id} className="flex items-center gap-4">
              <span className="w-7 shrink-0 font-mono text-[13px] text-ink/40">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="truncate text-[15px] font-medium">{f.facility_name} <span className="font-normal text-ink/45">· {f.province}</span></p>
                  <p className="shrink-0 font-mono text-[13px] font-semibold text-canada-dark">{fmtShort(f.ghg_tco2e)} t</p>
                </div>
                <div className="mt-1.5 h-3 w-full overflow-hidden rounded-full bg-ink/5">
                  <div className="h-full rounded-full bg-canada" style={{ width: `${((f.ghg_tco2e ?? 0) / maxGhg) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Toxics only */}
        <h3 className="display mt-20 text-[28px] md:text-[34px]">{sc.toxTitle}</h3>
        <p className="mt-2 max-w-[720px] text-[15px] text-ink/60">{sc.toxSub}</p>
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => copyCite("tox", sc.citeTox)}
            className="rounded-full border border-line px-5 py-2 text-[14px] font-semibold hover:border-ink"
          >
            {cite === "tox" ? sc.copied : sc.citeThis}
          </button>
        </div>
        <div className="mt-6 space-y-3">
          {topTox.map((f, i) => (
            <div key={f.npri_id} className="flex items-center gap-4">
              <span className="w-7 shrink-0 font-mono text-[13px] text-ink/40">{i + 1}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="truncate text-[15px] font-medium">{f.facility_name} <span className="font-normal text-ink/45">· {f.province}</span></p>
                  <p className="shrink-0 font-mono text-[13px] font-semibold text-[#1a3a6b]">{fmtShort(f.toxic_total_kg)} kg</p>
                </div>
                <div className="mt-1.5 h-3 w-full overflow-hidden rounded-full bg-ink/5">
                  <div className="h-full rounded-full bg-[#1a3a6b]" style={{ width: `${(f.toxic_total_kg / maxTox) * 100}%` }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
