import Link from "next/link";
import { CampaignStatus } from "@prisma/client";
import { notFound, redirect } from "next/navigation";
import { AvailabilityChecker } from "@/components/AvailabilityChecker";
import { getCurrentAdvertiser } from "@/lib/advertiser-auth";
import { isAdminAuthenticated } from "@/lib/auth";
import { syncCampaignStatuses } from "@/lib/campaign-status";
import { getAvailabilityForRange } from "@/lib/availability";
import { addDays } from "@/lib/dates";
import { tr } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/pricing";
import { MAX_TOTAL_SLOTS, MIN_TOTAL_SLOTS } from "@/lib/screen-config";
import { getServerLang } from "@/lib/server-lang";

type PageProps = {
  params: {
    id: string;
  };
};

function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

function dayLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC"
  }).format(date);
}

function availabilityTone(available: number) {
  if (available < 1) return "border-rose-300 bg-rose-50 text-rose-700";
  if (available < 4) return "border-amber-300 bg-amber-50 text-amber-700";
  return "border-emerald-300 bg-emerald-50 text-emerald-700";
}

export default async function LocationPage({ params }: PageProps) {
  const lang = getServerLang();
  const isAdmin = isAdminAuthenticated();
  const advertiser = await getCurrentAdvertiser();

  if (!advertiser && !isAdmin) {
    redirect("/auth/login");
  }

  await syncCampaignStatuses();

  const location = await prisma.location.findUnique({
    where: {
      id: params.id
    },
    include: {
      screen: true
    }
  });

  if (!location || !location.screen) {
    notFound();
  }

  const screen = location.screen;

  const startDate = new Date();
  const endDate = addDays(startDate, 29);
  const availability = await getAvailabilityForRange(location.id, startDate, endDate);

  const calendarCampaigns = await prisma.campaign.findMany({
    where: {
      locationId: location.id,
      status: {
        in: [CampaignStatus.APPROVED, CampaignStatus.LIVE]
      },
      startDate: {
        lte: endDate
      },
      endDate: {
        gte: startDate
      }
    },
    select: {
      startDate: true,
      endDate: true
    }
  });

  const calendarDays = Array.from({ length: 30 }, (_, index) => {
    const date = addDays(startDate, index);
    const sold = calendarCampaigns.filter((campaign) => campaign.startDate <= date && campaign.endDate >= date).length;
    const availableSlots = Math.max(screen.totalSlots - sold, 0);

    return {
      date,
      sold,
      availableSlots
    };
  });

  return (
    <section className="space-y-4">
      <Link
        href="/"
        className="inline-flex rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 no-underline"
      >
        {tr(lang, "Back to locations", "Назад к локациям")}
      </Link>

      <div className="card space-y-3">
        <h1 className="text-2xl font-semibold">{location.name}</h1>
        <p className="text-sm text-slate-600">{location.address}</p>
        <p className="text-sm text-slate-600">{location.description}</p>

        <div className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-slate-500">{tr(lang, "Foot traffic/day", "Трафик в день")}</p>
            <p className="font-medium">{location.footTrafficPerDay.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-slate-500">{tr(lang, "Price per 30 days", "Цена за 30 дней")}</p>
            <p className="font-medium">{formatMoney(location.pricePer30Days)}</p>
          </div>
          <div>
            <p className="text-slate-500">{tr(lang, "Loop settings", "Настройки цикла")}</p>
            <p className="font-medium">
              {screen.totalSlots} {tr(lang, "slots", "слотов")} / {screen.loopSeconds}s {tr(lang, "loop", "цикл")}
            </p>
          </div>
          <div>
            <p className="text-slate-500">{tr(lang, "Ad duration", "Длительность рекламы")}</p>
            <p className="font-medium">{screen.adSeconds}s</p>
          </div>
        </div>
      </div>

      <div className="card space-y-3">
        <h2 className="text-xl font-semibold">
          {tr(lang, "30-day availability calendar", "Календарь доступности на 30 дней")}
        </h2>
        <p className="text-sm text-slate-600">
          {tr(
            lang,
            "Each tile shows available slots for that date based on approved/live campaigns.",
            "Каждая ячейка показывает доступные слоты на конкретную дату по одобренным/активным кампаниям."
          )}
        </p>

        <div className="grid gap-2 sm:grid-cols-5 lg:grid-cols-6">
          {calendarDays.map((entry) => (
            <div key={entry.date.toISOString()} className={`rounded-md border p-2 text-xs ${availabilityTone(entry.availableSlots)}`}>
              <p className="font-medium">{dayLabel(entry.date)}</p>
              <p>{entry.availableSlots} {tr(lang, "available", "доступно")}</p>
              <p>{entry.sold} {tr(lang, "sold", "занято")}</p>
            </div>
          ))}
        </div>
      </div>

      <AvailabilityChecker
        lang={lang}
        locationId={location.id}
        defaultStartDate={formatDateInput(startDate)}
        defaultEndDate={formatDateInput(endDate)}
        initialAvailability={availability}
      />

      {isAdmin ? (
        <form action={`/api/admin/screens/${location.id}`} method="post" className="card space-y-3">
          <input type="hidden" name="redirectTo" value={`/locations/${location.id}`} />
          <h2 className="text-xl font-semibold">{tr(lang, "Admin: Screen settings", "Админ: настройки экрана")}</h2>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="field-label">
              {tr(lang, "Total slots", "Всего слотов")}
              <input
                name="totalSlots"
                type="number"
                min={MIN_TOTAL_SLOTS}
                max={MAX_TOTAL_SLOTS}
                defaultValue={screen.totalSlots}
                required
              />
            </label>
            <label className="field-label">
              {tr(lang, "Loop seconds", "Секунды цикла")}
              <input
                name="loopSeconds"
                type="number"
                min={10}
                defaultValue={screen.loopSeconds}
                required
              />
            </label>
            <label className="field-label">
              {tr(lang, "Ad seconds", "Секунды рекламы")}
              <input name="adSeconds" type="number" min={1} defaultValue={screen.adSeconds} required />
            </label>
          </div>

          <button type="submit" className="sm:w-fit">
            {tr(lang, "Save settings", "Сохранить настройки")}
          </button>
        </form>
      ) : null}
    </section>
  );
}
