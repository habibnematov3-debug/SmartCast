import type { Metadata } from "next";
import Link from "next/link";
import { CampaignStatus } from "@prisma/client";
import { HomeMarketplace, type MarketplaceLocation } from "@/components/HomeMarketplace";
import { SocialLinks } from "@/components/SocialLinks";
import { getCurrentAdvertiser } from "@/lib/advertiser-auth";
import { syncCampaignStatuses } from "@/lib/campaign-status";
import { DEMO_LOCATIONS_WITH_SCREEN } from "@/lib/demoData";
import { isDemoMode } from "@/lib/demo-mode";
import { addDays, formatDate } from "@/lib/dates";
import { tr } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/pricing";
import { publicBrand, resolveIntroVideo } from "@/lib/public-brand";
import { DEFAULT_TOTAL_SLOTS } from "@/lib/screen-config";
import { getServerLang } from "@/lib/server-lang";

export const metadata: Metadata = {
  title: "SmartCast - Digital Advertising Network",
  description: "Launch ads across coffee shops, gyms, malls and universities in minutes with SmartCast."
};

const locationCategoryRotation = [
  ["restaurant", "cafe"],
  ["bank", "restaurant"],
  ["hospital", "cafe"],
  ["bank", "hospital"]
] as const;

type Category = "cafe" | "bank" | "restaurant" | "hospital";

const publicCategoryLabels: Record<Category, { en: string; ru: string }> = {
  cafe: { en: "Coffee shop", ru: "Кофейня" },
  bank: { en: "Bank branch", ru: "Отделение банка" },
  restaurant: { en: "Restaurant", ru: "Ресторан" },
  hospital: { en: "Medical center", ru: "Медицинский центр" }
};

export default async function HomePage() {
  const lang = getServerLang();
  const advertiser = await getCurrentAdvertiser();
  const introVideo = resolveIntroVideo(publicBrand.introVideoUrl);
  const demoMode = isDemoMode || !prisma;

  if (!advertiser) {
    const locations = demoMode
      ? DEMO_LOCATIONS_WITH_SCREEN.slice(0, 6).sort((a, b) => b.footTrafficPerDay - a.footTrafficPerDay)
      : await prisma!.location.findMany({
          include: {
            screen: true
          },
          orderBy: {
            footTrafficPerDay: "desc"
          },
          take: 6
        });

    const basePrice = locations.length ? Math.min(...locations.map((location) => location.pricePer30Days)) : null;

    return (
      <div className="space-y-14 pb-10">
        <section className="card overflow-hidden border-slate-300 p-0">
          <div className="grid gap-6 p-8 lg:grid-cols-[1.2fr_0.8fr] lg:p-10">
            <div className="space-y-6">
              <span className="badge badge-accent">{tr(lang, "Digital Out-of-Home Platform", "Платформа digital out-of-home")}</span>

              <div className="space-y-4">
                <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-5xl">
                  {tr(
                    lang,
                    "SmartCast - Digital Advertising Network for Real-World Venues",
                    "SmartCast - Сеть цифровой рекламы для реальных площадок"
                  )}
                </h1>
                <p className="max-w-2xl text-base text-slate-600 md:text-lg">
                  {tr(
                    lang,
                    "Launch ads across coffee shops, gyms, malls and universities in minutes.",
                    "Запускайте рекламу в кофейнях, спортзалах, торговых центрах и университетах за минуты."
                  )}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/register"
                  className="rounded-lg border border-slate-900 bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white no-underline"
                >
                  {tr(lang, "Get Started", "Начать")}
                </Link>
                <Link
                  href="/locations"
                  className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 no-underline"
                >
                  {tr(lang, "Explore Locations", "Смотреть локации")}
                </Link>
              </div>
            </div>

            <div className="surface-muted grid gap-3 rounded-2xl p-5">
              <div className="metric space-y-1">
                <p className="text-2xl font-black text-slate-900">25+</p>
                <p className="text-sm text-slate-600">{tr(lang, "venues", "локаций")}</p>
              </div>
              <div className="metric space-y-1">
                <p className="text-2xl font-black text-slate-900">30,000+</p>
                <p className="text-sm text-slate-600">{tr(lang, "daily viewers", "просмотров в день")}</p>
              </div>
              <div className="metric space-y-1">
                <p className="text-2xl font-black text-slate-900">120+</p>
                <p className="text-sm text-slate-600">{tr(lang, "advertisers", "рекламодателей")}</p>
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-5">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">{tr(lang, "How It Works", "Как это работает")}</h2>
            <p className="text-sm text-slate-600">
              {tr(lang, "A simple 3-step flow from idea to live campaign.", "Простой путь из 3 шагов: от идеи до запущенной кампании.")}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <article className="card space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">01</p>
              <h3 className="text-lg font-semibold">{tr(lang, "Choose location", "Выберите локацию")}</h3>
              <p className="text-sm text-slate-600">
                {tr(
                  lang,
                  "Browse high-traffic venues and pick screens that match your audience.",
                  "Просмотрите локации с высоким трафиком и выберите экраны под вашу аудиторию."
                )}
              </p>
            </article>
            <article className="card space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">02</p>
              <h3 className="text-lg font-semibold">{tr(lang, "Upload your ad", "Загрузите рекламу")}</h3>
              <p className="text-sm text-slate-600">
                {tr(
                  lang,
                  "Submit image or video, choose dates, and send your campaign for approval.",
                  "Загрузите изображение или видео, выберите даты и отправьте кампанию на модерацию."
                )}
              </p>
            </article>
            <article className="card space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">03</p>
              <h3 className="text-lg font-semibold">{tr(lang, "Go live", "Запускайтесь")}</h3>
              <p className="text-sm text-slate-600">
                {tr(
                  lang,
                  "Track status from pending to live and manage campaigns in one dashboard.",
                  "Отслеживайте статус от проверки до запуска и управляйте кампаниями в одном кабинете."
                )}
              </p>
            </article>
          </div>
        </section>

        <section className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">{tr(lang, "Locations Preview", "Превью локаций")}</h2>
              <p className="text-sm text-slate-600">
                {tr(
                  lang,
                  "Sample SmartCast venues with strong daily traffic and clear pricing.",
                  "Примеры локаций SmartCast с высоким трафиком и понятной стоимостью."
                )}
              </p>
            </div>
            <Link href="/locations" className="text-sm font-semibold no-underline">
              {tr(lang, "View all locations", "Смотреть все локации")}
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {locations.map((location, index) => {
              const categories = [...locationCategoryRotation[index % locationCategoryRotation.length]] as Category[];

              return (
                <article key={location.id} className="card space-y-3">
                  <div className="h-28 rounded-lg border border-slate-200 bg-gradient-to-br from-sky-50 via-white to-blue-50" />

                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold">{location.name}</h3>
                    <p className="text-sm text-slate-600">{location.address}</p>
                    <p className="text-sm text-slate-600">{location.description}</p>
                  </div>

                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-semibold">{tr(lang, "Foot traffic/day:", "Трафик в день:")}</span>{" "}
                      {location.footTrafficPerDay.toLocaleString()}
                    </p>
                    <p>
                      <span className="font-semibold">{tr(lang, "From:", "От:")}</span>{" "}
                      {formatMoney(location.pricePer30Days)} / {tr(lang, "30 days", "30 дней")}
                    </p>
                    <p>
                      <span className="font-semibold">{tr(lang, "Slots per screen:", "Слотов на экране:")}</span>{" "}
                      {location.screen?.totalSlots ?? DEFAULT_TOTAL_SLOTS}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {categories.map((category) => (
                      <span key={`${location.id}-${category}`} className="badge bg-slate-100 text-slate-700">
                        {tr(lang, publicCategoryLabels[category].en, publicCategoryLabels[category].ru)}
                      </span>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        <section className="space-y-5">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">{tr(lang, "Why SmartCast", "Почему SmartCast")}</h2>
            <p className="text-sm text-slate-600">
              {tr(
                lang,
                "Built for local businesses and agencies who want reliable physical visibility.",
                "Создано для локальных бизнесов и агентств, которым нужна надежная офлайн-видимость."
              )}
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <article className="card">
              <h3 className="text-lg font-semibold">{tr(lang, "Real physical audience", "Реальная офлайн-аудитория")}</h3>
              <p className="mt-2 text-sm text-slate-600">
                {tr(
                  lang,
                  "Reach people in real venues where purchase decisions happen.",
                  "Достигайте людей в реальных местах, где принимаются решения о покупке."
                )}
              </p>
            </article>
            <article className="card">
              <h3 className="text-lg font-semibold">
                {tr(lang, "Transparent rotation (6 positions per screen)", "Прозрачная ротация (6 позиций на экране)")}
              </h3>
              <p className="mt-2 text-sm text-slate-600">
                {tr(
                  lang,
                  "A clear slot model makes campaign placement easy to understand.",
                  "Понятная модель слотов делает размещение кампании простым и прозрачным."
                )}
              </p>
            </article>
            <article className="card">
              <h3 className="text-lg font-semibold">{tr(lang, "Predictable pricing", "Предсказуемые цены")}</h3>
              <p className="mt-2 text-sm text-slate-600">
                {tr(
                  lang,
                  "Straightforward monthly pricing by location with no hidden calculations.",
                  "Прямое месячное ценообразование по локациям без скрытых расчетов."
                )}
              </p>
            </article>
            <article className="card">
              <h3 className="text-lg font-semibold">{tr(lang, "Simple campaign management", "Простое управление кампаниями")}</h3>
              <p className="mt-2 text-sm text-slate-600">
                {tr(
                  lang,
                  "Submit media, track moderation, and manage placements from one account.",
                  "Загружайте медиа, отслеживайте модерацию и управляйте размещениями из одного кабинета."
                )}
              </p>
            </article>
          </div>
        </section>

        <section className="card space-y-4">
          <h2 className="text-2xl font-bold">{tr(lang, "Pricing Overview", "Обзор цен")}</h2>
          <p className="text-sm text-slate-600">
            {tr(
              lang,
              "A slot is one position in the screen ad loop. You reserve one slot for your dates and your ad appears repeatedly each cycle.",
              "Слот - это одна позиция в рекламном цикле экрана. Вы бронируете слот на выбранные даты, и ваша реклама регулярно показывается в каждом цикле."
            )}
          </p>
          <p className="text-sm text-slate-600">
            {basePrice
              ? tr(
                  lang,
                  `Current plans start from ${formatMoney(basePrice)} per 30 days, depending on location traffic.`,
                  `Текущие планы начинаются от ${formatMoney(basePrice)} за 30 дней в зависимости от трафика локации.`
                )
              : tr(
                  lang,
                  "Pricing is available per location. Create an account to view all active offers.",
                  "Цены доступны по каждой локации. Создайте аккаунт, чтобы увидеть все актуальные предложения."
                )}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/pricing"
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 no-underline"
            >
              {tr(lang, "Detailed pricing", "Подробные тарифы")}
            </Link>
            <Link
              href="/register"
              className="rounded-lg border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white no-underline"
            >
              {tr(lang, "Create account", "Создать аккаунт")}
            </Link>
          </div>
        </section>

        <section className="card space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-bold">{tr(lang, "What Is SmartCast? Watch Video", "Что такое SmartCast? Смотрите видео")}</h2>
            <a
              href={introVideo.watchUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm font-semibold text-slate-700 no-underline"
            >
              {tr(lang, "Open video", "Открыть видео")}
            </a>
          </div>
          <p className="text-sm text-slate-600">
            {tr(
              lang,
              "A short intro video that explains how SmartCast works for advertisers. Default file path: /public/smartcast-intro.mp4",
              "Короткое вводное видео о том, как SmartCast работает для рекламодателей. Путь по умолчанию: /public/smartcast-intro.mp4"
            )}
          </p>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <div className="aspect-video w-full">
              {introVideo.mode === "youtube" ? (
                <iframe
                  className="h-full w-full"
                  src={introVideo.embedUrl}
                  title={tr(lang, "SmartCast intro video", "Вводное видео SmartCast")}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              ) : (
                <video className="h-full w-full bg-black" controls preload="metadata">
                  {introVideo.fileSources.map((source) => (
                    <source key={source} src={source} type="video/mp4" />
                  ))}
                  {tr(lang, "Your browser does not support the video tag.", "Ваш браузер не поддерживает тег video.")}
                </video>
              )}
            </div>
          </div>
        </section>

        <footer className="border-t border-slate-200 pt-8">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-600">
              <p>{tr(lang, "Contact: hello@smartcast.uz (placeholder)", "Контакт: hello@smartcast.uz (заглушка)")}</p>
              <Link href="/admin/login" className="text-xs text-slate-500 no-underline hover:text-slate-700">
                {tr(lang, "Staff access", "Доступ для сотрудников")}
              </Link>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                {tr(lang, "Follow SmartCast", "Мы в соцсетях")}
              </p>
              <SocialLinks lang={lang} />
            </div>
          </div>
        </footer>
      </div>
    );
  }

  if (demoMode) {
    const locations = DEMO_LOCATIONS_WITH_SCREEN;
    const today = new Date();
    const windowEnd = addDays(today, 29);

    const marketplaceLocations: MarketplaceLocation[] = locations.map((location, index) => {
      const categorySource = locationCategoryRotation[index % locationCategoryRotation.length];
      const categories = [...categorySource] as Category[];
      const totalSlots = location.screen?.totalSlots ?? DEFAULT_TOTAL_SLOTS;

      return {
        id: location.id,
        name: location.name,
        address: location.address,
        description: location.description,
        footTrafficPerDay: location.footTrafficPerDay,
        pricePer30Days: location.pricePer30Days,
        totalSlots,
        availableSlots: Math.max(totalSlots - 2, 0),
        categories
      };
    });

    return (
      <HomeMarketplace
        lang={lang}
        windowLabel={`${formatDate(today)} - ${formatDate(windowEnd)}`}
        locations={marketplaceLocations}
      />
    );
  }

  await syncCampaignStatuses();

  const locations = await prisma!.location.findMany({
    include: {
      screen: true
    },
    orderBy: {
      createdAt: "asc"
    }
  });

  const today = new Date();
  const windowEnd = addDays(today, 29);

  const availabilityByLocation = await Promise.all(
    locations.map(async (location) => {
      const soldSlots = await prisma!.campaign.count({
        where: {
          locationId: location.id,
          status: {
            in: [CampaignStatus.APPROVED, CampaignStatus.LIVE]
          },
          startDate: {
            lte: windowEnd
          },
          endDate: {
            gte: today
          }
        }
      });

      const totalSlots = location.screen?.totalSlots ?? DEFAULT_TOTAL_SLOTS;

      return {
        locationId: location.id,
        totalSlots,
        availableSlots: Math.max(totalSlots - soldSlots, 0)
      };
    })
  );

  const availabilityMap = new Map(availabilityByLocation.map((item) => [item.locationId, item]));

  const marketplaceLocations: MarketplaceLocation[] = locations.map((location, index) => {
    const availability = availabilityMap.get(location.id);
    const categorySource = locationCategoryRotation[index % locationCategoryRotation.length];
    const categories = [...categorySource] as Category[];

    return {
      id: location.id,
      name: location.name,
      address: location.address,
      description: location.description,
      footTrafficPerDay: location.footTrafficPerDay,
      pricePer30Days: location.pricePer30Days,
      totalSlots: availability?.totalSlots ?? DEFAULT_TOTAL_SLOTS,
      availableSlots: availability?.availableSlots ?? DEFAULT_TOTAL_SLOTS,
      categories
    };
  });

  return (
    <HomeMarketplace
      lang={lang}
      windowLabel={`${formatDate(today)} - ${formatDate(windowEnd)}`}
      locations={marketplaceLocations}
    />
  );
}
