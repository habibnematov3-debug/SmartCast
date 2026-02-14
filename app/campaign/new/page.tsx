import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CampaignCreateForm } from "@/components/CampaignCreateForm";
import { getCurrentAdvertiser } from "@/lib/advertiser-auth";
import { getDemoLocationById } from "@/lib/demoData";
import { isDemoMode } from "@/lib/demo-mode";
import { addDays } from "@/lib/dates";
import { tr } from "@/lib/i18n";
import { prisma } from "@/lib/prisma";
import { getServerLang } from "@/lib/server-lang";

type PageProps = {
  searchParams: {
    locationId?: string;
    startDate?: string;
    endDate?: string;
  };
};

function formatDateInput(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default async function NewCampaignPage({ searchParams }: PageProps) {
  const lang = getServerLang();
  const advertiser = await getCurrentAdvertiser();
  const demoMode = isDemoMode || !prisma;

  if (!advertiser) {
    redirect("/auth/login");
  }

  const locationId = searchParams.locationId;

  if (!locationId) {
    notFound();
  }

  const location = demoMode
    ? getDemoLocationById(locationId)
    : await prisma!.location.findUnique({
        where: {
          id: locationId
        },
        include: {
          screen: true
        }
      });

  if (!location || !location.screen) {
    notFound();
  }

  const startDate = searchParams.startDate ?? formatDateInput(new Date());
  const endDate = searchParams.endDate ?? formatDateInput(addDays(new Date(), 29));

  return (
    <section className="space-y-4">
      <Link
        href={`/locations/${location.id}`}
        className="inline-flex rounded-md border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 no-underline"
      >
        {tr(lang, "Back to location", "Назад к локации")}
      </Link>

      <CampaignCreateForm
        lang={lang}
        locationId={location.id}
        locationName={location.name}
        pricePer30Days={location.pricePer30Days}
        totalSlots={location.screen.totalSlots}
        initialStartDate={startDate}
        initialEndDate={endDate}
      />
    </section>
  );
}
