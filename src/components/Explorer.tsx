"use client";

import { useEffect, useState } from "react";
import { useLang } from "@/i18n";

interface Hit {
  npri_id: string;
  ghgrp_id: string;
  facility_name: string;
  company: string;
  city: string;
  province: string;
  ghg_tco2e: number | null;
  toxic_releases_kg: number;
  toxic_disposals_kg: number;
  toxic_transfers_kg: number;
  toxic_total_kg: number;
  match_method: string;
  confidence: string;
  naics: string;
  sector: string;
  lat: string;
  lon: string;
}

function fmt(n: number, lang: string) {
  return n.toLocaleString(lang === "fr" ? "fr-CA" : "en-CA");
}

function ghg(n: number | null) {
  if (n == null) return "–";
  if (n >= 1e6) return `${(n / 1e6).toFixed(2)}M t`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K t`;
  return `${Math.round(n)} t`;
}

function tox(n: number) {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B kg`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M kg`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(0)}K kg`;
  return `${Math.round(n)} kg`;
}

const PROVINCES = ["AB", "BC", "MB", "NB", "NL", "NS", "NT", "NU", "ON", "PE", "QC", "SK", "YT"];

export default function Explorer() {
  const { t, lang } = useLang();
  const [q, setQ] = useState("");
  const [province, setProvince] = useState("");
  const [method, setMethod] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [total, setTotal] = useState(0);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<Hit | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  async function run(query: string, prov: string, meth: string) {
    setLoading(true);
    try {
      const params = new URLSearchParams({ q: query, province: prov, method: meth, limit: "40" });
      const res = await fetch(`/api/v1/facility/search?${params}`);
      const data = await res.json();
      setHits(data.hits ?? []);
      setTotal(data.total ?? 0);
      setSearched(true);
    } finally {
      setLoading(false);
    }
  }

  async function openFacility(npriId: string) {
    setDetailLoading(true);
    try {
      const res = await fetch(`/api/v1/facility/lookup?npri_id=${encodeURIComponent(npriId)}`);
      const data = await res.json();
      setDetail(data.npri_id ? data : null);
    } finally {
      setDetailLoading(false);
    }
  }

  useEffect(() => {
    const id = setTimeout(() => run(q, province, method), 300);
    return () => clearTimeout(id);
  }, [q, province, method]);

  const e = t.explorer;

  if (detail || detailLoading) {
    return (
      <div>
        <button
          onClick={() => setDetail(null)}
          className="mb-6 rounded-full border border-line px-5 py-2.5 text-[15px] font-semibold hover:border-ink"
        >
          ← {e.back}
        </button>
        {detailLoading && <p className="text-[15px] text-ink/55">…</p>}
        {detail && (
          <article className="rounded-[24px] border border-line bg-paper p-6 md:p-8">
            <p className="font-mono text-[12px] uppercase tracking-wide text-ink/45">
              NPRI {detail.npri_id} · GHGRP {detail.ghgrp_id}
            </p>
            <h3 className="display mt-2 text-[30px] md:text-[38px]">{detail.facility_name}</h3>
            <p className="mt-1 text-[15px] text-ink/60">
              {detail.company}
              {detail.city ? ` · ${detail.city}` : ""}
              {detail.province ? `, ${detail.province}` : ""}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-ink/5 px-3.5 py-1.5 text-[13px] font-medium">
                {detail.match_method === "anchored" ? e.anchored : e.resolved}
              </span>
              <span className="rounded-full bg-ink/5 px-3.5 py-1.5 text-[13px]">
                {e.confidence}: {detail.confidence}
              </span>
              {detail.sector && (
                <span className="rounded-full bg-ink/5 px-3.5 py-1.5 text-[13px]">{detail.sector}</span>
              )}
            </div>
            <div className="mt-6 grid gap-px overflow-hidden rounded-[20px] border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
              {[
                { v: ghg(detail.ghg_tco2e), l: e.ghg },
                { v: tox(detail.toxic_releases_kg), l: e.releases },
                { v: tox(detail.toxic_disposals_kg), l: e.disposals },
                { v: tox(detail.toxic_transfers_kg), l: e.transfers },
              ].map((s) => (
                <div key={s.l} className="bg-paper-warm p-5">
                  <p className="display text-[30px] text-canada">{s.v}</p>
                  <p className="mt-1 text-[13px] text-ink/60">{s.l}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 max-w-[720px] text-[13px] leading-relaxed text-ink/50">{e.unitNote}</p>
          </article>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-3 md:flex-row">
        <input
          value={q}
          onChange={(ev) => setQ(ev.target.value)}
          placeholder={e.search}
          className="w-full flex-1 rounded-full border border-line bg-paper px-6 py-3.5 text-[16px] outline-none placeholder:text-ink/35 focus:border-canada"
          aria-label={e.search}
        />
        <div className="flex gap-3">
          <select
            value={province}
            onChange={(ev) => setProvince(ev.target.value)}
            className="rounded-full border border-line bg-paper px-5 py-3.5 text-[15px] outline-none focus:border-canada"
            aria-label={e.province}
          >
            <option value="">{e.allProvinces}</option>
            {PROVINCES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <select
            value={method}
            onChange={(ev) => setMethod(ev.target.value)}
            className="rounded-full border border-line bg-paper px-5 py-3.5 text-[15px] outline-none focus:border-canada"
            aria-label={e.method}
          >
            <option value="">{e.allMethods}</option>
            <option value="anchored">{e.anchored}</option>
            <option value="resolved">{e.resolved}</option>
          </select>
        </div>
      </div>
      <div className="mt-8">
        {!searched && !loading && <p className="max-w-[640px] text-[15px] leading-relaxed text-ink/55">{e.empty}</p>}
        {loading && <p className="text-[15px] text-ink/55">…</p>}
        {searched && !loading && hits.length === 0 && <p className="text-[15px] text-ink/55">{e.noResult}</p>}
        {hits.length > 0 && (
          <>
            <p className="mb-4 text-[14px] text-ink/55">
              {e.showing} {hits.length} {e.of} {fmt(total, lang)}
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              {hits.map((h) => (
                <button
                  key={h.npri_id}
                  onClick={() => openFacility(h.npri_id)}
                  className="rounded-[24px] border border-line bg-paper p-6 text-left transition-colors hover:border-canada"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-[16px] font-semibold leading-snug">{h.facility_name}</p>
                    <p className="shrink-0 font-mono text-[11px] text-ink/40">NPRI {h.npri_id}</p>
                  </div>
                  <p className="mt-1 text-[13px] text-ink/55">
                    {h.company}
                    {h.city ? ` · ${h.city}` : ""}, {h.province}
                  </p>
                  <div className="mt-3 flex flex-wrap items-baseline gap-x-6 gap-y-1">
                    <p className="display text-[28px] text-canada">{ghg(h.ghg_tco2e)}</p>
                    <p className="text-[14px] text-ink/60">
                      {tox(h.toxic_total_kg)} <span className="text-ink/45">{e.toxics}</span>
                    </p>
                  </div>
                  <p className="mt-2 text-[12px] text-ink/45">
                    {h.match_method === "anchored" ? e.anchored : e.resolved} · {e.confidence}: {h.confidence}
                  </p>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
