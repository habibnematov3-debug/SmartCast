import { NextResponse } from "next/server";
import { getAvailabilityForRange } from "@/lib/availability";
import { getCurrentAdvertiser } from "@/lib/advertiser-auth";
import { isDemoMode } from "@/lib/demo-mode";
import { isValidDateRange, parseDateOnly } from "@/lib/dates";
import { notifyCampaignEvent } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { saveFileToUploads } from "@/lib/uploads";

function asString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  if (isDemoMode) {
    return Response.json({
      ok: true,
      demo: true,
      id: `demo_${Date.now()}`
    });
  }

  if (!prisma) {
    return NextResponse.json({ error: "Database unavailable." }, { status: 500 });
  }

  try {
    const advertiser = await getCurrentAdvertiser();
    if (!advertiser) {
      return NextResponse.json({ error: "Please sign in first." }, { status: 401 });
    }

    const formData = await request.formData();
    const locationId = asString(formData.get("locationId"));
    const businessName = asString(formData.get("businessName"));
    const phone = asString(formData.get("phone"));
    const title = asString(formData.get("title"));
    const startInput = asString(formData.get("startDate"));
    const endInput = asString(formData.get("endDate"));
    const media = formData.get("media");

    if (!locationId || !businessName || !phone || !title || !startInput || !endInput) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    if (!(media instanceof File) || media.size === 0) {
      return NextResponse.json({ error: "Please upload campaign media." }, { status: 400 });
    }

    const isImage = media.type.startsWith("image/");
    const isMp4 = media.type === "video/mp4";

    if (!isImage && !isMp4) {
      return NextResponse.json({ error: "Only images or MP4 files are allowed." }, { status: 400 });
    }

    const startDate = parseDateOnly(startInput);
    const endDate = parseDateOnly(endInput);

    if (!isValidDateRange(startDate, endDate)) {
      return NextResponse.json({ error: "Invalid date range." }, { status: 400 });
    }

    const location = await prisma.location.findUnique({
      where: {
        id: locationId
      },
      include: {
        screen: true
      }
    });

    if (!location || !location.screen) {
      return NextResponse.json({ error: "Location not found." }, { status: 404 });
    }

    const availability = await getAvailabilityForRange(locationId, startDate, endDate);

    if (availability.availableSlots < 1) {
      return NextResponse.json(
        { error: "No slots available for those dates. Please choose different dates." },
        { status: 409 }
      );
    }

    const mediaPath = await saveFileToUploads(media, "campaigns");

    const campaign = await prisma.campaign.create({
      data: {
        locationId,
        advertiserId: advertiser.id,
        businessName,
        phone,
        title,
        startDate,
        endDate,
        slotCount: 1,
        mediaAsset: {
          create: {
            type: media.type,
            path: mediaPath
          }
        }
      },
      select: {
        id: true
      }
    });

    await notifyCampaignEvent({
      campaignId: campaign.id,
      title,
      businessName,
      phone,
      textEn: "New campaign submitted."
    });

    return NextResponse.json({ id: campaign.id });
  } catch {
    return NextResponse.json({ error: "Could not create campaign." }, { status: 500 });
  }
}
