import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentAdvertiser } from "@/lib/advertiser-auth";
import { tr } from "@/lib/i18n";
import { getServerLang } from "@/lib/server-lang";

export const metadata: Metadata = {
  title: "About | SmartCast",
  description: "Learn about SmartCast and how we simplify real-world digital advertising for local brands."
};

export default async function AboutPage() {
  const lang = getServerLang();
  const advertiser = await getCurrentAdvertiser();

  if (advertiser) {
    redirect("/");
  }

  return (
    <div className="space-y-8">
      <section className="card space-y-4 p-8">
        <span className="badge badge-accent">{tr(lang, "About SmartCast", "О SmartCast")}</span>
        <h1 className="text-3xl font-black tracking-tight">
          {tr(lang, "Built for practical local advertising", "Создано для практичной локальной рекламы")}
        </h1>
        <p className="max-w-3xl text-sm text-slate-600">
          {tr(
            lang,
            "SmartCast helps advertisers run digital campaigns in real venues such as cafes, banks, restaurants, and healthcare spaces.",
            "SmartCast помогает рекламодателям запускать цифровые кампании в реальных локациях: кафе, банках, ресторанах и медицинских пространствах."
          )}
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="card space-y-2">
          <h2 className="text-xl font-semibold">{tr(lang, "Mission", "Миссия")}</h2>
          <p className="text-sm text-slate-600">
            {tr(
              lang,
              "Make digital out-of-home advertising simple, transparent, and accessible for businesses of any size.",
              "Сделать digital out-of-home рекламу простой, прозрачной и доступной для бизнеса любого масштаба."
            )}
          </p>
        </article>

        <article className="card space-y-2">
          <h2 className="text-xl font-semibold">{tr(lang, "What we focus on", "На чем мы фокусируемся")}</h2>
          <ul className="grid gap-2 text-sm text-slate-600">
            <li>{tr(lang, "Reliable venue inventory", "Надежный инвентарь локаций")}</li>
            <li>{tr(lang, "Clear slot-based booking", "Понятное бронирование по слотам")}</li>
            <li>{tr(lang, "Simple advertiser workflow", "Простой процесс для рекламодателя")}</li>
          </ul>
        </article>
      </section>

      <section className="card space-y-3">
        <h2 className="text-xl font-semibold">{tr(lang, "Who uses SmartCast", "Кто использует SmartCast")}</h2>
        <p className="text-sm text-slate-600">
          {tr(
            lang,
            "Local brands, franchise operators, service businesses, and agencies use SmartCast to stay visible where customers spend time.",
            "Локальные бренды, франшизы, сервисные компании и агентства используют SmartCast, чтобы быть заметными там, где их аудитория проводит время."
          )}
        </p>
      </section>

      <section className="card flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          {tr(lang, "See available venues and start your campaign.", "Посмотрите доступные локации и начните кампанию.")}
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/locations"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 no-underline"
          >
            {tr(lang, "Explore Locations", "Смотреть локации")}
          </Link>
          <Link
            href="/register"
            className="rounded-md border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white no-underline"
          >
            {tr(lang, "Get Started", "Начать")}
          </Link>
        </div>
      </section>
    </div>
  );
}
