import { Lang, tr } from "@/lib/i18n";
import { publicBrand } from "@/lib/public-brand";

type Props = {
  lang: Lang;
};

type SocialItem = {
  key: "instagram" | "telegram" | "youtube" | "linkedin";
  href: string;
  labelEn: string;
  labelRu: string;
};

const SOCIALS: SocialItem[] = [
  {
    key: "instagram",
    href: publicBrand.socials.instagram,
    labelEn: "Instagram",
    labelRu: "Инстаграм"
  },
  {
    key: "telegram",
    href: publicBrand.socials.telegram,
    labelEn: "Telegram",
    labelRu: "Телеграм"
  },
  {
    key: "youtube",
    href: publicBrand.socials.youtube,
    labelEn: "YouTube",
    labelRu: "Ютуб"
  },
  {
    key: "linkedin",
    href: publicBrand.socials.linkedin,
    labelEn: "LinkedIn",
    labelRu: "Линкедин"
  }
];

function icon(key: SocialItem["key"]) {
  switch (key) {
    case "instagram":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.8" r="1.2" fill="currentColor" stroke="none" />
        </svg>
      );
    case "telegram":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M20.8 4.2 3.9 10.7c-1 .4-1 1.8.1 2.1l4.2 1.3 1.6 4.8c.3 1 1.6 1.2 2.2.4l2.3-3 4.2 3.1c.9.7 2.1.2 2.3-.9l2.2-12.9c.2-1.1-.9-2-2-1.6Z" />
          <path d="m8.8 14 8.9-7.1" />
        </svg>
      );
    case "youtube":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3.5" y="6.5" width="17" height="11" rx="3.5" />
          <path d="M10 9.5 15 12l-5 2.5V9.5Z" fill="currentColor" stroke="none" />
        </svg>
      );
    case "linkedin":
      return (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="3.5" y="3.5" width="17" height="17" rx="2" />
          <path d="M8 10.2V16M8 8.2v.1M11.7 16v-3.2c0-2.7 3.3-2.4 3.3 0V16" />
        </svg>
      );
  }
}

export function SocialLinks({ lang }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {SOCIALS.map((social) => (
        <a
          key={social.key}
          href={social.href}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 no-underline"
          aria-label={`${tr(lang, social.labelEn, social.labelRu)} SmartCast`}
        >
          {icon(social.key)}
          <span>{tr(lang, social.labelEn, social.labelRu)}</span>
        </a>
      ))}
    </div>
  );
}
