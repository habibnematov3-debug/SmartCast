import { daysInclusive } from "@/lib/dates";

export function calculateCampaignPrice(pricePer30Days: number, start: Date, end: Date) {
  const days = daysInclusive(start, end);
  return Math.round((pricePer30Days * days * 100) / 30) / 100;
}

export function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}