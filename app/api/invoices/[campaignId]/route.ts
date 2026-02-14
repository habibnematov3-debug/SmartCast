import { NextResponse } from "next/server";
import { getCurrentAdvertiser } from "@/lib/advertiser-auth";
import { isAdminAuthenticated } from "@/lib/auth";
import { isDemoMode } from "@/lib/demo-mode";
import { formatDate } from "@/lib/dates";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: {
    campaignId: string;
  };
};

export async function GET(_request: Request, { params }: RouteContext) {
  if (isDemoMode) {
    const content = [
      `SmartCast Invoice: DEMO-${params.campaignId}`,
      `Issued: ${new Date().toISOString().slice(0, 10)}`,
      `Campaign ID: ${params.campaignId}`,
      "Campaign: Demo Campaign",
      "Business: Demo Advertiser",
      "Location: Mega Mall Screen A",
      "Amount: $150.00"
    ].join("\n");

    return new NextResponse(content, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `attachment; filename=\"invoice-DEMO-${params.campaignId}.txt\"`
      }
    });
  }

  if (!prisma) {
    return NextResponse.json({ error: "Database unavailable." }, { status: 500 });
  }

  const advertiser = await getCurrentAdvertiser();
  const isAdmin = isAdminAuthenticated();

  if (!advertiser && !isAdmin) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const invoice = await prisma.invoice.findUnique({
    where: {
      campaignId: params.campaignId
    },
    include: {
      campaign: {
        include: {
          location: true
        }
      }
    }
  });

  if (!invoice) {
    return NextResponse.json({ error: "Invoice not found." }, { status: 404 });
  }

  if (!isAdmin && invoice.campaign.advertiserId !== advertiser?.id) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const content = [
    `SmartCast Invoice: ${invoice.invoiceNumber}`,
    `Issued: ${formatDate(invoice.issuedAt)}`,
    `Campaign ID: ${invoice.campaign.id}`,
    `Campaign: ${invoice.campaign.title}`,
    `Business: ${invoice.campaign.businessName}`,
    `Location: ${invoice.campaign.location.name}`,
    `Amount: $${invoice.amountUsd.toFixed(2)}`
  ].join("\n");

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Disposition": `attachment; filename=\"invoice-${invoice.invoiceNumber}.txt\"`
    }
  });
}
