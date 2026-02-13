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

export default async function AdvertiserRegisterPage({ searchParams }: PageProps) {
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
      titleEn="Create your advertiser account"
      titleRu="Создайте аккаунт рекламодателя"
      descriptionEn="After registration, you will see locations, submit campaigns, pay online, and track campaign status."
      descriptionRu="После регистрации вы увидите локации, отправите кампании, оплатите онлайн и будете отслеживать статус."
      features={[
        {
          en: "Access to all available SmartCast locations",
          ru: "Доступ ко всем доступным локациям SmartCast"
        },
        {
          en: "Campaign booking flow with media upload",
          ru: "Процесс бронирования кампании с загрузкой медиа"
        },
        {
          en: "Payment history and invoice downloads",
          ru: "История оплат и скачивание счетов"
        }
      ]}
      footer={
        <>
          {tr(lang, "Already have an account?", "Уже есть аккаунт?")} {" "}
          <Link href="/auth/login" className="font-semibold">
            {tr(lang, "Sign in", "Войти")}
          </Link>
        </>
      }
    >
      <form action="/api/auth/register" method="post" className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold">{tr(lang, "Registration", "Регистрация")}</h2>
          <p className="text-sm text-slate-600">
            {tr(lang, "Fill in account details below.", "Заполните данные аккаунта ниже.")}
          </p>
        </div>

        <label className="field-label">
          {tr(lang, "Your name", "Ваше имя")}
          <input name="name" required />
        </label>

        <label className="field-label">
          {tr(lang, "Business phone", "Телефон бизнеса")}
          <input name="phone" required />
        </label>

        <label className="field-label">
          Email
          <input type="email" name="email" required />
        </label>

        <label className="field-label">
          {tr(lang, "Password (min 6 chars)", "Пароль (минимум 6 символов)")}
          <input type="password" name="password" minLength={6} required />
        </label>

        {searchParams.error ? (
          <p className="text-sm text-rose-600">
            {searchParams.error === "exists"
              ? tr(lang, "This email is already registered.", "Этот email уже зарегистрирован.")
              : tr(lang, "Could not create account.", "Не удалось создать аккаунт.")}
          </p>
        ) : null}

        <button type="submit" className="w-full">
          {tr(lang, "Create account", "Создать аккаунт")}
        </button>
      </form>
    </AuthSplit>
  );
}
