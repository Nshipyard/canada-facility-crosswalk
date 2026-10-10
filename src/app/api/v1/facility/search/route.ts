import { NextResponse } from "next/server";
import { searchFacilities } from "@/lib/crosswalk";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? "";
  const province = url.searchParams.get("province") ?? "";
  const method = url.searchParams.get("method") ?? "";
  const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") ?? "50", 10) || 50, 1), 200);
  const { total, hits } = searchFacilities(q, province, method, limit);
  return NextResponse.json({ q, province, method, limit, total, hits });
}
