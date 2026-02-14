import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/demo-mode";
import { clearAdminSession } from "@/lib/auth";

export async function POST(request: Request) {
  if (isDemoMode) {
    clearAdminSession();
    return NextResponse.redirect(new URL("/admin/login", request.url), 303);
  }

  clearAdminSession();
  return NextResponse.redirect(new URL("/admin/login", request.url), 303);
}
