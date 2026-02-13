"use client";

import { useState } from "react";
import { Lang } from "@/lib/i18n";

type Props = {
  lang: Lang;
};

const STORAGE_KEY = "smartcast-lang";

function setLangCookie(lang: Lang) {
  document.cookie = `${STORAGE_KEY}=${lang}; path=/; max-age=31536000; samesite=lax`;
}

export function LanguageToggle({ lang }: Props) {
  const [currentLang, setCurrentLang] = useState<Lang>(lang);

  function changeLang(nextLang: Lang) {
    if (nextLang === currentLang) return;
    setCurrentLang(nextLang);
    setLangCookie(nextLang);
    window.location.reload();
  }

  return (
    <div className="inline-flex items-center overflow-hidden rounded-md border border-slate-300 text-sm">
      <button
        type="button"
        onClick={() => changeLang("en")}
        className={`rounded-none border-0 px-2.5 py-1.5 ${
          currentLang === "en" ? "bg-slate-900 text-white" : "bg-white text-slate-700"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => changeLang("ru")}
        className={`rounded-none border-0 border-l border-slate-300 px-2.5 py-1.5 ${
          currentLang === "ru" ? "bg-slate-900 text-white" : "bg-white text-slate-700"
        }`}
      >
        RU
      </button>
    </div>
  );
}
