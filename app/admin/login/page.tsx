import { redirect } from "next/navigation";
import { AuthSplit } from "@/components/AuthSplit";
import { isAdminAuthenticated } from "@/lib/auth";
import { tr } from "@/lib/i18n";
import { getServerLang } from "@/lib/server-lang";

type PageProps = {
  searchParams: {
    error?: string;
  };
};

export default function AdminLoginPage({ searchParams }: PageProps) {
  const lang = getServerLang();

  if (isAdminAuthenticated()) {
    redirect("/admin");
  }

  return (
    <AuthSplit
      lang={lang}
      eyebrowEn="Admin Area"
      eyebrowRu="Зона администратора"
      titleEn="Administrative control panel"
      titleRu="Панель административного управления"
      descriptionEn="Use admin credentials to manage locations, moderation queues, payments, and screen settings."
      descriptionRu="Используйте учетные данные администратора для управления локациями, модерацией, оплатами и настройками экранов."
      features={[
        {
          en: "Moderate campaigns and update statuses",
          ru: "Модерируйте кампании и обновляйте статусы"
        },
        {
          en: "Control slot settings for each location",
          ru: "Управляйте слотами для каждой локации"
        },
        {
          en: "Review payment and notification logs",
          ru: "Просматривайте логи оплат и уведомлений"
        }
      ]}
    >
      <form action="/api/admin/login" method="post" className="space-y-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold">{tr(lang, "Admin login", "Вход для администратора")}</h2>
          <p className="text-sm text-slate-600">{tr(lang, "Enter your admin password.", "Введите пароль администратора.")}</p>
        </div>

        <label className="field-label">
          {tr(lang, "Password", "Пароль")}
          <input type="password" name="password" required />
        </label>

        {searchParams.error ? (
          <p className="text-sm text-rose-600">{tr(lang, "Invalid password.", "Неверный пароль.")}</p>
        ) : null}

        <button type="submit" className="w-full">
          {tr(lang, "Sign in", "Войти")}
        </button>
      </form>
    </AuthSplit>
  );
}
