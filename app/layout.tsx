import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Manrope } from "next/font/google";
import { cookies } from "next/headers";
import { LanguageToggle } from "@/components/LanguageToggle";
import { SocialLinks } from "@/components/SocialLinks";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getCurrentAdvertiser } from "@/lib/advertiser-auth";
import { tr } from "@/lib/i18n";
import { getServerLang } from "@/lib/server-lang";
import "./globals.css";

const bodyFont = Manrope({
  subsets: ["latin", "cyrillic"],
  variable: "--font-body"
});

export const metadata: Metadata = {
  title: "SmartCast AdSlots",
  description: "SmartCast monthly ad slot marketplace for venue screens"
};

const themeInitScript = `
(() => {
  const key = "smartcast-theme";
  const cookieMatch = document.cookie
    .split(";")
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(key + "="));
  const cookieTheme = cookieMatch ? cookieMatch.split("=")[1] : null;
  const saved = localStorage.getItem(key);
  const theme =
    saved === "dark" || saved === "light"
      ? saved
      : (cookieTheme === "dark" || cookieTheme === "light")
        ? cookieTheme
        : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(key, theme);
  document.cookie = key + "=" + theme + "; path=/; max-age=31536000; samesite=lax";
})();
`;

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const lang = getServerLang();
  const advertiser = await getCurrentAdvertiser();
  const advertiserInitial = advertiser?.name?.trim().slice(0, 1).toUpperCase() || "A";
  const themeCookie = cookies().get("smartcast-theme")?.value;
  const initialTheme = themeCookie === "dark" ? "dark" : "light";

  return (
    <html lang={lang} data-theme={initialTheme} suppressHydrationWarning>
      <body className={bodyFont.variable}>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />

        <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="mx-auto max-w-6xl px-4 py-3">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <Link href="/" className="inline-flex items-center gap-3 text-lg font-bold text-slate-900 no-underline">
                <Image src="/smartcast-logo.png" alt="SmartCast logo" width={44} height={44} className="rounded-md" />
                <div className="leading-tight">
                  <p className="text-lg font-bold">SmartCast</p>
                  <p className="text-xs font-medium text-slate-500">AdSlots Marketplace</p>
                </div>
              </Link>

              <div className="flex flex-wrap items-center gap-2">
                {advertiser ? (
                  <>
                    <div className="inline-flex items-center rounded-xl border border-slate-300 bg-white p-1">
                      <Link href="/" className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 no-underline">
                        {tr(lang, "Locations", "Локации")}
                      </Link>
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-2 py-1">
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                        {advertiserInitial}
                      </span>
                      <span className="hidden text-sm font-medium text-slate-700 sm:inline">{advertiser.name}</span>
                      <form action="/api/auth/logout" method="post">
                        <button type="submit" className="btn-secondary py-1.5">
                          {tr(lang, "Logout", "Выйти")}
                        </button>
                      </form>
                    </div>
                  </>
                ) : (
                  <>
                    <nav className="hidden items-center rounded-xl border border-slate-300 bg-white p-1 xl:inline-flex">
                      <Link href="/how-it-works" className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 no-underline">
                        {tr(lang, "How it works", "Как это работает")}
                      </Link>
                      <Link href="/locations" className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 no-underline">
                        {tr(lang, "Locations", "Локации")}
                      </Link>
                      <Link href="/pricing" className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 no-underline">
                        {tr(lang, "Pricing", "Тарифы")}
                      </Link>
                      <Link href="/about" className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 no-underline">
                        {tr(lang, "About", "О нас")}
                      </Link>
                    </nav>

                    <details className="relative xl:hidden">
                      <summary className="list-none rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700">
                        {tr(lang, "Menu", "Меню")}
                      </summary>
                      <div className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-300 bg-white p-1 shadow-lg">
                        <Link href="/how-it-works" className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 no-underline">
                          {tr(lang, "How it works", "Как это работает")}
                        </Link>
                        <Link href="/locations" className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 no-underline">
                          {tr(lang, "Locations", "Локации")}
                        </Link>
                        <Link href="/pricing" className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 no-underline">
                          {tr(lang, "Pricing", "Тарифы")}
                        </Link>
                        <Link href="/about" className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-700 no-underline">
                          {tr(lang, "About", "О нас")}
                        </Link>
                      </div>
                    </details>

                    <div className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white p-1">
                      <Link href="/login" className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 no-underline">
                        {tr(lang, "Sign In", "Войти")}
                      </Link>
                      <Link href="/register" className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white no-underline">
                        {tr(lang, "Get Started", "Начать")}
                      </Link>
                    </div>
                  </>
                )}

                <LanguageToggle lang={lang} />
                <ThemeToggle lang={lang} />
              </div>
            </div>

            {!advertiser ? (
              <div className="mt-3 border-t border-slate-200 pt-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    {tr(lang, "Official channels", "Официальные каналы")}
                  </span>
                  <SocialLinks lang={lang} />
                </div>
              </div>
            ) : null}
          </div>
        </header>

        <main className="mx-auto min-h-[calc(100vh-80px)] max-w-6xl px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
