import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { isDemoMode } from "@/lib/demo-mode";
import { prisma } from "@/lib/prisma";

function toNumber(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return NaN;
  }
  return Number(value);
}

function toText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

type RouteContext = {
  params: {
    id: string;
  };
};

export async function POST(request: Request, { params }: RouteContext) {
  if (!isAdminAuthenticated()) {
    return NextResponse.redirect(new URL("/admin/login", request.url), 303);
  }

  if (isDemoMode) {
    return NextResponse.redirect(new URL("/admin", request.url), 303);
  }

  if (!prisma) {
    return NextResponse.redirect(new URL("/admin?error=db-unavailable", request.url), 303);
  }

  const formData = await request.formData();
  const name = toText(formData.get("name"));
  const address = toText(formData.get("address"));
  const description = toText(formData.get("description"));
  const footTrafficPerDay = toNumber(formData.get("footTrafficPerDay"));
  const pricePer30Days = toNumber(formData.get("pricePer30Days"));

  if (!name || !address || !description || !Number.isFinite(footTrafficPerDay) || !Number.isFinite(pricePer30Days)) {
    return NextResponse.redirect(new URL("/admin?error=invalid-location", request.url), 303);
  }

  await prisma.location.update({
    where: {
      id: params.id
    },
    data: {
      name,
      address,
      description,
      footTrafficPerDay: Math.max(Math.floor(footTrafficPerDay), 1),
      pricePer30Days: Math.max(Math.floor(pricePer30Days), 1)
    }
  });

  return NextResponse.redirect(new URL("/admin", request.url), 303);
}
