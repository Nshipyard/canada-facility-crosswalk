# The Facility Crosswalk

## What this skill gives you

A canonical join between Canada's two federal facility emissions registries for the 2024 reporting year:

- **NPRI** (National Pollutant Release Inventory): toxic releases, disposals, transfers per facility, kilograms.
- **GHGRP** (Greenhouse Gas Reporting Program): greenhouse gas emissions per facility, tonnes CO2 equivalent.

The registries publish no shared facility key. This skill ships the crosswalk: anchor matches on self-reported NPRI IDs (75.7% of 1,879 GHGRP facilities), entity resolution for the rest, quarantine for the ambiguous.

## When to use it

- "Which facilities are the worst combined carbon emitters and toxic polluters in Canada?"
- "How much did facility X emit in 2024, and what toxics did it release?"
- "Which province has the most carbon-heavy facilities that also top the toxics list?"

## How to query it

REST base: `{origin}/api/v1`

```
GET /api/v1/facility/search?q=syncrude&limit=5
GET /api/v1/facility/lookup?npri_id=107
GET /api/v1/crosswalk/summary
```

OpenAPI 3.1: `{origin}/api/openapi.json`

MCP (streamable HTTP): `POST {origin}/mcp` with JSON-RPC 2.0. Tools:

- `facility_lookup` (npri_id or ghgrp_id): full combined record.
- `crosswalk_search` (q, province, method, limit): search the crosswalk.
- `match_stats`: match statistics and the combined ranking.

## Reading a record

- `ghg_tco2e`: 2024 GHG emissions in tonnes CO2 equivalent.
- `toxic_releases_kg`, `toxic_disposals_kg`, `toxic_transfers_kg`: 2024 NPRI quantities in kilograms, units normalized.
- `match_method`: `anchored` (self-reported NPRI ID) or `resolved` (name/address/company match).
- `confidence`: `high` or `medium`. Quarantined near-matches are excluded from the file entirely. See `public/data/quarantine.json` for the audit log.

## Limits you must state

2024 vintage on both sides. GHGRP covers facilities at 10 kt CO2e or more. NPRI has its own substance thresholds. Kilograms are not harm: different substances differ in toxicity. 426 GHGRP facilities report NPRI ID as bare `0`, a placeholder, not an ID.

Author: Richardson Dackam. Not affiliated with the Government of Canada or ECCC.
