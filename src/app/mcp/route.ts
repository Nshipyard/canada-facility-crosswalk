import { NextResponse } from "next/server";
import { getData, searchFacilities } from "@/lib/crosswalk";

// Minimal MCP server over streamable HTTP (JSON-RPC 2.0 via POST).
// Supports: initialize, tools/list, tools/call. Stateless.

const SERVER = { name: "canada-facility-crosswalk", version: "1.0.0" };

const TOOLS = [
  {
    name: "facility_lookup",
    description:
      "Full combined record for one facility: GHG emissions (tonnes CO2e) alongside toxic releases, disposals, and transfers (kg) for 2024, plus the NPRI-to-GHGRP match method and confidence tier. Lookup by NPRI ID or GHGRP ID.",
    inputSchema: {
      type: "object",
      properties: {
        npri_id: { type: "string", description: "NPRI facility ID, e.g. 1" },
        ghgrp_id: { type: "string", description: "GHGRP facility ID, e.g. G10001" },
      },
    },
  },
  {
    name: "crosswalk_search",
    description:
      "Search the 1,879-facility NPRI-to-GHGRP crosswalk by facility name, company, or city, with optional province and match-method filters, ranked by 2024 GHG emissions.",
    inputSchema: {
      type: "object",
      properties: {
        q: { type: "string", description: "Facility name, company, or city fragment" },
        province: { type: "string", description: "Two-letter province code, e.g. AB" },
        method: { type: "string", description: "Match method: anchored or resolved" },
        limit: { type: "integer", description: "Max results, default 50, max 200" },
      },
    },
  },
  {
    name: "match_stats",
    description:
      "Crosswalk match statistics: anchored vs name/address-resolved vs unmatched counts, the anchor-match rate, temp-ID resolution counts, and the combined emitter/polluter rankings.",
    inputSchema: { type: "object", properties: {} },
  },
];

function ok(id: unknown, result: unknown) {
  return { jsonrpc: "2.0", id, result };
}
function err(id: unknown, code: number, message: string) {
  return { jsonrpc: "2.0", id, error: { code, message } };
}
function textResult(data: unknown) {
  return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

function handle(msg: unknown) {
  const m = msg as { jsonrpc?: string; method?: string; id?: unknown; params?: { name?: string; arguments?: Record<string, unknown> } } | null;
  if (!m || m.jsonrpc !== "2.0" || typeof m.method !== "string") {
    return err((m as { id?: unknown } | null)?.id ?? null, -32600, "Invalid Request");
  }
  const id = m.id ?? null;
  switch (m.method) {
    case "initialize":
      return ok(id, {
        protocolVersion: "2024-11-05",
        capabilities: { tools: {} },
        serverInfo: SERVER,
      });
    case "notifications/initialized":
      return null;
    case "tools/list":
      return ok(id, { tools: TOOLS });
    case "tools/call": {
      const { name, arguments: args } = m.params ?? {};
      try {
        if (name === "facility_lookup") {
          const { byNpri, byGhgrp } = getData();
          const nid = String(args?.npri_id ?? "").trim();
          const gid = String(args?.ghgrp_id ?? "").trim();
          const hit = nid ? byNpri.get(nid) : gid ? byGhgrp.get(gid) : undefined;
          if (!hit) return err(id, -32001, "No matched facility for that id");
          return ok(id, textResult(hit));
        }
        if (name === "crosswalk_search") {
          const q = String(args?.q ?? "");
          const province = String(args?.province ?? "");
          const method = String(args?.method ?? "");
          const limit = Math.min(Math.max(parseInt(String(args?.limit ?? "50"), 10) || 50, 1), 200);
          return ok(id, textResult({ q, province, method, limit, ...searchFacilities(q, province, method, limit) }));
        }
        if (name === "match_stats") {
          const { stats, combined } = getData();
          return ok(id, textResult({ stats, ranking_combined: combined }));
        }
        return err(id, -32602, `Unknown tool ${name}`);
      } catch (e) {
        return err(id, -32000, `Tool error: ${(e as Error).message}`);
      }
    }
    default:
      return err(id, -32601, `Method not found: ${m.method}`);
  }
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(err(null, -32700, "Parse error"), { status: 400 });
  }
  if (Array.isArray(body)) {
    const out = body.map(handle).filter((r) => r !== null);
    return NextResponse.json(out);
  }
  const out = handle(body);
  if (out === null) return new NextResponse(null, { status: 202 });
  return NextResponse.json(out);
}

export async function GET() {
  return NextResponse.json(
    { error: "This MCP server accepts JSON-RPC 2.0 via POST only." },
    { status: 405 }
  );
}

export async function DELETE() {
  return new NextResponse(null, { status: 405 });
}
