import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentAdvertiser } from "@/lib/advertiser-auth";
import { tr } from "@/lib/i18n";
import { publicBrand, resolveIntroVideo } from "@/lib/public-brand";
import { getServerLang } from "@/lib/server-lang";

export const metadata: Metadata = {
  title: "How It Works | SmartCast",
  description: "See how SmartCast campaigns go from location selection to live digital screen placement."
};

export default async function HowItWorksPage() {
  const lang = getServerLang();
  const advertiser = await getCurrentAdvertiser();
  const introVideo = resolveIntroVideo(publicBrand.introVideoUrl);

  if (advertiser) {
    redirect("/");
  }

  return (
    <div className="space-y-10">
      <section className="card space-y-4 p-8">
        <span className="badge badge-accent">{tr(lang, "How SmartCast Works", "Как работает SmartCast")}</span>
        <h1 className="text-3xl font-black tracking-tight">
          {tr(lang, "From campaign idea to live screen placement", "От идеи кампании до запуска на экранах")}
        </h1>
        <p className="max-w-3xl text-sm text-slate-600">
          {tr(
            lang,
            "SmartCast helps local businesses and agencies launch outdoor digital ads in minutes: choose a location, upload creative, and go live.",
            "SmartCast помогает локальному бизнесу и агентствам запускать цифровую наружную рекламу за минуты: выберите локацию, загрузите креатив и выходите в эфир."
          )}
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="card space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Step 1</p>
          <h2 className="text-xl font-semibold">{tr(lang, "Choose location", "Выберите локацию")}</h2>
          <p className="text-sm text-slate-600">
            {tr(
              lang,
              "Browse available venues, compare audience potential, and select the best point for your campaign.",
              "Просмотрите доступные площадки, сравните потенциал аудитории и выберите подходящую точку для вашей кампании."
            )}
          </p>
        </article>

        <article className="card space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Step 2</p>
          <h2 className="text-xl font-semibold">{tr(lang, "Upload your ad", "Загрузите рекламу")}</h2>
          <p className="text-sm text-slate-600">
            {tr(
              lang,
              "Add campaign details, upload image/video, and choose your date range.",
              "Добавьте детали кампании, загрузите изображение или видео и выберите диапазон дат."
            )}
          </p>
        </article>

        <article className="card space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Step 3</p>
          <h2 className="text-xl font-semibold">{tr(lang, "Go live", "Запускайтесь")}</h2>
          <p className="text-sm text-slate-600">
            {tr(
              lang,
              "After moderation approval, the campaign becomes active and status updates in your account.",
              "После модерации кампания становится активной, а статус обновляется в вашем кабинете."
            )}
          </p>
        </article>
      </section>

      <section className="card space-y-4 p-6 md:p-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">{tr(lang, "Watch SmartCast in action", "Смотрите SmartCast в действии")}</h2>
          <p className="text-sm text-slate-600">
            {tr(
              lang,
              "Press play to watch a quick walkthrough of how SmartCast campaigns work from start to launch.",
              "Нажмите Play, чтобы посмотреть короткое видео о том, как запускаются кампании в SmartCast."
            )}
          </p>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200">
          <div className="aspect-video w-full">
            {introVideo.mode === "youtube" ? (
              <iframe
                className="h-full w-full"
                src={introVideo.embedUrl}
                title={tr(lang, "SmartCast walkthrough video", "Видео-обзор SmartCast")}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            ) : (
              <video className="h-full w-full bg-black" controls preload="metadata" playsInline>
                {introVideo.fileSources.map((source) => (
                  <source key={source} src={source} type="video/mp4" />
                ))}
                {tr(lang, "Your browser does not support the video tag.", "Ваш браузер не поддерживает видео.")}
              </video>
            )}
          </div>
        </div>
      </section>

      <section className="card flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">
          {tr(lang, "Ready to launch your first campaign?", "Готовы запустить первую кампанию?")}
        </p>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/register"
            className="rounded-md border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white no-underline"
          >
            {tr(lang, "Get Started", "Начать")}
          </Link>
          <Link
            href="/locations"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 no-underline"
          >
            {tr(lang, "Browse Locations", "Смотреть локации")}
          </Link>
        </div>
      </section>
    </div>
  );
}
