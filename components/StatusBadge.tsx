import { CampaignStatus } from "@prisma/client";
import { Lang } from "@/lib/i18n";

type Props = {
  status: CampaignStatus;
  lang?: Lang;
};

const styleMap: Record<CampaignStatus, string> = {
  PENDING: "bg-amber-100 text-amber-800",
  APPROVED: "bg-blue-100 text-blue-800",
  LIVE: "bg-emerald-100 text-emerald-800",
  REJECTED: "bg-rose-100 text-rose-800",
  ENDED: "bg-slate-200 text-slate-700"
};

const ruLabels: Record<CampaignStatus, string> = {
  PENDING: "\u041E\u0416\u0418\u0414\u0410\u041D\u0418\u0415",
  APPROVED: "\u041E\u0414\u041E\u0411\u0420\u0415\u041D\u041E",
  LIVE: "\u0410\u041A\u0422\u0418\u0412\u041D\u0410",
  REJECTED: "\u041E\u0422\u041A\u041B\u041E\u041D\u0415\u041D\u0410",
  ENDED: "\u0417\u0410\u0412\u0415\u0420\u0428\u0415\u041D\u0410"
};

export function StatusBadge({ status, lang = "en" }: Props) {
  const label = lang === "ru" ? ruLabels[status] : status;

  return (
    <span className={`badge ${styleMap[status]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
      {label}
    </span>
  );
}
