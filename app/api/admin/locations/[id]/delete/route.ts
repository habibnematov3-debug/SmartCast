import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { isDemoMode } from "@/lib/demo-mode";
import { prisma } from "@/lib/prisma";

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

  await prisma.location.delete({
    where: {
      id: params.id
    }
  });

  return NextResponse.redirect(new URL("/admin", request.url), 303);
}
