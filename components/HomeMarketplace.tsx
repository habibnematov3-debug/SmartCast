"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Lang, tr } from "@/lib/i18n";
import { formatMoney } from "@/lib/pricing";

type Category = "cafe" | "bank" | "restaurant" | "hospital";

type Hint = {
  id: number;
  category: Category;
  x: number;
  y: number;
  nameEn: string;
  nameRu: string;
};

export type MarketplaceLocation = {
  id: string;
  name: string;
  address: string;
  description: string;
  footTrafficPerDay: number;
  pricePer30Days: number;
  totalSlots: number;
  availableSlots: number;
  categories: Category[];
};

type Props = {
  lang: Lang;
  windowLabel: string;
  locations: MarketplaceLocation[];
};

const hints: Hint[] = [
  { id: 1, category: "cafe", x: 49, y: 47, nameEn: "Chorsu Cafe Cluster", nameRu: "Кластер кафе у Чорсу" },
  { id: 2, category: "restaurant", x: 53, y: 45, nameEn: "Anhor Riverside Restaurants", nameRu: "Рестораны у канала Анхор" },
  { id: 3, category: "bank", x: 55, y: 51, nameEn: "Mustaqillik Bank Zone", nameRu: "Банковская зона у Мустакиллик" },
  { id: 4, category: "hospital", x: 47, y: 53, nameEn: "Shaykhontohur Medical Block", nameRu: "Медицинский блок Шайхантахур" },
  { id: 5, category: "cafe", x: 43, y: 56, nameEn: "Bunyodkor Coffee Point", nameRu: "Кофейная точка Бунёдкор" },
  { id: 6, category: "restaurant", x: 59, y: 50, nameEn: "Mirabad Dining Street", nameRu: "Ресторанная улица Мирабад" },
  { id: 7, category: "bank", x: 61, y: 43, nameEn: "Yunusobod Financial Node", nameRu: "Финансовый узел Юнусабад" },
  { id: 8, category: "hospital", x: 64, y: 55, nameEn: "Yashnabad Health Center", nameRu: "Центр здоровья Яшнабад" },
  { id: 9, category: "cafe", x: 39, y: 49, nameEn: "Uchtepa Tea and Cafe Strip", nameRu: "Кафе-линия Учтепа" },
  { id: 10, category: "restaurant", x: 45, y: 42, nameEn: "Sebzor Food Plaza", nameRu: "Фуд-плаза Себзор" },
  { id: 11, category: "bank", x: 57, y: 58, nameEn: "Airport Road Banks", nameRu: "Банки на Аэропорт йули" },
  { id: 12, category: "hospital", x: 50, y: 60, nameEn: "Chilonzor Clinic Ring", nameRu: "Клиническое кольцо Чиланзар" },
  { id: 13, category: "cafe", x: 67, y: 48, nameEn: "Tech Park Cafes", nameRu: "Кафе у Технопарка" },
  { id: 14, category: "restaurant", x: 52, y: 38, nameEn: "University Quarter Restaurants", nameRu: "Рестораны университетского квартала" },
  { id: 15, category: "bank", x: 46, y: 39, nameEn: "Old City Banking Line", nameRu: "Банковская линия Старого города" },
  { id: 16, category: "hospital", x: 40, y: 61, nameEn: "Southwest Hospital Group", nameRu: "Юго-западная группа больниц" },
  { id: 17, category: "cafe", x: 62, y: 62, nameEn: "Sergeli Cafe Corners", nameRu: "Кафе Сергели" },
  { id: 18, category: "restaurant", x: 35, y: 57, nameEn: "Qatortol Restaurant Block", nameRu: "Ресторанный блок Катартол" },
  { id: 19, category: "bank", x: 69, y: 54, nameEn: "East Ring Banking Point", nameRu: "Банковская точка восточного кольца" },
  { id: 20, category: "hospital", x: 58, y: 36, nameEn: "Northern Medical Campus", nameRu: "Северный медицинский кампус" }
];

function availabilityTone(availableSlots: number) {
  if (availableSlots < 1) return "bg-rose-100 text-rose-700";
  if (availableSlots < 3) return "bg-amber-100 text-amber-700";
  return "bg-emerald-100 text-emerald-700";
}

function markerTone(category: Category) {
  switch (category) {
    case "cafe":
      return "border-emerald-600 bg-emerald-600 text-white";
    case "bank":
      return "border-blue-600 bg-blue-600 text-white";
    case "restaurant":
      return "border-amber-500 bg-amber-500 text-white";
    case "hospital":
      return "border-rose-600 bg-rose-600 text-white";
  }
}

function categoryLabel(lang: Lang, category: Category) {
  switch (category) {
    case "cafe":
      return tr(lang, "Cafe", "Кафе");
    case "bank":
      return tr(lang, "Bank", "Банк");
    case "restaurant":
      return tr(lang, "Restaurant", "Ресторан");
    case "hospital":
      return tr(lang, "Hospital", "Больница");
  }
}

const categoryList: Category[] = ["cafe", "bank", "restaurant", "hospital"];

export function HomeMarketplace({ lang, windowLabel, locations }: Props) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("availability-desc");
  const [activeCategories, setActiveCategories] = useState<Category[]>([]);

  function toggleCategory(category: Category) {
    setActiveCategories((current) =>
      current.includes(category) ? current.filter((entry) => entry !== category) : [...current, category]
    );
  }

  const filteredHints = useMemo(() => {
    if (!activeCategories.length) {
      return hints;
    }
    return hints.filter((hint) => activeCategories.includes(hint.category));
  }, [activeCategories]);

  const filteredLocations = useMemo(() => {
    const normalizedQuery = search.trim().toLowerCase();

    let next = locations.filter((location) => {
      const matchesQuery =
        !normalizedQuery ||
        `${location.name} ${location.address} ${location.description}`.toLowerCase().includes(normalizedQuery);

      const matchesCategory =
        !activeCategories.length || location.categories.some((category) => activeCategories.includes(category));

      return matchesQuery && matchesCategory;
    });

    next = [...next].sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.pricePer30Days - b.pricePer30Days;
        case "price-desc":
          return b.pricePer30Days - a.pricePer30Days;
        case "traffic-desc":
          return b.footTrafficPerDay - a.footTrafficPerDay;
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "availability-desc":
        default:
          return b.availableSlots - a.availableSlots;
      }
    });

    return next;
  }, [activeCategories, locations, search, sortBy]);

  return (
    <section className="space-y-5 reveal">
      <div className="card space-y-3">
        <h1 className="text-2xl font-bold">{tr(lang, "Book a digital ad slot", "Забронируйте цифровой рекламный слот")}</h1>
        <p className="text-sm text-slate-600">
          {tr(
            lang,
            "1. Choose a location. 2. Pick dates and check slot availability. 3. Submit your campaign. 4. Pay and receive invoice.",
            "1. Выберите локацию. 2. Укажите даты и проверьте слоты. 3. Отправьте кампанию. 4. Оплатите и получите счёт."
          )}
        </p>
        <p className="text-sm text-slate-600">
          {tr(lang, "Current booking window:", "Текущее окно бронирования:")} {windowLabel}
        </p>
      </div>

      <div className="card space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">
              {tr(lang, "Tashkent hotspot map (20 hints)", "Карта горячих точек Ташкента (20 подсказок)")}
            </h2>
            <p className="text-sm text-slate-600">
              {tr(
                lang,
                "Use category filters to focus on zones and nearby ad opportunities.",
                "Используйте фильтры категорий, чтобы фокусироваться на нужных зонах и локациях."
              )}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {categoryList.map((category) => {
              const active = activeCategories.includes(category);
              return (
                <button
                  key={category}
                  type="button"
                  className={active ? "btn-secondary border-slate-900 bg-slate-900 text-white" : "btn-secondary"}
                  onClick={() => toggleCategory(category)}
                >
                  {categoryLabel(lang, category)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid items-start gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="self-start overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
            <div className="relative aspect-square w-full">
              <Image
                src="/tashkent-map.png"
                alt={tr(lang, "Tashkent map with SmartCast hints", "Карта Ташкента с подсказками SmartCast")}
                fill
                sizes="(max-width: 1024px) 100vw, 65vw"
                className="object-cover"
                priority
              />
              {filteredHints.map((hint) => (
                <span
                  key={hint.id}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full border text-[10px] font-semibold shadow ${markerTone(
                    hint.category
                  )}`}
                  style={{
                    left: `${hint.x}%`,
                    top: `${hint.y}%`,
                    width: "20px",
                    height: "20px",
                    lineHeight: "18px",
                    textAlign: "center"
                  }}
                  title={`${hint.id}. ${lang === "ru" ? hint.nameRu : hint.nameEn}`}
                >
                  {hint.id}
                </span>
              ))}
            </div>
          </div>

          <div className="grid max-h-[40rem] gap-2 overflow-auto pr-1 sm:grid-cols-2 lg:grid-cols-1">
            {filteredHints.map((hint) => (
              <div key={hint.id} className="rounded-md border border-slate-200 p-2 text-sm">
                <p className="font-medium">
                  {hint.id}. {lang === "ru" ? hint.nameRu : hint.nameEn}
                </p>
                <p className="text-slate-600">{categoryLabel(lang, hint.category)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card grid gap-3 md:grid-cols-[1fr_220px]">
        <label className="field-label">
          {tr(lang, "Search locations", "Поиск локаций")}
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={tr(lang, "Name, address, description", "Название, адрес, описание")}
          />
        </label>
        <label className="field-label">
          {tr(lang, "Sort by", "Сортировка")}
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="availability-desc">{tr(lang, "Availability", "Доступность")}</option>
            <option value="price-asc">{tr(lang, "Price: low to high", "Цена: по возрастанию")}</option>
            <option value="price-desc">{tr(lang, "Price: high to low", "Цена: по убыванию")}</option>
            <option value="traffic-desc">{tr(lang, "Foot traffic", "Трафик")}</option>
            <option value="name-asc">{tr(lang, "Name", "Название")}</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filteredLocations.map((location) => (
          <article key={location.id} className="card space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h2 className="text-lg font-semibold">{location.name}</h2>
                <p className="text-sm text-slate-600">{location.address}</p>
              </div>
              <span className={`badge ${availabilityTone(location.availableSlots)}`}>
                {location.availableSlots} {tr(lang, "available", "доступно")}
              </span>
            </div>

            <p className="text-sm text-slate-600">{location.description}</p>

            <div className="space-y-1 text-sm">
              <p>
                <span className="font-medium">{tr(lang, "Price:", "Цена:")}</span> {formatMoney(location.pricePer30Days)} /{" "}
                {tr(lang, "30 days", "30 дней")}
              </p>
              <p>
                <span className="font-medium">{tr(lang, "Foot traffic/day:", "Трафик в день:")}</span>{" "}
                {location.footTrafficPerDay.toLocaleString()}
              </p>
              <p>
                <span className="font-medium">{tr(lang, "Capacity:", "Ёмкость:")}</span> {location.totalSlots}{" "}
                {tr(lang, "total slots", "всего слотов")}
              </p>
              <p>
                <span className="font-medium">{tr(lang, "Available for your dates:", "Доступно на ваши даты:")}</span>{" "}
                {location.availableSlots}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {location.categories.map((category) => (
                <span key={`${location.id}-${category}`} className="badge bg-slate-200 text-slate-700">
                  {categoryLabel(lang, category)}
                </span>
              ))}
            </div>

            <Link
              href={`/locations/${location.id}`}
              className="inline-flex rounded-md border border-slate-900 bg-slate-900 px-3 py-2 text-sm font-medium text-white no-underline"
            >
              {tr(lang, "View location", "Открыть локацию")}
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
