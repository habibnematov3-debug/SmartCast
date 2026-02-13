import { CampaignStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { notifyCampaignEvent } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

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
  const statusInput = formData.get("status");

  if (typeof statusInput !== "string" || !Object.values(CampaignStatus).includes(statusInput as CampaignStatus)) {
    return NextResponse.redirect(pickRedirect(request, formData), 303);
  }

  const campaign = await prisma.campaign.update({
    where: {
      id: params.id
    },
    data: {
      status: statusInput as CampaignStatus
    },
    select: {
      id: true,
      title: true,
      businessName: true,
      phone: true
    }
  });

  await notifyCampaignEvent({
    campaignId: campaign.id,
    title: campaign.title,
    businessName: campaign.businessName,
    phone: campaign.phone,
    textEn: `Campaign status updated to ${statusInput}.`
  });

  return NextResponse.redirect(pickRedirect(request, formData), 303);
}
