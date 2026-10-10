"use client";

import { useLang } from "@/i18n";
import McpConnect from "./McpConnect";

const endpoints = [
  {
    method: "GET",
    path: "/api/v1/facility/search?q=suncor&limit=3",
    desc: "Search matched facilities by name, company, or city, with province and match-method filters",
    response: `{
  "q": "suncor",
  "total": 9,
  "hits": [
    {
      "npri_id": "2230",
      "ghgrp_id": "G10280",
      "facility_name": "Suncor Energy Inc. Oil Sands",
      "ghg_tco2e": 8036871.1,
      "toxic_total_kg": 126088920.8,
      "match_method": "anchored",
      "confidence": "high"
    }
  ]
}`,
  },
  {
    method: "GET",
    path: "/api/v1/facility/lookup?npri_id=2230",
    desc: "Full combined record: GHG emissions alongside toxic releases, disposals, and transfers",
    response: `{
  "npri_id": "2230",
  "ghgrp_id": "G10280",
  "ghg_tco2e": 8036871.1,
  "toxic_releases_kg": 93907802.0,
  "toxic_disposals_kg": 32181118.8,
  "toxic_transfers_kg": 0,
  "match_method": "anchored",
  "confidence": "high"
}`,
  },
  {
    method: "GET",
    path: "/api/v1/crosswalk/summary",
    desc: "Match statistics, combined emitter/polluter rankings, and per-province aggregates",
    response: `{ "stats": { "anchored": 1422, "resolved": 38,
    "unmatched": 419, "match_rate": 77.7, … },
  "ranking_combined": [ … ],
  "provinces": { "AB": { "facilities": 780, … } } }`,
  },
];

export default function Developers() {
  const { t } = useLang();
  return (
    <section id="developers" className="bg-ink text-white">
      <div className="mx-auto max-w-[1392px] px-6 py-20 md:py-28">
        <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-white/60">{t.developers.kicker}</p>
        <h2 className="display mt-4 max-w-[720px] text-[40px] md:text-[52px]">{t.developers.title}</h2>
        <p className="mt-5 max-w-[720px] text-[18px] leading-relaxed text-white/70">{t.developers.body}</p>

        <h3 className="mt-14 text-[13px] font-semibold uppercase tracking-[0.12em] text-white/60">{t.developers.endpoints}</h3>
        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          {endpoints.map((e) => (
            <article key={e.path} className="flex min-w-0 flex-col rounded-[24px] border border-white/15 bg-white/5 p-6">
              <p className="font-mono text-[12px] font-semibold text-white/60">{e.method}</p>
              <code className="mt-1 break-all font-mono text-[13px] text-white">{e.path}</code>
              <p className="mt-2 text-[14px] text-white/65">{e.desc}</p>
              <pre className="mt-4 flex-1 overflow-x-auto rounded-[16px] bg-black/40 p-4 font-mono text-[12px] leading-relaxed text-white/80">
                {e.response}
              </pre>
              <a
                href={e.path}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-block self-start rounded-full border border-white/25 px-5 py-2 text-[14px] font-semibold hover:border-white"
              >
                {t.developers.tryIt} →
              </a>
            </article>
          ))}
        </div>

        <div className="mt-8">
          <a href="/api/openapi.json" target="_blank" rel="noreferrer" className="block rounded-[24px] bg-white/[0.06] p-6 hover:bg-white/[0.09]">
            <h4 className="text-[19px] font-semibold">{t.developers.openapi}</h4>
            <code className="mt-2 block font-mono text-[13px] text-white/60">GET /api/openapi.json</code>
          </a>
        </div>

        <McpConnect
          config={{
            slug: "facility-crosswalk",
            displayName: "The Facility Crosswalk",
            exampleEn: 'Look up the facility with the highest combined carbon and toxic ranking and show me its numbers',
            exampleFr: 'Trouve l’installation au meilleur rang combiné carbone et toxiques et montre-moi ses chiffres',
          }}
        />
      </div>
    </section>
  );
}
