import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/demo-mode";
import { setAdminSession, verifyAdminPassword } from "@/lib/auth";

export async function POST(request: Request) {
  if (isDemoMode) {
    setAdminSession();
    return NextResponse.redirect(new URL("/admin", request.url), 303);
  }

  const formData = await request.formData();
  const password = formData.get("password");

  if (typeof password !== "string") {
    return NextResponse.redirect(new URL("/admin/login?error=1", request.url), 303);
  }

  if (!verifyAdminPassword(password)) {
    return NextResponse.redirect(new URL("/admin/login?error=1", request.url), 303);
  }

  setAdminSession();
  return NextResponse.redirect(new URL("/admin", request.url), 303);
}
