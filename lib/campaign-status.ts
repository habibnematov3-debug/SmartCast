import { CampaignStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

function resolveAutoStatus(current: CampaignStatus, startDate: Date, endDate: Date, now: Date) {
  if (current === CampaignStatus.PENDING || current === CampaignStatus.REJECTED) {
    return current;
  }

  if (now > endDate) {
    return CampaignStatus.ENDED;
  }

  if (now >= startDate) {
    return CampaignStatus.LIVE;
  }

  return CampaignStatus.APPROVED;
}

export async function syncCampaignStatuses(now = new Date()) {
  const campaigns = await prisma.campaign.findMany({
    where: {
      status: {
        in: [CampaignStatus.APPROVED, CampaignStatus.LIVE, CampaignStatus.ENDED]
      }
    },
    select: {
      id: true,
      status: true,
      startDate: true,
      endDate: true
    }
  });

  let updated = 0;

  for (const campaign of campaigns) {
    const nextStatus = resolveAutoStatus(campaign.status, campaign.startDate, campaign.endDate, now);

    if (nextStatus !== campaign.status) {
      await prisma.campaign.update({
        where: { id: campaign.id },
        data: { status: nextStatus }
      });
      updated += 1;
    }
  }

  return {
    scanned: campaigns.length,
    updated
  };
}
