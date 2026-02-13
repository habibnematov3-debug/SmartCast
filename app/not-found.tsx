import Link from "next/link";
import { tr } from "@/lib/i18n";
import { getServerLang } from "@/lib/server-lang";

export default function NotFound() {
  const lang = getServerLang();

  return (
    <section className="card mx-auto max-w-xl space-y-3 text-center">
      <h1 className="text-3xl font-black tracking-tight">{tr(lang, "Not found", "Не найдено")}</h1>
      <p className="text-sm text-slate-600">
        {tr(lang, "The page or resource you requested does not exist.", "Запрошенная страница или ресурс не существует.")}
      </p>
      <Link href="/" className="text-sm font-semibold no-underline">
        {tr(lang, "Back to locations", "Назад к локациям")}
      </Link>
    </section>
  );
}
