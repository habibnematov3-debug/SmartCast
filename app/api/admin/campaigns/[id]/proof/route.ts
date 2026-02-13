import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveFileToUploads } from "@/lib/uploads";

type RouteContext = {
  params: {
    id: string;
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
  const proof = formData.get("proof");

  if (!(proof instanceof File) || proof.size === 0 || !proof.type.startsWith("image/")) {
    return NextResponse.redirect(pickRedirect(request, formData), 303);
  }

  const proofPath = await saveFileToUploads(proof, "proofs");

  await prisma.proofAsset.upsert({
    where: {
      campaignId: params.id
    },
    create: {
      campaignId: params.id,
      path: proofPath
    },
    update: {
      path: proofPath
    }
  });

  return NextResponse.redirect(pickRedirect(request, formData), 303);
}