"use client";

import { useEffect, useState } from "react";
import { Lang, tr } from "@/lib/i18n";

type Theme = "light" | "dark";

type Props = {
  lang: Lang;
};

const STORAGE_KEY = "smartcast-theme";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

function setThemeCookie(theme: Theme) {
  document.cookie = `${STORAGE_KEY}=${theme}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`;
}

function readThemeCookie(): Theme | null {
  const match = document.cookie
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${STORAGE_KEY}=`));

  const value = match?.split("=")[1];
  return value === "dark" || value === "light" ? value : null;
}

export function ThemeToggle({ lang }: Props) {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const attrTheme = document.documentElement.getAttribute("data-theme");
    const localTheme = localStorage.getItem(STORAGE_KEY);
    const cookieTheme = readThemeCookie();
    const persistedTheme = localTheme === "dark" || localTheme === "light" ? localTheme : cookieTheme;

    if (persistedTheme) {
      setTheme(persistedTheme);
      applyTheme(persistedTheme);
      localStorage.setItem(STORAGE_KEY, persistedTheme);
      setThemeCookie(persistedTheme);
    } else if (attrTheme === "dark" || attrTheme === "light") {
      setTheme(attrTheme);
      localStorage.setItem(STORAGE_KEY, attrTheme);
      setThemeCookie(attrTheme);
    } else {
      const preferredTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      setTheme(preferredTheme);
      applyTheme(preferredTheme);
      localStorage.setItem(STORAGE_KEY, preferredTheme);
      setThemeCookie(preferredTheme);
    }

    setMounted(true);
  }, []);

  function toggleTheme() {
    const nextTheme: Theme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    applyTheme(nextTheme);
    localStorage.setItem(STORAGE_KEY, nextTheme);
    setThemeCookie(nextTheme);
  }

  if (!mounted) {
    return (
      <button type="button" className="btn-secondary inline-flex min-w-[118px] items-center justify-center gap-2" aria-label="Toggle theme">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 4.5v2.2M12 17.3v2.2M4.5 12h2.2M17.3 12h2.2M6.8 6.8l1.6 1.6M15.6 15.6l1.6 1.6M6.8 17.2l1.6-1.6M15.6 8.4l1.6-1.6" />
          <circle cx="12" cy="12" r="4" />
        </svg>
        <span>{tr(lang, "Theme", "Тема")}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="btn-secondary inline-flex min-w-[118px] items-center justify-center gap-2"
      aria-label={tr(lang, "Toggle light or dark mode", "Переключить светлую или темную тему")}
    >
      {theme === "light" ? (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M20.3 14.7A8.4 8.4 0 1 1 9.3 3.7a7 7 0 1 0 11 11Z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M12 4.5v2.2M12 17.3v2.2M4.5 12h2.2M17.3 12h2.2M6.8 6.8l1.6 1.6M15.6 15.6l1.6 1.6M6.8 17.2l1.6-1.6M15.6 8.4l1.6-1.6" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      )}
      <span>{theme === "light" ? tr(lang, "Dark", "Темная") : tr(lang, "Light", "Светлая")}</span>
    </button>
  );
}
