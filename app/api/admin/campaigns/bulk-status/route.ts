import { CampaignStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { notifyCampaignEvent } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

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

export async function POST(request: Request) {
  if (!isAdminAuthenticated()) {
    return NextResponse.redirect(new URL("/admin/login", request.url), 303);
  }

  const formData = await request.formData();
  const statusInput = formData.get("status");
  const ids = formData.getAll("campaignIds").filter((value): value is string => typeof value === "string");

  if (typeof statusInput !== "string" || !Object.values(CampaignStatus).includes(statusInput as CampaignStatus) || !ids.length) {
    return NextResponse.redirect(pickRedirect(request, formData), 303);
  }

  const campaigns = await prisma.campaign.findMany({
    where: {
      id: {
        in: ids
      }
    },
    select: {
      id: true,
      title: true,
      businessName: true,
      phone: true
    }
  });

  await prisma.campaign.updateMany({
    where: {
      id: {
        in: campaigns.map((campaign) => campaign.id)
      }
    },
    data: {
      status: statusInput as CampaignStatus
    }
  });

  await Promise.all(
    campaigns.map((campaign) =>
      notifyCampaignEvent({
        campaignId: campaign.id,
        title: campaign.title,
        businessName: campaign.businessName,
        phone: campaign.phone,
        textEn: `Campaign status updated to ${statusInput} (bulk action).`
      })
    )
  );

  return NextResponse.redirect(pickRedirect(request, formData), 303);
}
