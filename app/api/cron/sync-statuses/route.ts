import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/demo-mode";
import { syncCampaignStatuses } from "@/lib/campaign-status";

function isAuthorized(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return true;
  }

  const { searchParams } = new URL(request.url);
  const querySecret = searchParams.get("secret");
  const headerSecret = request.headers.get("x-cron-secret");

  return querySecret === secret || headerSecret === secret;
}

export async function GET(request: Request) {
  if (isDemoMode) {
    return Response.json({
      ok: true,
      demo: true,
      scanned: 0,
      updated: 0,
      syncedAt: new Date().toISOString()
    });
  }

  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await syncCampaignStatuses();
  return NextResponse.json({
    ok: true,
    ...result,
    syncedAt: new Date().toISOString()
  });
}
