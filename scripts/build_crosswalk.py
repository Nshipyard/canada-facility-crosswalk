#!/usr/bin/env python3
"""Build the NPRI-to-GHGRP facility crosswalk, P2 of Open Nshipyard.

Sources (retrieved 2026-10-10, Open Government Licence - Canada):
- NPRI bulk geolocations file (ECCC, updated 2026-05-01): 24,553 facility records
- NPRI bulk releases/disposals/transfers files 1993-2024 (ECCC): per-substance quantities
- GHGRP emissions-by-gas file PDGES-GHGRP-GHGEmissionsGES-2004-Present (ECCC, updated 2026-05-27)

Methods: anchor matches on self-reported NPRI ID, temp-ID alias resolution,
name/address/company entity resolution with spatial QA, quarantine of low-confidence matches.
"""
import csv, json, re, math, sys
from collections import Counter, defaultdict
from difflib import SequenceMatcher

TMP = "/home/hatch/workspace/canada-facility-crosswalk/scripts/raw"
OUT = "/home/hatch/workspace/canada-facility-crosswalk/public/data"

LEGAL = r"\b(LTD|LIMITED|INC|INCORPORATED|CORP|CORPORATION|CO|COMPANY|LLC|LP|LLP|ULC|SENC|LTÉE|LTEE|S\.?A\.?|GMBH|BV|NV|PLC)\b\.?"
FR_LEGAL = r"\b(LIMITÉE|LIMITEE|INCORPORÉE|INCORPOREE)\b\.?"

def norm_name(s):
    s = (s or "").upper()
    s = re.sub(r"[ÉÈÊË]", "E", s); s = re.sub(r"[ÀÂÄ]", "A", s)
    s = re.sub(r"[ÎÏ]", "I", s); s = re.sub(r"[ÔÖ]", "O", s)
    s = re.sub(r"[ÙÛÜ]", "U", s); s = re.sub(r"Ç", "C", s)
    s = re.sub(FR_LEGAL, " ", s); s = re.sub(LEGAL, " ", s)
    s = re.sub(r"[^A-Z0-9 ]", " ", s)
    s = re.sub(r"\s+", " ", s).strip()
    return s

def norm_addr(s):
    s = (s or "").upper()
    s = re.sub(r"[ÉÈÊË]", "E", s); s = re.sub(r"[^A-Z0-9 ]", " ", s)
    s = re.sub(r"\b(STREET|ST|RUE|ROAD|RD|AVENUE|AVE|BOULEVARD|BLVD|DRIVE|DR|CHEMIN|CH|HIGHWAY|HWY|ROUTE)\b", " ", s)
    return re.sub(r"\s+", " ", s).strip()

def hav_km(a, b, c, d):
    try:
        a, b, c, d = float(a), float(b), float(c), float(d)
    except (TypeError, ValueError):
        return None
    R = 6371.0
    p1, p2 = math.radians(a), math.radians(c)
    return 2 * R * math.asin(math.sqrt(math.sin((p2 - p1) / 2) ** 2 +
                                       math.cos(p1) * math.cos(p2) * math.sin(math.radians(d - b) / 2) ** 2))

def get(r, i):
    return r[i].strip() if i < len(r) else ""

def num(s):
    try:
        return float((s or "").replace(",", "").replace(" ", ""))
    except ValueError:
        return None

# ---------------------------------------------------------------- NPRI geo master
print("loading NPRI geo master...", flush=True)
geo = {}
by_norm = defaultdict(list)   # (province, norm_facility_name) -> ids
with open(f"{TMP}/npri_geo.csv", encoding="cp1252", errors="replace") as f:
    rd = csv.reader(f); next(rd)
    for r in rd:
        nid = get(r, 1)
        if not nid:
            continue
        rec = dict(npri_id=nid, year_last=get(r, 0), company=get(r, 2), fac_name=get(r, 3),
                   addr1=get(r, 4), addr2=get(r, 5), city=get(r, 6), prov=get(r, 7),
                   postal=get(r, 8), lat=get(r, 11), lon=get(r, 12), naics=get(r, 14),
                   naics_en=get(r, 15), sector=get(r, 18))
        geo[nid] = rec
        nn = norm_name(rec["fac_name"])
        if nn:
            by_norm[(rec["prov"], nn)].append(nid)
print(f"  geo master: {len(geo)} facilities")

# ------------------------------------------------- NPRI 2024 toxic totals + temp IDs
def aggregate(path, year):
    totals = defaultdict(float)
    ids_seen = Counter()
    units = Counter()
    teq_rows = 0
    with open(path, encoding="cp1252", errors="replace") as f:
        rd = csv.reader(f); hdr = next(rd)
        for r in rd:
            if get(r, 0) != year:
                continue
            nid = get(r, 1)
            ids_seen[nid] += 1
            q = num(get(r, 15)); u = get(r, 16)
            units[u] += 1
            if q is None:
                continue
            ul = u.lower()
            if ul.startswith("tonne"):
                q *= 1000.0
            elif ul.startswith("gram"):
                q /= 1000.0
            elif "teq" in ul:
                # grams of toxic equivalent (dioxins/furans): not a mass, excluded from kg sums
                teq_rows += 1
                continue
            totals[nid] += q
    return totals, ids_seen, units, teq_rows

print("aggregating 2024 NPRI releases...", flush=True)
rel_tot, rel_ids, rel_units, rel_teq = aggregate(f"{TMP}/npri_releases.csv", "2024")
print("aggregating 2024 NPRI disposals...", flush=True)
dis_tot, dis_ids, dis_units, dis_teq = aggregate(f"{TMP}/npri_disposals.csv", "2024")
print("aggregating 2024 NPRI transfers...", flush=True)
import os as _os
_trn_path = f"{TMP}/npri_transfers.csv"
if _os.path.exists(_trn_path) and _os.path.getsize(_trn_path) >= 75442870:
    trn_tot, trn_ids, trn_units, trn_teq = aggregate(_trn_path, "2024")
else:
    trn_tot, trn_ids, trn_units, trn_teq = defaultdict(float), Counter(), Counter(), 0
    print("  WARNING: transfers file incomplete or missing; transfers excluded from totals")
print(f"  releases: {len(rel_tot)} facilities, units={rel_units.most_common(5)}")
print(f"  disposals: {len(dis_tot)} facilities, units={dis_units.most_common(5)}")
print(f"  g-TEQ rows excluded from kg sums: releases={rel_teq}, disposals={dis_teq}, transfers={trn_teq}")
print(f"  transfers: {len(trn_tot)} facilities, units={trn_units.most_common(5)}")

# temp IDs: NPRI_ID values in quantity files absent from the geo master
qty_ids = set(rel_ids) | set(dis_ids) | set(trn_ids)
temp_candidates = sorted(qty_ids - set(geo.keys()))
print(f"  quantity-file IDs not in geo master (temp/unknown): {len(temp_candidates)}")
print(f"  sample: {temp_candidates[:20]}")

# resolve temp IDs to master IDs via exact normalized (province, facility name)
temp_alias = {}      # temp_id -> master_id
temp_quarantine = [] # ambiguous
for tid in temp_candidates:
    # find the facility name used with this temp id in the releases file
    names = set()
    provs = set()
    with open(f"{TMP}/npri_releases.csv", encoding="cp1252", errors="replace") as f:
        rd = csv.reader(f); next(rd)
        for r in rd:
            if get(r, 0) == "2024" and get(r, 1) == tid:
                if get(r, 3): names.add(norm_name(get(r, 3)))
                if get(r, 7): provs.add(get(r, 7))
                if len(names) > 3: break
    hits = set()
    for nm in names:
        for pv in provs or [""]:
            hits.update(by_norm.get((pv, nm), []))
    hits.discard(tid)
    if len(hits) == 1:
        temp_alias[tid] = hits.pop()
    elif len(hits) > 1:
        temp_quarantine.append({"temp_id": tid, "names": sorted(names)[:3],
                                "candidate_masters": sorted(hits)})
print(f"  temp IDs resolved to master: {len(temp_alias)}; quarantined: {len(temp_quarantine)}")

# fold temp-ID quantities into master totals
for tid, mid in temp_alias.items():
    rel_tot[mid] += rel_tot.pop(tid, 0.0)
    dis_tot[mid] += dis_tot.pop(tid, 0.0)
    trn_tot[mid] += trn_tot.pop(tid, 0.0)

# ---------------------------------------------------------------- GHGRP 2024
print("loading GHGRP 2024...", flush=True)
gh = []
with open(f"{TMP}/ghgrp_ges.csv", encoding="utf-8-sig", errors="replace") as f:
    rd = csv.reader(f); next(rd)
    for r in rd:
        if get(r, 1) != "2024":
            continue
        gh.append(dict(ghgrp_id=get(r, 0), fac_name=get(r, 2), location=get(r, 3),
                       city=get(r, 4), prov=get(r, 5), postal=get(r, 6),
                       lat=get(r, 7), lon=get(r, 8), npri_id=get(r, 9),
                       naics=get(r, 10), company=get(r, 13),
                       ghg=num(get(r, 76))))
print(f"  GHGRP 2024 rows: {len(gh)}")

# ---------------------------------------------------------------- matching
matched = []
unmatched = []
quarantine = list(temp_quarantine)
by_prov = defaultdict(list)
for nid, rec in geo.items():
    by_prov[rec["prov"]].append(nid)

def candidates(prov):
    return by_prov.get(prov, [])

PROV_FULL = {"Alberta": "AB", "Ontario": "ON", "British Columbia": "BC", "Quebec": "QC",
             "Saskatchewan": "SK", "Manitoba": "MB", "New Brunswick": "NB", "Nova Scotia": "NS",
             "Newfoundland and Labrador": "NL", "Northwest Territories": "NT", "Nunavut": "NU",
             "Prince Edward Island": "PE", "Yukon": "YT"}
def prov_code(p):
    p = (p or "").strip()
    return PROV_FULL.get(p, p)

for g in gh:
    nid = g["npri_id"]
    method, conf, mid = None, None, None
    if nid and nid != "0" and nid in geo:
        method, conf, mid = "anchored", "high", nid
    else:
        prov = prov_code(g["prov"])
        nn = norm_name(g["fac_name"]); nc = norm_name(g["company"])
        na = norm_addr(g["location"] or g["city"])
        best, best_score = None, 0.0
        for cid in candidates(prov):
            c = geo[cid]
            cn = norm_name(c["fac_name"]); cc = norm_name(c["company"])
            score = 0.0
            if nn and nn == cn:
                score = 1.0
            elif nn and cn:
                score = max(score, 0.75 * SequenceMatcher(None, nn, cn).ratio())
            if nc and nc == cc:
                score = max(score, 0.85)
            elif nc and cc:
                score = max(score, 0.5 * SequenceMatcher(None, nc, cc).ratio())
            d = hav_km(g["lat"], g["lon"], c["lat"], c["lon"])
            if d is not None and d > 25:
                score *= 0.5
            if score > best_score:
                best, best_score = cid, score
        if best and best_score >= 0.9:
            d = hav_km(g["lat"], g["lon"], geo[best]["lat"], geo[best]["lon"])
            if d is None or d <= 25:
                method, conf, mid = "resolved", ("high" if best_score >= 0.99 else "medium"), best
            else:
                quarantine.append({"ghgrp_id": g["ghgrp_id"], "ghgrp_name": g["fac_name"],
                                   "candidate_npri_id": best, "reason": "name match but coords >25km apart",
                                   "distance_km": round(d, 1)})
        elif best and best_score >= 0.75:
            quarantine.append({"ghgrp_id": g["ghgrp_id"], "ghgrp_name": g["fac_name"],
                               "candidate_npri_id": best, "reason": "low similarity score",
                               "score": round(best_score, 3)})
    if method:
        matched.append((g, mid, method, conf))
    else:
        unmatched.append(g)

print(f"  anchored: {sum(1 for _,_,m,_ in matched if m=='anchored')}")
print(f"  resolved: {sum(1 for _,_,m,_ in matched if m=='resolved')}")
print(f"  unmatched GHGRP rows: {len(unmatched)}")
print(f"  quarantined: {len(quarantine)}")

# ---------------------------------------------------------------- combined records
def tox(nid):
    return (rel_tot.get(nid, 0.0), dis_tot.get(nid, 0.0), trn_tot.get(nid, 0.0))

facilities = []
for g, mid, method, conf in matched:
    c = geo[mid]
    r_, d_, t_ = tox(mid)
    facilities.append(dict(
        npri_id=mid, ghgrp_id=g["ghgrp_id"],
        facility_name=c["fac_name"] or g["fac_name"], company=c["company"] or g["company"],
        city=c["city"] or g["city"], province=c["prov"] or prov_code(g["prov"]),
        lat=c["lat"] or g["lat"], lon=c["lon"] or g["lon"],
        naics=c["naics"] or g["naics"], sector=c["sector"] or "",
        ghg_tco2e=g["ghg"], toxic_releases_kg=round(r_, 1),
        toxic_disposals_kg=round(d_, 1), toxic_transfers_kg=round(t_, 1),
        toxic_total_kg=round(r_ + d_ + t_, 1),
        match_method=method, confidence=conf))

# rankings
by_ghg = sorted([f for f in facilities if f["ghg_tco2e"]], key=lambda x: -x["ghg_tco2e"])
by_tox = sorted([f for f in facilities if f["toxic_total_kg"] > 0], key=lambda x: -x["toxic_total_kg"])
ghg_rank = {f["ghgrp_id"]: i + 1 for i, f in enumerate(by_ghg)}
tox_rank = {f["ghgrp_id"]: i + 1 for i, f in enumerate(by_tox)}
both = [f for f in facilities if f["ghg_tco2e"] and f["toxic_total_kg"] > 0]
for f in both:
    f["combined_ranksum"] = ghg_rank[f["ghgrp_id"]] + tox_rank[f["ghgrp_id"]]
combined = sorted(both, key=lambda x: x["combined_ranksum"])[:25]

def slim(f):
    return {k: f[k] for k in ("npri_id", "ghgrp_id", "facility_name", "company", "city",
                              "province", "ghg_tco2e", "toxic_total_kg", "match_method",
                              "confidence")}

stats = dict(
    vintage="2024 reporting year (NPRI reviewed; GHGRP latest)",
    npri_geo_facilities=len(geo),
    ghgrp_2024_facilities=len(gh),
    anchored=sum(1 for _, _, m, _ in matched if m == "anchored"),
    resolved=sum(1 for _, _, m, _ in matched if m == "resolved"),
    unmatched=len(unmatched),
    anchor_rate=round(100 * sum(1 for _, _, m, _ in matched if m == "anchored") / len(gh), 1),
    match_rate=round(100 * len(matched) / len(gh), 1),
    npri_id_zero=sum(1 for g in gh if g["npri_id"] == "0"),
    npri_id_blank=sum(1 for g in gh if not g["npri_id"]),
    temp_ids_found=len(temp_candidates),
    temp_ids_resolved=len(temp_alias),
    temp_ids_quarantined=len([q for q in quarantine if q.get("temp_id")]),
    ghg_total_tco2e=round(sum(f["ghg_tco2e"] or 0 for f in facilities)),
    toxic_releases_total_kg=round(sum(f["toxic_releases_kg"] for f in facilities)),
    matched_with_toxics=len(by_tox),
    combined_ranked=len(combined),
)

prov_agg = defaultdict(lambda: {"facilities": 0, "ghg": 0.0, "tox": 0.0})
for f in facilities:
    p = prov_agg[f["province"]]
    p["facilities"] += 1
    p["ghg"] += f["ghg_tco2e"] or 0
    p["tox"] += f["toxic_total_kg"]

import os
os.makedirs(OUT, exist_ok=True)
json.dump(facilities, open(f"{OUT}/facilities.json", "w"), ensure_ascii=False)
json.dump([slim(f) for f in combined], open(f"{OUT}/ranking_combined.json", "w"), ensure_ascii=False)
json.dump([slim(f) for f in by_ghg[:25]], open(f"{OUT}/ranking_ghg.json", "w"), ensure_ascii=False)
json.dump([slim(f) for f in by_tox[:25]], open(f"{OUT}/ranking_toxics.json", "w"), ensure_ascii=False)
json.dump(stats, open(f"{OUT}/stats.json", "w"), indent=1)
json.dump({k: {"facilities": v["facilities"], "ghg_tco2e": round(v["ghg"]),
               "toxic_kg": round(v["tox"])} for k, v in prov_agg.items()},
          open(f"{OUT}/provinces.json", "w"), indent=1)
json.dump(temp_alias, open(f"{OUT}/temp_id_aliases.json", "w"), indent=1)
json.dump(quarantine, open(f"{OUT}/quarantine.json", "w"), ensure_ascii=False, indent=1)
with open(f"{OUT}/crosswalk.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["npri_id", "ghgrp_id", "match_method", "confidence", "temp_id_aliases"])
    alias_by_master = defaultdict(list)
    for t, m in temp_alias.items():
        alias_by_master[m].append(t)
    for g, mid, method, conf in matched:
        w.writerow([mid, g["ghgrp_id"], method, conf, ";".join(sorted(alias_by_master.get(mid, [])))])

print(json.dumps(stats, indent=1))
print("\nTOP 5 combined (rank-sum):")
for f in combined[:5]:
    print(f"  {f['facility_name'][:55]:55s} GHG rank {ghg_rank[f['ghgrp_id']]:4d}  tox rank {tox_rank[f['ghgrp_id']]:4d}  {f['ghg_tco2e']:>14,.0f} tCO2e  {f['toxic_total_kg']:>14,.0f} kg")
print("\nTOP 5 GHG-only:")
for f in by_ghg[:5]:
    print(f"  {f['facility_name'][:55]:55s} {f['ghg_tco2e']:>14,.0f} tCO2e  tox {f['toxic_total_kg']:>12,.0f} kg")
print("\nTOP 5 toxics (matched):")
for f in by_tox[:5]:
    print(f"  {f['facility_name'][:55]:55s} {f['toxic_total_kg']:>14,.0f} kg  GHG {f['ghg_tco2e'] or 0:>12,.0f} tCO2e")
print("\nUNMATCHED sample:", [(u["ghgrp_id"], u["fac_name"][:40], u["npri_id"]) for u in unmatched[:8]])
