import { CampaignStatus } from "@prisma/client";
import { isDemoMode } from "@/lib/demo-mode";
import { prisma } from "@/lib/prisma";

export async function getAvailabilityForRange(locationId: string, startDate: Date, endDate: Date) {
  if (isDemoMode || !prisma) {
    const totalSlots = 18;
    const overlapCount = 4;
    return {
      totalSlots,
      overlapCount,
      availableSlots: Math.max(totalSlots - overlapCount, 0)
    };
  }

  const screen = await prisma.screen.findUnique({
    where: { locationId },
    select: {
      totalSlots: true
    }
  });

  if (!screen) {
    throw new Error("Screen settings not found for location");
  }

  const overlapCount = await prisma.campaign.count({
    where: {
      locationId,
      status: {
        in: [CampaignStatus.APPROVED, CampaignStatus.LIVE]
      },
      startDate: {
        lte: endDate
      },
      endDate: {
        gte: startDate
      }
    }
  });

  const availableSlots = Math.max(screen.totalSlots - overlapCount, 0);

  return {
    totalSlots: screen.totalSlots,
    overlapCount,
    availableSlots
  };
}
