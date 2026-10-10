import { NextResponse } from "next/server";
import { getData } from "@/lib/crosswalk";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const npriId = (url.searchParams.get("npri_id") ?? "").trim();
  const ghgrpId = (url.searchParams.get("ghgrp_id") ?? "").trim();
  const { byNpri, byGhgrp } = getData();
  const hit = npriId ? byNpri.get(npriId) : ghgrpId ? byGhgrp.get(ghgrpId) : undefined;
  if (!hit) {
    return NextResponse.json({ error: "No matched facility for that id" }, { status: 404 });
  }
  return NextResponse.json(hit);
}
