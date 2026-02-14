import Link from "next/link";
import { CampaignStatus } from "@prisma/client";
import { redirect } from "next/navigation";
import { StatusBadge } from "@/components/StatusBadge";
import { isAdminAuthenticated } from "@/lib/auth";
import { syncCampaignStatuses } from "@/lib/campaign-status";
import { DEMO_CAMPAIGNS, DEMO_LOCATIONS_WITH_SCREEN, DEMO_NOTIFICATIONS } from "@/lib/demoData";
import { isDemoMode } from "@/lib/demo-mode";
import { addDays, daysInclusive, formatDate } from "@/lib/dates";
import { tr } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/pricing";
import { DEFAULT_TOTAL_SLOTS, MAX_TOTAL_SLOTS, MIN_TOTAL_SLOTS } from "@/lib/screen-config";
import { getServerLang } from "@/lib/server-lang";

type AdminPageProps = {
  searchParams: {
    q?: string;
    status?: string;
    payment?: string;
  };
};

function overlaps(startA: Date, endA: Date, startB: Date, endB: Date) {
  return startA <= endB && endA >= startB;
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const lang = getServerLang();
  const demoMode = isDemoMode || !prisma;

  if (!isAdminAuthenticated()) {
    redirect("/admin/login");
  }

  if (!demoMode) {
    await syncCampaignStatuses();
  }

  const [locations, campaigns, notifications] = demoMode
    ? [DEMO_LOCATIONS_WITH_SCREEN, DEMO_CAMPAIGNS, DEMO_NOTIFICATIONS]
    : await Promise.all([
        prisma!.location.findMany({
          include: {
            screen: true
          },
          orderBy: {
            createdAt: "asc"
          }
        }),
        prisma!.campaign.findMany({
          include: {
            location: {
              include: {
                screen: true
              }
            },
            mediaAsset: true,
            proofAsset: true,
            payment: true,
            invoice: true
          },
          orderBy: {
            createdAt: "desc"
          }
        }),
        prisma!.notificationLog.findMany({
          orderBy: {
            createdAt: "desc"
          },
          take: 20
        })
      ]);

  const paidStatuses = new Set<CampaignStatus>([
    CampaignStatus.APPROVED,
    CampaignStatus.LIVE,
    CampaignStatus.ENDED
  ]);

  const totalRevenue = campaigns.reduce((sum, campaign) => {
    if (!paidStatuses.has(campaign.status)) {
      return sum;
    }

    const days = daysInclusive(campaign.startDate, campaign.endDate);
    return sum + (campaign.location.pricePer30Days * days) / 30;
  }, 0);

  const activeCampaignsCount = campaigns.filter((campaign) => campaign.status === CampaignStatus.LIVE).length;

  const windowStart = new Date();
  const windowEnd = addDays(windowStart, 29);

  const fillRates = locations.map((location) => {
    const totalSlots = location.screen?.totalSlots ?? DEFAULT_TOTAL_SLOTS;

    const soldSlots = campaigns.filter((campaign) => {
      return (
        campaign.locationId === location.id &&
        (campaign.status === CampaignStatus.APPROVED || campaign.status === CampaignStatus.LIVE) &&
        overlaps(campaign.startDate, campaign.endDate, windowStart, windowEnd)
      );
    }).length;

    return {
      location,
      soldSlots,
      totalSlots,
      fillRate: totalSlots ? Math.min((soldSlots / totalSlots) * 100, 100) : 0
    };
  });

  const query = searchParams.q?.trim().toLowerCase() ?? "";
  const statusFilter = searchParams.status;
  const paymentFilter = searchParams.payment;

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesQuery =
      !query ||
      `${campaign.title} ${campaign.businessName} ${campaign.phone} ${campaign.location.name}`.toLowerCase().includes(query);

    const matchesStatus = !statusFilter || statusFilter === "ALL" || campaign.status === statusFilter;

    const paymentStatus = campaign.payment?.status ?? "UNPAID";
    const matchesPayment = !paymentFilter || paymentFilter === "ALL" || paymentStatus === paymentFilter;

    return matchesQuery && matchesStatus && matchesPayment;
  });

  return (
    <section className="space-y-5">
      <div className="card flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{tr(lang, "Admin dashboard", "Панель администратора")}</h1>
          <p className="text-sm text-slate-600">
            {tr(lang, "Manage locations, moderation, payments and notifications.", "Управляйте локациями, модерацией, платежами и уведомлениями.")}
          </p>
        </div>

        <form action="/api/admin/logout" method="post">
          <button type="submit" className="btn-secondary">
            {tr(lang, "Logout", "Выйти")}
          </button>
        </form>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="metric">
          <p className="text-sm text-slate-500">{tr(lang, "Total revenue", "Общий доход")}</p>
          <p className="text-xl font-semibold">{formatMoney(totalRevenue)}</p>
        </div>
        <div className="metric">
          <p className="text-sm text-slate-500">{tr(lang, "Active campaigns", "Активные кампании")}</p>
          <p className="text-xl font-semibold">{activeCampaignsCount}</p>
        </div>
        <div className="metric">
          <p className="text-sm text-slate-500">{tr(lang, "Locations", "Локации")}</p>
          <p className="text-xl font-semibold">{locations.length}</p>
        </div>
      </div>

      <div className="card space-y-3">
        <h2 className="text-xl font-semibold">{tr(lang, "Fill rate (next 30 days)", "Заполняемость (следующие 30 дней)")}</h2>
        <p className="text-sm text-slate-600">
          {tr(lang, "Window:", "Период:")} {formatDate(windowStart)} - {formatDate(windowEnd)}
        </p>

        <div className="grid gap-3 md:grid-cols-2">
          {fillRates.map((entry) => (
            <div key={entry.location.id} className="metric">
              <p className="font-medium">{entry.location.name}</p>
              <p className="text-sm text-slate-600">
                {entry.soldSlots} {tr(lang, "sold", "продано")} / {entry.totalSlots} {tr(lang, "total slots", "всего слотов")}
              </p>
              <p className="text-sm text-slate-600">{entry.fillRate.toFixed(0)}% {tr(lang, "fill rate", "заполняемость")}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card space-y-3">
        <h2 className="text-xl font-semibold">{tr(lang, "Create location", "Создать локацию")}</h2>

        <form action="/api/admin/locations" method="post" className="grid gap-3 md:grid-cols-2">
          <label className="field-label">
            {tr(lang, "Name", "Название")}
            <input name="name" required />
          </label>
          <label className="field-label">
            {tr(lang, "Address", "Адрес")}
            <input name="address" required />
          </label>
          <label className="field-label md:col-span-2">
            {tr(lang, "Description", "Описание")}
            <textarea name="description" rows={3} required />
          </label>
          <label className="field-label">
            {tr(lang, "Foot traffic/day", "Трафик в день")}
            <input name="footTrafficPerDay" type="number" min={1} required />
          </label>
          <label className="field-label">
            {tr(lang, "Price per 30 days", "Цена за 30 дней")}
            <input name="pricePer30Days" type="number" min={1} required />
          </label>
          <button type="submit" className="md:col-span-2 md:w-fit">
            {tr(lang, "Add location", "Добавить локацию")}
          </button>
        </form>
      </div>

      <div className="card space-y-3">
        <h2 className="text-xl font-semibold">{tr(lang, "Manage locations", "Управление локациями")}</h2>

        {locations.map((location) => (
          <details key={location.id} className="rounded-md border border-slate-200 p-3">
            <summary className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-medium">{location.name}</span>
                <p className="text-sm text-slate-600">{location.address}</p>
              </div>
              <Link href={`/locations/${location.id}`} className="text-sm">
                {tr(lang, "Open", "Открыть")}
              </Link>
            </summary>

            <div className="mt-4 space-y-4">
              <form action={`/api/admin/locations/${location.id}`} method="post" className="grid gap-3 md:grid-cols-2">
                <label className="field-label">
                  {tr(lang, "Name", "Название")}
                  <input name="name" defaultValue={location.name} required />
                </label>
                <label className="field-label">
                  {tr(lang, "Address", "Адрес")}
                  <input name="address" defaultValue={location.address} required />
                </label>
                <label className="field-label md:col-span-2">
                  {tr(lang, "Description", "Описание")}
                  <textarea name="description" rows={3} defaultValue={location.description} required />
                </label>
                <label className="field-label">
                  {tr(lang, "Foot traffic/day", "Трафик в день")}
                  <input
                    name="footTrafficPerDay"
                    type="number"
                    min={1}
                    defaultValue={location.footTrafficPerDay}
                    required
                  />
                </label>
                <label className="field-label">
                  {tr(lang, "Price per 30 days", "Цена за 30 дней")}
                  <input
                    name="pricePer30Days"
                    type="number"
                    min={1}
                    defaultValue={location.pricePer30Days}
                    required
                  />
                </label>
                <button type="submit" className="md:col-span-2 md:w-fit">
                  {tr(lang, "Save location", "Сохранить локацию")}
                </button>
              </form>

              <form action={`/api/admin/screens/${location.id}`} method="post" className="grid gap-3 md:grid-cols-3">
                <input type="hidden" name="redirectTo" value="/admin" />
                <label className="field-label">
                  {tr(lang, "Total slots", "Всего слотов")}
                  <input
                    name="totalSlots"
                    type="number"
                    min={MIN_TOTAL_SLOTS}
                    max={MAX_TOTAL_SLOTS}
                    defaultValue={location.screen?.totalSlots ?? DEFAULT_TOTAL_SLOTS}
                    required
                  />
                </label>
                <label className="field-label">
                  {tr(lang, "Loop seconds", "Секунды цикла")}
                  <input
                    name="loopSeconds"
                    type="number"
                    min={10}
                    defaultValue={location.screen?.loopSeconds ?? 60}
                    required
                  />
                </label>
                <label className="field-label">
                  {tr(lang, "Ad seconds", "Секунды рекламы")}
                  <input
                    name="adSeconds"
                    type="number"
                    min={1}
                    defaultValue={location.screen?.adSeconds ?? 10}
                    required
                  />
                </label>
                <button type="submit" className="md:col-span-3 md:w-fit">
                  {tr(lang, "Save screen settings", "Сохранить настройки экрана")}
                </button>
              </form>

              <form action={`/api/admin/locations/${location.id}/delete`} method="post">
                <button type="submit" className="btn-danger">
                  {tr(lang, "Delete location", "Удалить локацию")}
                </button>
              </form>
            </div>
          </details>
        ))}
      </div>

      <div className="card space-y-3">
        <h2 className="text-xl font-semibold">{tr(lang, "Campaign moderation", "Модерация кампаний")}</h2>

        <form method="get" className="grid gap-3 md:grid-cols-4">
          <label className="field-label md:col-span-2">
            {tr(lang, "Search", "Поиск")}
            <input name="q" defaultValue={searchParams.q ?? ""} placeholder={tr(lang, "title, business, phone", "название, бизнес, телефон")} />
          </label>
          <label className="field-label">
            {tr(lang, "Status", "Статус")}
            <select name="status" defaultValue={searchParams.status ?? "ALL"}>
              <option value="ALL">{tr(lang, "All", "Все")}</option>
              {Object.values(CampaignStatus).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label className="field-label">
            {tr(lang, "Payment", "Оплата")}
            <select name="payment" defaultValue={searchParams.payment ?? "ALL"}>
              <option value="ALL">{tr(lang, "All", "Все")}</option>
              <option value="UNPAID">UNPAID</option>
              <option value="PENDING">PENDING</option>
              <option value="PAID">PAID</option>
              <option value="FAILED">FAILED</option>
            </select>
          </label>
          <button type="submit" className="md:w-fit">{tr(lang, "Apply filters", "Применить фильтры")}</button>
        </form>

        <form action="/api/admin/campaigns/bulk-status" method="post" className="space-y-2 overflow-x-auto">
          <input type="hidden" name="redirectTo" value="/admin" />
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left">
                <th className="py-2 pr-2">{tr(lang, "Pick", "Выбор")}</th>
                <th className="py-2 pr-2">{tr(lang, "Campaign", "Кампания")}</th>
                <th className="py-2 pr-2">{tr(lang, "Location", "Локация")}</th>
                <th className="py-2 pr-2">{tr(lang, "Status", "Статус")}</th>
                <th className="py-2 pr-2">{tr(lang, "Payment", "Оплата")}</th>
              </tr>
            </thead>
            <tbody>
              {filteredCampaigns.map((campaign) => (
                <tr key={campaign.id} className="border-b border-slate-100">
                  <td className="py-2 pr-2">
                    <input type="checkbox" name="campaignIds" value={campaign.id} />
                  </td>
                  <td className="py-2 pr-2">
                    <p className="font-medium">{campaign.title}</p>
                    <p className="text-xs text-slate-600">{campaign.businessName}</p>
                  </td>
                  <td className="py-2 pr-2">{campaign.location.name}</td>
                  <td className="py-2 pr-2">
                    <StatusBadge status={campaign.status} lang={lang} />
                  </td>
                  <td className="py-2 pr-2">{campaign.payment?.status ?? "UNPAID"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex flex-wrap items-end gap-2">
            <label className="field-label min-w-[200px]">
              {tr(lang, "Bulk set status", "Массово установить статус")}
              <select name="status" defaultValue={CampaignStatus.APPROVED}>
                {Object.values(CampaignStatus).map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </label>
            <button type="submit">{tr(lang, "Apply to selected", "Применить к выбранным")}</button>
          </div>
        </form>

        {filteredCampaigns.map((campaign) => (
          <details key={campaign.id} className="rounded-md border border-slate-200 p-3">
            <summary className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <span className="font-medium">{campaign.title}</span>
                <p className="text-sm text-slate-600">
                  {campaign.businessName} - {campaign.location.name}
                </p>
              </div>
              <StatusBadge status={campaign.status} lang={lang} />
            </summary>

            <div className="mt-4 space-y-3">
              <div className="grid gap-2 text-sm sm:grid-cols-2">
                <p>
                  <span className="font-medium">{tr(lang, "Phone:", "Телефон:")}</span> {campaign.phone}
                </p>
                <p>
                  <span className="font-medium">{tr(lang, "Dates:", "Даты:")}</span> {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                </p>
                <p>
                  <span className="font-medium">{tr(lang, "Campaign ID:", "ID кампании:")}</span> {campaign.id}
                </p>
                <p>
                  <span className="font-medium">{tr(lang, "Payment:", "Оплата:")}</span> {campaign.payment?.status ?? "UNPAID"}
                </p>
              </div>

              {campaign.mediaAsset ? (
                campaign.mediaAsset.type.startsWith("video") ? (
                  <video src={campaign.mediaAsset.path} controls className="max-h-60 w-full rounded-md" />
                ) : (
                  <img src={campaign.mediaAsset.path} alt={campaign.title} className="max-h-60 w-full rounded-md object-contain" />
                )
              ) : (
                <p className="text-sm text-slate-600">{tr(lang, "No media uploaded.", "Медиа не загружено.")}</p>
              )}

              <div className="flex flex-wrap gap-3">
                <form action={`/api/admin/campaigns/${campaign.id}/status`} method="post" className="flex items-end gap-2">
                  <label className="field-label">
                    {tr(lang, "Status", "Статус")}
                    <select name="status" defaultValue={campaign.status}>
                      {Object.values(CampaignStatus).map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </label>
                  <button type="submit">{tr(lang, "Update", "Обновить")}</button>
                </form>

                <form
                  action={`/api/admin/campaigns/${campaign.id}/proof`}
                  method="post"
                  encType="multipart/form-data"
                  className="flex items-end gap-2"
                >
                  <input type="hidden" name="redirectTo" value="/admin" />
                  <label className="field-label">
                    {tr(lang, "Proof photo", "Фото-доказательство")}
                    <input type="file" name="proof" accept="image/*" />
                  </label>
                  <button type="submit">{tr(lang, "Upload proof", "Загрузить")}</button>
                </form>

                <Link
                  href={`/campaigns/${campaign.id}`}
                  className="inline-flex items-center rounded-md border border-slate-300 px-3 py-2 text-sm font-medium no-underline"
                >
                  {tr(lang, "View details", "Детали")}
                </Link>
              </div>

              {campaign.proofAsset ? (
                <img src={campaign.proofAsset.path} alt="Proof" className="max-h-60 w-full rounded-md object-contain" />
              ) : null}
            </div>
          </details>
        ))}
      </div>

      <div className="card space-y-3">
        <h2 className="text-xl font-semibold">{tr(lang, "Notification log", "Журнал уведомлений")}</h2>
        {notifications.length === 0 ? (
          <p className="text-sm text-slate-600">{tr(lang, "No notifications yet.", "Пока нет уведомлений.")}</p>
        ) : (
          <div className="space-y-2">
            {notifications.map((entry) => (
              <div key={entry.id} className="rounded-md border border-slate-200 p-2 text-sm">
                <p className="font-medium">
                  {entry.channel} - {entry.status}
                </p>
                <p className="text-slate-600">{entry.recipient}</p>
                <p>{entry.message}</p>
                <p className="text-xs text-slate-500">{formatDate(entry.createdAt)}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
