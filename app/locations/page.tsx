import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentAdvertiser } from "@/lib/advertiser-auth";
import { DEMO_LOCATIONS_WITH_SCREEN } from "@/lib/demoData";
import { isDemoMode } from "@/lib/demo-mode";
import { tr } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/pricing";
import { DEFAULT_TOTAL_SLOTS } from "@/lib/screen-config";
import { getServerLang } from "@/lib/server-lang";

export const metadata: Metadata = {
  title: "Locations | SmartCast",
  description: "Preview SmartCast screen locations across Tashkent with audience and monthly pricing details."
};

const locationTypes = [
  { en: "Cafe", ru: "Кафе" },
  { en: "Restaurant", ru: "Ресторан" },
  { en: "Bank", ru: "Банк" },
  { en: "Hospital", ru: "Больница" }
];

export default async function PublicLocationsPage() {
  const lang = getServerLang();
  const advertiser = await getCurrentAdvertiser();
  const demoMode = isDemoMode || !prisma;

  if (advertiser) {
    redirect("/");
  }

  const locations = demoMode
    ? DEMO_LOCATIONS_WITH_SCREEN.slice(0, 12)
    : await prisma!.location.findMany({
        include: {
          screen: true
        },
        orderBy: {
          createdAt: "asc"
        },
        take: 12
      });

  return (
    <div className="space-y-8">
      <section className="card grid gap-6 p-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-3">
          <span className="badge badge-accent">{tr(lang, "SmartCast Coverage", "Покрытие SmartCast")}</span>
          <h1 className="text-3xl font-black tracking-tight">{tr(lang, "Locations Across Tashkent", "Локации по Ташкенту")}</h1>
          <p className="text-sm text-slate-600">
            {tr(
              lang,
              "Preview high-traffic venue categories where SmartCast screens can host your ad campaigns.",
              "Посмотрите категории локаций с высоким трафиком, где экраны SmartCast могут показывать ваши рекламные кампании."
            )}
          </p>
          <div className="flex flex-wrap gap-2 text-xs">
            {locationTypes.map((type) => (
              <span key={type.en} className="badge bg-slate-100 text-slate-700">
                {tr(lang, type.en, type.ru)}
              </span>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200">
          <div className="relative aspect-video w-full">
            <Image
              src="/tashkent-map.png"
              alt={tr(lang, "SmartCast map in Tashkent", "Карта SmartCast в Ташкенте")}
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {locations.map((location, index) => {
          const type = locationTypes[index % locationTypes.length];
          return (
            <article key={location.id} className="card space-y-3">
              <div className="h-24 rounded-lg border border-slate-200 bg-gradient-to-br from-sky-50 via-white to-blue-50" />
              <div className="space-y-1">
                <h2 className="text-lg font-semibold">{location.name}</h2>
                <p className="text-sm text-slate-600">{location.address}</p>
              </div>
              <p className="text-sm text-slate-600">{location.description}</p>
              <div className="space-y-1 text-sm">
                <p>
                  <span className="font-semibold">{tr(lang, "Audience/day:", "Аудитория в день:")}</span>{" "}
                  {location.footTrafficPerDay.toLocaleString()}
                </p>
                <p>
                  <span className="font-semibold">{tr(lang, "Price:", "Цена:")}</span>{" "}
                  {formatMoney(location.pricePer30Days)} / {tr(lang, "30 days", "30 дней")}
                </p>
                <p>
                  <span className="font-semibold">{tr(lang, "Total slots:", "Всего слотов:")}</span>{" "}
                  {location.screen?.totalSlots ?? DEFAULT_TOTAL_SLOTS}
                </p>
              </div>
              <span className="badge bg-slate-100 text-slate-700">{tr(lang, type.en, type.ru)}</span>
            </article>
          );
        })}
      </section>

      <section className="card flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          {tr(lang, "Create an account to check availability and launch campaigns.", "Создайте аккаунт, чтобы проверять доступность и запускать кампании.")}
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/register"
            className="rounded-md border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white no-underline"
          >
            {tr(lang, "Get Started", "Начать")}
          </Link>
          <Link
            href="/login"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 no-underline"
          >
            {tr(lang, "Sign In", "Войти")}
          </Link>
        </div>
      </section>
    </div>
  );
}
