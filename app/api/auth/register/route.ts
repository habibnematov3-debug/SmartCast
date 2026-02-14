import { NextResponse } from "next/server";
import {
  cleanupExpiredAdvertiserSessions,
  hashAdvertiserPassword,
  setAdvertiserSession
} from "@/lib/advertiser-auth";
import { isDemoMode } from "@/lib/demo-mode";
import { prisma } from "@/lib/prisma";

function asText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function isEmail(input: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input);
}

export async function POST(request: Request) {
  if (isDemoMode) {
    await setAdvertiserSession("demo_advertiser");
    return NextResponse.redirect(new URL("/", request.url), 303);
  }

  if (!prisma) {
    return NextResponse.redirect(new URL("/auth/register?error=server", request.url), 303);
  }

  try {
    const formData = await request.formData();
    const name = asText(formData.get("name"));
    const phone = asText(formData.get("phone"));
    const email = asText(formData.get("email")).toLowerCase();
    const password = asText(formData.get("password"));

    if (!name || !phone || !email || !password || !isEmail(email) || password.length < 6) {
      return NextResponse.redirect(new URL("/auth/register?error=invalid", request.url), 303);
    }

    const exists = await prisma.advertiser.findUnique({
      where: {
        email
      },
      select: {
        id: true
      }
    });

    if (exists) {
      return NextResponse.redirect(new URL("/auth/register?error=exists", request.url), 303);
    }

    const advertiser = await prisma.advertiser.create({
      data: {
        name,
        phone,
        email,
        passwordHash: hashAdvertiserPassword(password)
      },
      select: {
        id: true
      }
    });

    await cleanupExpiredAdvertiserSessions();
    await setAdvertiserSession(advertiser.id);

    return NextResponse.redirect(new URL("/", request.url), 303);
  } catch {
    return NextResponse.redirect(new URL("/auth/register?error=server", request.url), 303);
  }
}
