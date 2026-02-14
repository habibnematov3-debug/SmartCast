import { NextResponse } from "next/server";
import { clearAdvertiserSession } from "@/lib/advertiser-auth";
import { isDemoMode } from "@/lib/demo-mode";

export async function POST(request: Request) {
  if (isDemoMode) {
    await clearAdvertiserSession();
    return NextResponse.redirect(new URL("/auth/login", request.url), 303);
  }

  await clearAdvertiserSession();
  return NextResponse.redirect(new URL("/auth/login", request.url), 303);
}
