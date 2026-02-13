import Link from "next/link";
import { redirect } from "next/navigation";
import { AuthSplit } from "@/components/AuthSplit";
import { getCurrentAdvertiser } from "@/lib/advertiser-auth";
import { tr } from "@/lib/i18n";
import { getServerLang } from "@/lib/server-lang";

type PageProps = {
  searchParams: {
    error?: string;
  };
};

export default async function AdvertiserLoginPage({ searchParams }: PageProps) {
  const lang = getServerLang();
  const advertiser = await getCurrentAdvertiser();

  if (advertiser) {
    redirect("/");
  }

  return (
    <AuthSplit
      lang={lang}
      eyebrowEn="SmartCast Access"
      eyebrowRu="Доступ SmartCast"
      titleEn="Welcome back"
      titleRu="С возвращением"
      descriptionEn="Sign in to open locations, check availability, and manage your campaigns in one place."
      descriptionRu="Войдите, чтобы открыть локации, проверить доступность и управлять кампаниями в одном месте."
      features={[
        {
          en: "Structured dashboard for campaigns and invoices",
          ru: "Структурированный кабинет для кампаний и счетов"
        },
        {
          en: "Live slot availability by date range",
          ru: "Живая доступность слотов по диапазону дат"
        },
        {
          en: "Fast payment and invoice download",
          ru: "Быстрая оплата и скачивание счета"
        }
      ]}
      footer={
        <>
          {tr(lang, "No account yet?", "Нет аккаунта?")} {" "}
          <Link href="/auth/register" className="font-semibold">
            {tr(lang, "Create account", "Создать аккаунт")}
          </Link>
        </>
      }
    >
      <form action="/api/auth/login" method="post" className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold">{tr(lang, "Advertiser sign in", "Вход рекламодателя")}</h2>
          <p className="text-sm text-slate-600">
            {tr(lang, "Use your email and password.", "Используйте ваш email и пароль.")}
          </p>
        </div>

        <label className="field-label">
          Email
          <input type="email" name="email" required />
        </label>

        <label className="field-label">
          {tr(lang, "Password", "Пароль")}
          <input type="password" name="password" required />
        </label>

        {searchParams.error ? (
          <p className="text-sm text-rose-600">{tr(lang, "Invalid email or password.", "Неверный email или пароль.")}</p>
        ) : null}

        <button type="submit" className="w-full">
          {tr(lang, "Sign in", "Войти")}
        </button>
      </form>
    </AuthSplit>
  );
}
