import { NextResponse } from "next/server";
import { clearAdvertiserSession } from "@/lib/advertiser-auth";

export async function POST(request: Request) {
  await clearAdvertiserSession();
  return NextResponse.redirect(new URL("/auth/login", request.url), 303);
}
