import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_TOTAL_SLOTS,
  MAX_TOTAL_SLOTS,
  MIN_TOTAL_SLOTS
} from "@/lib/screen-config";

function toNumber(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return NaN;
  }
  return Number(value);
}

type RouteContext = {
  params: {
    locationId: string;
  };
};

function pickRedirect(request: Request, formData: FormData) {
  const redirectTo = formData.get("redirectTo");
  if (typeof redirectTo === "string" && redirectTo.startsWith("/")) {
    return new URL(redirectTo, request.url);
  }

  const referer = request.headers.get("referer");
  if (referer) {
    return new URL(referer);
  }

  return new URL("/admin", request.url);
}

export async function POST(request: Request, { params }: RouteContext) {
  if (!isAdminAuthenticated()) {
    return NextResponse.redirect(new URL("/admin/login", request.url), 303);
  }

  const formData = await request.formData();
  const totalSlots = toNumber(formData.get("totalSlots"));
  const loopSeconds = toNumber(formData.get("loopSeconds"));
  const adSeconds = toNumber(formData.get("adSeconds"));

  if (!Number.isFinite(totalSlots) || !Number.isFinite(loopSeconds) || !Number.isFinite(adSeconds)) {
    return NextResponse.redirect(pickRedirect(request, formData), 303);
  }

  const parsedTotalSlots = Number.isFinite(totalSlots) ? Math.floor(totalSlots) : DEFAULT_TOTAL_SLOTS;
  const normalizedTotalSlots = Math.min(Math.max(parsedTotalSlots, MIN_TOTAL_SLOTS), MAX_TOTAL_SLOTS);
  const normalizedLoopSeconds = Math.max(Math.floor(loopSeconds), 10);
  const normalizedAdSeconds = Math.max(Math.floor(adSeconds), 1);

  await prisma.screen.upsert({
    where: {
      locationId: params.locationId
    },
    create: {
      locationId: params.locationId,
      totalSlots: normalizedTotalSlots,
      loopSeconds: normalizedLoopSeconds,
      adSeconds: Math.min(normalizedAdSeconds, normalizedLoopSeconds)
    },
    update: {
      totalSlots: normalizedTotalSlots,
      loopSeconds: normalizedLoopSeconds,
      adSeconds: Math.min(normalizedAdSeconds, normalizedLoopSeconds)
    }
  });

  return NextResponse.redirect(pickRedirect(request, formData), 303);
}
