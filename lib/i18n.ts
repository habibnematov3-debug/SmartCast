export type Lang = "en" | "ru";

export function normalizeLang(value?: string | null): Lang {
  return value === "ru" ? "ru" : "en";
}

let cp1251ReverseMap: Map<string, number> | null = null;

function getCp1251ReverseMap() {
  if (cp1251ReverseMap) {
    return cp1251ReverseMap;
  }

  const decoder = new TextDecoder("windows-1251");
  const map = new Map<string, number>();

  for (let i = 0; i <= 255; i += 1) {
    map.set(decoder.decode(Uint8Array.of(i)), i);
  }

  cp1251ReverseMap = map;
  return map;
}

function looksLikeMojibake(value: string) {
  return /[\u00D0\u00D1\u0420\u0421]/.test(value);
}

function tryDecodeCp1251Mojibake(value: string) {
  if (!looksLikeMojibake(value)) {
    return value;
  }

  const reverseMap = getCp1251ReverseMap();
  const bytes = new Uint8Array(value.length);

  for (let i = 0; i < value.length; i += 1) {
    const byte = reverseMap.get(value[i]);
    if (byte === undefined) {
      return value;
    }
    bytes[i] = byte;
  }

  const decoded = new TextDecoder("utf-8").decode(bytes);

  if (!/\p{Script=Cyrillic}/u.test(decoded)) {
    return value;
  }

  return decoded;
}

export function tr(lang: Lang, en: string, ru: string) {
  return lang === "ru" ? tryDecodeCp1251Mojibake(ru) : en;
}
