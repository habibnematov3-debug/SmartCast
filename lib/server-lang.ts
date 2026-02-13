import { cookies } from "next/headers";
import { Lang, normalizeLang } from "@/lib/i18n";

export function getServerLang(): Lang {
  return normalizeLang(cookies().get("smartcast-lang")?.value);
}
