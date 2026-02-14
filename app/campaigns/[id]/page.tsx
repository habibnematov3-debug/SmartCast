import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { PaymentPanel } from "@/components/PaymentPanel";
import { StatusBadge } from "@/components/StatusBadge";
import { getCurrentAdvertiser } from "@/lib/advertiser-auth";
import { isAdminAuthenticated } from "@/lib/auth";
import { syncCampaignStatuses } from "@/lib/campaign-status";
import { getDemoCampaignById } from "@/lib/demoData";
import { isDemoMode } from "@/lib/demo-mode";
import { daysInclusive, formatDate } from "@/lib/dates";
import { tr } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { getServerLang } from "@/lib/server-lang";

type PageProps = {
  params: {
    id: string;
  };
};

const OPEN_SECONDS_PER_DAY = 12 * 60 * 60;

export default async function CampaignDetailsPage({ params }: PageProps) {
  const lang = getServerLang();
  const isAdmin = isAdminAuthenticated();
  const advertiser = await getCurrentAdvertiser();
  const demoMode = isDemoMode || !prisma;

  if (!demoMode) {
    await syncCampaignStatuses();
  }

  const campaign = demoMode
    ? getDemoCampaignById(params.id)
    : await prisma!.campaign.findUnique({
        where: {
          id: params.id
        },
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
        }
      });

  if (!campaign || !campaign.location.screen) {
    notFound();
  }

  if (!isAdmin) {
    if (!advertiser) {
      redirect("/auth/login");
    }

    if (campaign.advertiserId !== advertiser.id) {
      notFound();
    }
  }

  const screen = campaign.location.screen;
  const estimatedPlaysPerDay = Math.floor(
    (OPEN_SECONDS_PER_DAY / screen.loopSeconds) * (screen.adSeconds / screen.loopSeconds) * 1
  );

  const amountUsd =
    Math.round((campaign.location.pricePer30Days * daysInclusive(campaign.startDate, campaign.endDate) * 100) / 30) / 100;
  const paymentStatus = campaign.payment?.status ?? "NONE";

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          href="/"
          className="inline-flex rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 no-underline"
        >
          {tr(lang, "Back to locations", "Назад к локациям")}
        </Link>
        <StatusBadge status={campaign.status} lang={lang} />
      </div>

      <div className="card space-y-2">
        <h1 className="text-2xl font-semibold">{campaign.title}</h1>
        <p className="text-sm text-slate-600">{campaign.businessName}</p>

        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <p>
            <span className="font-medium">{tr(lang, "Phone:", "Телефон:")}</span> {campaign.phone}
          </p>
          <p>
            <span className="font-medium">{tr(lang, "Location:", "Локация:")}</span> {campaign.location.name}
          </p>
          <p>
            <span className="font-medium">{tr(lang, "Start:", "Начало:")}</span> {formatDate(campaign.startDate)}
          </p>
          <p>
            <span className="font-medium">{tr(lang, "End:", "Конец:")}</span> {formatDate(campaign.endDate)}
          </p>
        </div>
      </div>

      <PaymentPanel
        lang={lang}
        campaignId={campaign.id}
        amountUsd={amountUsd}
        paymentStatus={paymentStatus}
        invoiceNumber={campaign.invoice?.invoiceNumber}
      />

      <div className="card space-y-2">
        <h2 className="text-xl font-semibold">{tr(lang, "Media", "Медиа")}</h2>
        {campaign.mediaAsset ? (
          campaign.mediaAsset.type.startsWith("video") ? (
            <video src={campaign.mediaAsset.path} controls className="max-h-96 w-full rounded-md" />
          ) : (
            <img src={campaign.mediaAsset.path} alt={campaign.title} className="max-h-96 w-full rounded-md object-contain" />
          )
        ) : (
          <p className="text-sm text-slate-600">{tr(lang, "No media uploaded.", "Медиа не загружено.")}</p>
        )}
      </div>

      <div className="card space-y-2">
        <h2 className="text-xl font-semibold">{tr(lang, "Estimated plays/day", "Примерное число показов в день")}</h2>
        <p className="text-3xl font-semibold">{estimatedPlaysPerDay.toLocaleString()}</p>
        <p className="text-sm text-slate-600">
          {tr(
            lang,
            `Estimate uses ${OPEN_SECONDS_PER_DAY / 3600} screen-on hours/day, ${screen.loopSeconds}s loop, and ${screen.adSeconds}s ad time.`,
            `Оценка использует ${OPEN_SECONDS_PER_DAY / 3600} часов работы экрана в день, цикл ${screen.loopSeconds}с и длительность рекламы ${screen.adSeconds}с.`
          )}
        </p>
      </div>

      <div className="card space-y-3">
        <h2 className="text-xl font-semibold">{tr(lang, "Proof", "Доказательство размещения")}</h2>

        {campaign.proofAsset ? (
          <img src={campaign.proofAsset.path} alt="Proof of display" className="max-h-96 w-full rounded-md object-contain" />
        ) : (
          <p className="text-sm text-slate-600">{tr(lang, "No proof uploaded yet.", "Доказательство пока не загружено.")}</p>
        )}

        {isAdmin ? (
          <form
            action={`/api/admin/campaigns/${campaign.id}/proof`}
            method="post"
            encType="multipart/form-data"
            className="space-y-3"
          >
            <input type="hidden" name="redirectTo" value={`/campaigns/${campaign.id}`} />
            <label className="field-label">
              {tr(lang, "Upload proof photo", "Загрузить фото-доказательство")}
              <input type="file" name="proof" accept="image/*" required />
            </label>
            <button type="submit" className="sm:w-fit">
              {tr(lang, "Upload proof", "Загрузить")}
            </button>
          </form>
        ) : null}
      </div>
    </section>
  );
}
