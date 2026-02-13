import { ReactNode } from "react";
import { Lang, tr } from "@/lib/i18n";

type Feature = {
  en: string;
  ru: string;
};

type Props = {
  lang: Lang;
  eyebrowEn: string;
  eyebrowRu: string;
  titleEn: string;
  titleRu: string;
  descriptionEn: string;
  descriptionRu: string;
  features: Feature[];
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthSplit({
  lang,
  eyebrowEn,
  eyebrowRu,
  titleEn,
  titleRu,
  descriptionEn,
  descriptionRu,
  features,
  children,
  footer
}: Props) {
  return (
    <section className="mx-auto grid max-w-5xl gap-4 lg:grid-cols-[1.1fr_1fr]">
      <div className="card relative overflow-hidden p-6 lg:p-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_260px_at_-20%_-10%,rgba(56,189,248,0.16),transparent_70%)]" />
        <div className="relative space-y-4">
          <span className="badge bg-slate-900 text-white">{tr(lang, eyebrowEn, eyebrowRu)}</span>
          <h1 className="text-3xl font-black tracking-tight">{tr(lang, titleEn, titleRu)}</h1>
          <p className="text-sm text-slate-600">{tr(lang, descriptionEn, descriptionRu)}</p>

          <div className="space-y-2">
            {features.map((feature) => (
              <div key={feature.en} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700">
                {tr(lang, feature.en, feature.ru)}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="card p-6 lg:p-7">{children}</div>
        {footer ? <div className="text-center text-sm text-slate-600">{footer}</div> : null}
      </div>
    </section>
  );
}
