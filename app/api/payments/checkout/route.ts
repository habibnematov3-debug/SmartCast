import { CampaignStatus, PaymentStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { getCurrentAdvertiser } from "@/lib/advertiser-auth";
import { isAdminAuthenticated } from "@/lib/auth";
import { isDemoMode } from "@/lib/demo-mode";
import { daysInclusive } from "@/lib/dates";
import { buildInvoiceNumber } from "@/lib/invoices";
import { notifyCampaignEvent } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";

function asString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeMethod(method: string) {
  const normalized = method.toLowerCase();
  if (normalized === "card" || normalized === "click" || normalized === "payme") {
    return normalized;
  }
  return "";
}

export async function POST(request: Request) {
  if (isDemoMode) {
    return Response.json({
      ok: true,
      demo: true,
      invoiceNumber: `DEMO-${Date.now()}`
    });
  }

  if (!prisma) {
    return NextResponse.json({ error: "Database unavailable." }, { status: 500 });
  }

  try {
    const advertiser = await getCurrentAdvertiser();
    const isAdmin = isAdminAuthenticated();

    if (!advertiser && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const formData = await request.formData();
    const campaignId = asString(formData.get("campaignId"));
    const method = normalizeMethod(asString(formData.get("method")));

    if (!campaignId || !method) {
      return NextResponse.json({ error: "Campaign and payment method are required." }, { status: 400 });
    }

    const campaign = await prisma.campaign.findUnique({
      where: {
        id: campaignId
      },
      include: {
        location: true,
        payment: true,
        invoice: true
      }
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found." }, { status: 404 });
    }

    if (!isAdmin && campaign.advertiserId !== advertiser?.id) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    if (campaign.status === CampaignStatus.REJECTED || campaign.status === CampaignStatus.ENDED) {
      return NextResponse.json({ error: "Campaign cannot be paid in current status." }, { status: 409 });
    }

    const amountUsd = Math.round((campaign.location.pricePer30Days * daysInclusive(campaign.startDate, campaign.endDate) * 100) / 30) / 100;
    const paidAt = new Date();
    const checkoutReference = `PAY-${paidAt.getTime()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    await prisma.payment.upsert({
      where: {
        campaignId
      },
      create: {
        campaignId,
        method,
        amountUsd,
        status: PaymentStatus.PAID,
        checkoutReference,
        paidAt
      },
      update: {
        method,
        amountUsd,
        status: PaymentStatus.PAID,
        checkoutReference,
        paidAt
      }
    });

    const invoice = await prisma.invoice.upsert({
      where: {
        campaignId
      },
      create: {
        campaignId,
        amountUsd,
        invoiceNumber: buildInvoiceNumber(paidAt),
        issuedAt: paidAt
      },
      update: {
        amountUsd
      }
    });

    await notifyCampaignEvent({
      campaignId: campaign.id,
      title: campaign.title,
      businessName: campaign.businessName,
      phone: campaign.phone,
      textEn: `Payment received via ${method.toUpperCase()}. Invoice ${invoice.invoiceNumber} issued.`
    });

    return NextResponse.json({
      ok: true,
      invoiceNumber: invoice.invoiceNumber
    });
  } catch {
    return NextResponse.json({ error: "Could not process payment." }, { status: 500 });
  }
}
