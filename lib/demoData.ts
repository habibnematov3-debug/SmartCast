import { CampaignStatus, PaymentStatus } from "@prisma/client";

export const DEMO_LOCATIONS = [
  {
    id: "loc_1",
    name: "Mega Mall Screen A",
    address: "Tashkent, Demo street 1",
    description: "High foot traffic demo location",
    footTrafficPerDay: 12000,
    pricePer30Days: 250
  },
  {
    id: "loc_2",
    name: "Business Center Lobby",
    address: "Tashkent, Demo street 2",
    description: "Premium audience, demo data",
    footTrafficPerDay: 6000,
    pricePer30Days: 180
  }
];

export const DEMO_SCREEN = {
  totalSlots: 18,
  loopSeconds: 60,
  adSeconds: 10
};

const DAY_MS = 24 * 60 * 60 * 1000;

function shiftDays(base: Date, days: number) {
  return new Date(base.getTime() + days * DAY_MS);
}

const now = new Date();

export const DEMO_LOCATIONS_WITH_SCREEN = DEMO_LOCATIONS.map((location, index) => ({
  ...location,
  createdAt: shiftDays(now, -(index + 3)),
  screen: {
    ...DEMO_SCREEN
  }
}));

export const DEMO_CAMPAIGNS = [
  {
    id: "demo_campaign_1",
    locationId: "loc_1",
    advertiserId: "demo_advertiser",
    businessName: "Demo Coffee",
    phone: "+998 90 000 00 01",
    title: "Demo Morning Offer",
    startDate: shiftDays(now, 1),
    endDate: shiftDays(now, 14),
    status: CampaignStatus.APPROVED,
    createdAt: shiftDays(now, -2),
    location: DEMO_LOCATIONS_WITH_SCREEN[0],
    mediaAsset: {
      type: "image/png",
      path: "/smartcast-logo.png"
    },
    proofAsset: null,
    payment: {
      status: PaymentStatus.PENDING
    },
    invoice: null
  },
  {
    id: "demo_campaign_2",
    locationId: "loc_2",
    advertiserId: "demo_advertiser",
    businessName: "Demo Fitness",
    phone: "+998 90 000 00 02",
    title: "Demo Weekend Promo",
    startDate: shiftDays(now, 3),
    endDate: shiftDays(now, 25),
    status: CampaignStatus.LIVE,
    createdAt: shiftDays(now, -1),
    location: DEMO_LOCATIONS_WITH_SCREEN[1],
    mediaAsset: {
      type: "video/mp4",
      path: "/videos/smartcast-intro.mp4"
    },
    proofAsset: {
      path: "/smartcast-logo.png"
    },
    payment: {
      status: PaymentStatus.PAID
    },
    invoice: {
      invoiceNumber: "DEMO-1001"
    }
  }
];

export const DEMO_NOTIFICATIONS = [
  {
    id: "demo_notification_1",
    channel: "EMAIL",
    recipient: "admin@smartcast.local",
    message: "Demo campaign submitted.",
    status: "QUEUED",
    createdAt: shiftDays(now, -1)
  },
  {
    id: "demo_notification_2",
    channel: "TELEGRAM",
    recipient: "telegram-admin",
    message: "Demo payment received.",
    status: "SENT",
    createdAt: now
  }
];

export function getDemoLocationById(id: string) {
  return DEMO_LOCATIONS_WITH_SCREEN.find((location) => location.id === id) ?? null;
}

export function getDemoCampaignById(id: string) {
  const existing = DEMO_CAMPAIGNS.find((campaign) => campaign.id === id);
  if (existing) {
    return existing;
  }

  const fallbackLocation = DEMO_LOCATIONS_WITH_SCREEN[0];
  return {
    id,
    locationId: fallbackLocation.id,
    advertiserId: "demo_advertiser",
    businessName: "Demo Business",
    phone: "+998 90 000 00 00",
    title: "Demo Campaign",
    startDate: now,
    endDate: shiftDays(now, 14),
    status: CampaignStatus.PENDING,
    createdAt: now,
    location: fallbackLocation,
    mediaAsset: {
      type: "image/png",
      path: "/smartcast-logo.png"
    },
    proofAsset: null,
    payment: {
      status: PaymentStatus.PENDING
    },
    invoice: null
  };
}
