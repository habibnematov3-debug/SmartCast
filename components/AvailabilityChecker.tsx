"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Lang, tr } from "@/lib/i18n";

type AvailabilityState = {
  totalSlots: number;
  availableSlots: number;
  overlapCount: number;
};

type Props = {
  lang: Lang;
  locationId: string;
  defaultStartDate: string;
  defaultEndDate: string;
  initialAvailability: AvailabilityState;
};

export function AvailabilityChecker({
  lang,
  locationId,
  defaultStartDate,
  defaultEndDate,
  initialAvailability
}: Props) {
  const [startDate, setStartDate] = useState(defaultStartDate);
  const [endDate, setEndDate] = useState(defaultEndDate);
  const [availability, setAvailability] = useState(initialAvailability);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canCreate = availability.availableSlots > 0;

  const createCampaignHref = useMemo(() => {
    const params = new URLSearchParams({
      locationId,
      startDate,
      endDate
    });

    return `/campaign/new?${params.toString()}`;
  }, [endDate, locationId, startDate]);

  async function checkAvailability() {
    if (!startDate || !endDate) {
      setError(tr(lang, "Select both start and end dates.", "Выберите дату начала и окончания."));
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const params = new URLSearchParams({
        locationId,
        startDate,
        endDate
      });

      const response = await fetch(`/api/availability?${params.toString()}`);
      const data = (await response.json()) as AvailabilityState | { error?: string };

      if (!response.ok) {
        setError(
          "error" in data && data.error
            ? data.error
            : tr(lang, "Could not check availability.", "Не удалось проверить доступность.")
        );
        return;
      }

      setAvailability(data as AvailabilityState);
    } catch {
      setError(tr(lang, "Could not check availability.", "Не удалось проверить доступность."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card space-y-4">
      <h2 className="text-xl font-semibold">{tr(lang, "Availability", "Доступность")}</h2>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="field-label">
          {tr(lang, "Start date", "Дата начала")}
          <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} required />
        </label>

        <label className="field-label">
          {tr(lang, "End date", "Дата окончания")}
          <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} required />
        </label>

        <div className="flex items-end">
          <button type="button" onClick={checkAvailability} disabled={loading} className="w-full">
            {loading ? tr(lang, "Checking...", "Проверка...") : tr(lang, "Check", "Проверить")}
          </button>
        </div>
      </div>

      <div className="space-y-1 text-sm">
        <p>
          <span className="font-medium">{tr(lang, "Total slots:", "Всего слотов:")}</span> {availability.totalSlots}
        </p>
        <p>
          <span className="font-medium">{tr(lang, "Available for your dates:", "Доступно на ваши даты:")}</span>{" "}
          {availability.availableSlots}
        </p>
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      <Link
        href={createCampaignHref}
        className={`inline-flex rounded-md px-3 py-2 text-sm font-medium text-white no-underline ${
          canCreate ? "bg-slate-900" : "pointer-events-none bg-slate-400"
        }`}
      >
        {tr(lang, "Create campaign", "Создать кампанию")}
      </Link>
    </div>
  );
}
