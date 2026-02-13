import { NextResponse } from "next/server";
import {
  cleanupExpiredAdvertiserSessions,
  setAdvertiserSession,
  verifyAdvertiserPassword
} from "@/lib/advertiser-auth";
import { prisma } from "@/lib/prisma";

function asText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const email = asText(formData.get("email")).toLowerCase();
    const password = asText(formData.get("password"));

    if (!email || !password) {
      return NextResponse.redirect(new URL("/auth/login?error=invalid", request.url), 303);
    }

    const advertiser = await prisma.advertiser.findUnique({
      where: {
        email
      },
      select: {
        id: true,
        passwordHash: true
      }
    });

    if (!advertiser || !verifyAdvertiserPassword(password, advertiser.passwordHash)) {
      return NextResponse.redirect(new URL("/auth/login?error=invalid", request.url), 303);
    }

    await cleanupExpiredAdvertiserSessions();
    await setAdvertiserSession(advertiser.id);

    return NextResponse.redirect(new URL("/", request.url), 303);
  } catch {
    return NextResponse.redirect(new URL("/auth/login?error=invalid", request.url), 303);
  }
}
