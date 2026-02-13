import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
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

  await prisma.location.delete({
    where: {
      id: params.id
    }
  });

  return NextResponse.redirect(new URL("/admin", request.url), 303);
}