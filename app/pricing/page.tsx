import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentAdvertiser } from "@/lib/advertiser-auth";
import { tr } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/pricing";
import { getServerLang } from "@/lib/server-lang";

export const metadata: Metadata = {
  title: "Pricing | SmartCast",
  description: "Transparent SmartCast slot pricing by location with simple monthly campaign budgeting."
};

export default async function PricingPage() {
  const lang = getServerLang();
  const advertiser = await getCurrentAdvertiser();

  if (advertiser) {
    redirect("/");
  }

  const locations = await prisma.location.findMany({
    select: {
      pricePer30Days: true
    }
  });

  const minPrice = locations.length ? Math.min(...locations.map((location) => location.pricePer30Days)) : 0;
  const maxPrice = locations.length ? Math.max(...locations.map((location) => location.pricePer30Days)) : 0;

  return (
    <div className="space-y-8">
      <section className="card space-y-4 p-8">
        <span className="badge badge-accent">{tr(lang, "Pricing", "РўР°СЂРёС„С‹")}</span>
        <h1 className="text-3xl font-black tracking-tight">
          {tr(lang, "Simple, Predictable Campaign Pricing", "РџСЂРѕСЃС‚Р°СЏ Рё РїСЂРµРґСЃРєР°Р·СѓРµРјР°СЏ СЃС‚РѕРёРјРѕСЃС‚СЊ РєР°РјРїР°РЅРёР№")}
        </h1>
        <p className="max-w-3xl text-sm text-slate-600">
          {tr(
            lang,
            "SmartCast uses a clear slot model: reserve one ad position on a screen for your date range and pay the location rate.",
            "SmartCast РёСЃРїРѕР»СЊР·СѓРµС‚ РїРѕРЅСЏС‚РЅСѓСЋ РјРѕРґРµР»СЊ СЃР»РѕС‚РѕРІ: РІС‹ Р±СЂРѕРЅРёСЂСѓРµС‚Рµ РѕРґРЅСѓ СЂРµРєР»Р°РјРЅСѓСЋ РїРѕР·РёС†РёСЋ РЅР° СЌРєСЂР°РЅРµ РЅР° РІС‹Р±СЂР°РЅРЅС‹Рµ РґР°С‚С‹ Рё РѕРїР»Р°С‡РёРІР°РµС‚Рµ С‚Р°СЂРёС„ Р»РѕРєР°С†РёРё."
          )}
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="card space-y-2">
          <h2 className="text-lg font-semibold">{tr(lang, "What is a slot?", "Р§С‚Рѕ С‚Р°РєРѕРµ СЃР»РѕС‚?")}</h2>
          <p className="text-sm text-slate-600">
            {tr(
              lang,
              "A slot is one dedicated position in the screen rotation. One slot belongs to one advertiser for selected dates.",
              "РЎР»РѕС‚ вЂ” СЌС‚Рѕ РѕРґРЅР° РІС‹РґРµР»РµРЅРЅР°СЏ РїРѕР·РёС†РёСЏ РІ СЂРѕС‚Р°С†РёРё СЌРєСЂР°РЅР°. РћРґРёРЅ СЃР»РѕС‚ Р·Р°РєСЂРµРїР»СЏРµС‚СЃСЏ Р·Р° РѕРґРЅРёРј СЂРµРєР»Р°РјРѕРґР°С‚РµР»РµРј РЅР° РІС‹Р±СЂР°РЅРЅС‹Рµ РґР°С‚С‹."
            )}
          </p>
        </article>

        <article className="card space-y-2">
          <h2 className="text-lg font-semibold">{tr(lang, "How billing works", "РљР°Рє СЂР°Р±РѕС‚Р°РµС‚ РѕРїР»Р°С‚Р°")}</h2>
          <p className="text-sm text-slate-600">
            {tr(
              lang,
              "Each location has a base price per 30 days. Campaign total is calculated from location price and date range.",
              "РЈ РєР°Р¶РґРѕР№ Р»РѕРєР°С†РёРё РµСЃС‚СЊ Р±Р°Р·РѕРІР°СЏ С†РµРЅР° Р·Р° 30 РґРЅРµР№. РС‚РѕРіРѕРІР°СЏ СЃС‚РѕРёРјРѕСЃС‚СЊ РєР°РјРїР°РЅРёРё СЂР°СЃСЃС‡РёС‚С‹РІР°РµС‚СЃСЏ РёР· С†РµРЅС‹ Р»РѕРєР°С†РёРё Рё РґРёР°РїР°Р·РѕРЅР° РґР°С‚."
            )}
          </p>
        </article>

        <article className="card space-y-2">
          <h2 className="text-lg font-semibold">{tr(lang, "Pricing range", "Р”РёР°РїР°Р·РѕРЅ С†РµРЅ")}</h2>
          <p className="text-sm text-slate-600">
            {minPrice && maxPrice
              ? tr(
                  lang,
                  `${formatMoney(minPrice)} to ${formatMoney(maxPrice)} per 30 days depending on venue traffic.`,
                  `РћС‚ ${formatMoney(minPrice)} РґРѕ ${formatMoney(maxPrice)} Р·Р° 30 РґРЅРµР№ РІ Р·Р°РІРёСЃРёРјРѕСЃС‚Рё РѕС‚ С‚СЂР°С„РёРєР° РїР»РѕС‰Р°РґРєРё.`
                )
              : tr(lang, "Pricing data will appear after locations are added.", "Р”Р°РЅРЅС‹Рµ РїРѕ С‚Р°СЂРёС„Р°Рј РїРѕСЏРІСЏС‚СЃСЏ РїРѕСЃР»Рµ РґРѕР±Р°РІР»РµРЅРёСЏ Р»РѕРєР°С†РёР№.")}
          </p>
        </article>
      </section>

      <section className="card space-y-3">
        <h2 className="text-xl font-semibold">{tr(lang, "Why advertisers choose SmartCast", "РџРѕС‡РµРјСѓ СЂРµРєР»Р°РјРѕРґР°С‚РµР»Рё РІС‹Р±РёСЂР°СЋС‚ SmartCast")}</h2>
        <ul className="grid gap-2 text-sm text-slate-600">
          <li>{tr(lang, "Clear monthly pricing per location", "РџРѕРЅСЏС‚РЅР°СЏ РјРµСЃСЏС‡РЅР°СЏ С†РµРЅР° РїРѕ Р»РѕРєР°С†РёРё")}</li>
          <li>{tr(lang, "No hidden media buying complexity", "Р‘РµР· СЃРєСЂС‹С‚РѕР№ СЃР»РѕР¶РЅРѕСЃС‚Рё РјРµРґРёР°Р±Р°РёРЅРіР°")}</li>
          <li>{tr(lang, "One account for campaign creation and tracking", "РћРґРёРЅ Р°РєРєР°СѓРЅС‚ РґР»СЏ Р·Р°РїСѓСЃРєР° Рё РєРѕРЅС‚СЂРѕР»СЏ РєР°РјРїР°РЅРёР№")}</li>
        </ul>
      </section>

      <section className="card flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          {tr(lang, "Launch your first campaign today.", "Р—Р°РїСѓСЃС‚РёС‚Рµ РІР°С€Сѓ РїРµСЂРІСѓСЋ РєР°РјРїР°РЅРёСЋ СѓР¶Рµ СЃРµРіРѕРґРЅСЏ.")}
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/register"
            className="rounded-md border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white no-underline"
          >
            {tr(lang, "Get Started", "РќР°С‡Р°С‚СЊ")}
          </Link>
          <Link
            href="/locations"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 no-underline"
          >
            {tr(lang, "View Locations", "РЎРјРѕС‚СЂРµС‚СЊ Р»РѕРєР°С†РёРё")}
          </Link>
        </div>
      </section>
    </div>
  );
}
