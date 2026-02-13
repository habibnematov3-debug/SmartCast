"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Lang, tr } from "@/lib/i18n";

type Props = {
  lang: Lang;
  locationId: string;
  locationName: string;
  pricePer30Days: number;
  totalSlots: number;
  initialStartDate: string;
  initialEndDate: string;
};

type Availability = {
  totalSlots: number;
  availableSlots: number;
  overlapCount: number;
};

type MediaMeta = {
  kind: "image" | "video";
  width?: number;
  height?: number;
  duration?: number;
  sizeMb: number;
};

const DAY_MS = 24 * 60 * 60 * 1000;
const IMAGE_MAX_MB = 15;
const VIDEO_MAX_MB = 60;
const MIN_IMAGE_SIDE = 900;
const MAX_VIDEO_SECONDS = 30;

function daysInclusive(startDate: string, endDate: string) {
  if (!startDate || !endDate) return 0;

  const start = new Date(`${startDate}T00:00:00.000Z`);
  const end = new Date(`${endDate}T00:00:00.000Z`);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return 0;

  return Math.floor((end.getTime() - start.getTime()) / DAY_MS) + 1;
}

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

function readImageMeta(file: File) {
  return new Promise<{ width: number; height: number }>((resolve, reject) => {
    const image = new Image();
    const url = URL.createObjectURL(file);

    image.onload = () => {
      resolve({
        width: image.naturalWidth,
        height: image.naturalHeight
      });
      URL.revokeObjectURL(url);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("image-meta-failed"));
    };

    image.src = url;
  });
}

function readVideoMeta(file: File) {
  return new Promise<{ duration: number; width: number; height: number }>((resolve, reject) => {
    const video = document.createElement("video");
    const url = URL.createObjectURL(file);

    video.preload = "metadata";

    video.onloadedmetadata = () => {
      resolve({
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight
      });
      URL.revokeObjectURL(url);
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("video-meta-failed"));
    };

    video.src = url;
  });
}

async function validateMedia(file: File, lang: Lang) {
  const isImage = file.type.startsWith("image/");
  const isMp4 = file.type === "video/mp4";

  if (!isImage && !isMp4) {
    return {
      error: tr(lang, "Only image files or MP4 videos are allowed.", "Разрешены только изображения и MP4 видео.")
    };
  }

  const sizeMb = Math.round((file.size / (1024 * 1024)) * 100) / 100;

  if (isImage && sizeMb > IMAGE_MAX_MB) {
    return {
      error: tr(
        lang,
        `Image is too large. Max ${IMAGE_MAX_MB}MB.`,
        `Изображение слишком большое. Максимум ${IMAGE_MAX_MB}МБ.`
      )
    };
  }

  if (isMp4 && sizeMb > VIDEO_MAX_MB) {
    return {
      error: tr(lang, `Video is too large. Max ${VIDEO_MAX_MB}MB.`, `Видео слишком большое. Максимум ${VIDEO_MAX_MB}МБ.`)
    };
  }

  if (isImage) {
    try {
      const meta = await readImageMeta(file);

      if (meta.width < MIN_IMAGE_SIDE || meta.height < MIN_IMAGE_SIDE) {
        return {
          error: tr(
            lang,
            `Image must be at least ${MIN_IMAGE_SIDE}x${MIN_IMAGE_SIDE}px.`,
            `Размер изображения должен быть минимум ${MIN_IMAGE_SIDE}x${MIN_IMAGE_SIDE}px.`
          )
        };
      }

      return {
        meta: {
          kind: "image" as const,
          width: meta.width,
          height: meta.height,
          sizeMb
        }
      };
    } catch {
      return {
        error: tr(lang, "Could not read image metadata.", "Не удалось прочитать метаданные изображения.")
      };
    }
  }

  try {
    const meta = await readVideoMeta(file);

    if (!Number.isFinite(meta.duration) || meta.duration > MAX_VIDEO_SECONDS) {
      return {
        error: tr(
          lang,
          `Video duration must be ${MAX_VIDEO_SECONDS} seconds or less.`,
          `Длительность видео должна быть не более ${MAX_VIDEO_SECONDS} секунд.`
        )
      };
    }

    return {
      meta: {
        kind: "video" as const,
        width: meta.width,
        height: meta.height,
        duration: Math.round(meta.duration * 10) / 10,
        sizeMb
      }
    };
  } catch {
    return {
      error: tr(lang, "Could not read video metadata.", "Не удалось прочитать метаданные видео.")
    };
  }
}

export function CampaignCreateForm({
  lang,
  locationId,
  locationName,
  pricePer30Days,
  totalSlots,
  initialStartDate,
  initialEndDate
}: Props) {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaMeta, setMediaMeta] = useState<MediaMeta | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [availability, setAvailability] = useState<Availability | null>(null);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const days = daysInclusive(startDate, endDate);

  const totalPrice = useMemo(() => {
    if (!days) return 0;
    return Math.round((pricePer30Days * days * 100) / 30) / 100;
  }, [days, pricePer30Days]);

  useEffect(() => {
    if (!mediaFile) {
      setPreviewUrl(null);
      return;
    }

    const url = URL.createObjectURL(mediaFile);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [mediaFile]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!startDate || !endDate) return;

      try {
        setAvailabilityError(null);

        const params = new URLSearchParams({
          locationId,
          startDate,
          endDate
        });

        const response = await fetch(`/api/availability?${params.toString()}`);
        const data = (await response.json()) as Availability | { error?: string };

        if (!response.ok) {
          if (!cancelled) {
            setAvailabilityError(
              "error" in data && data.error
                ? data.error
                : tr(lang, "Could not check availability.", "Не удалось проверить доступность.")
            );
          }
          return;
        }

        if (!cancelled) {
          setAvailability(data as Availability);
        }
      } catch {
        if (!cancelled) {
          setAvailabilityError(tr(lang, "Could not check availability.", "Не удалось проверить доступность."));
        }
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [endDate, lang, locationId, startDate]);

  const availableSlots = availability?.availableSlots ?? totalSlots;

  function validateStep1() {
    if (!businessName.trim() || !phone.trim() || !title.trim()) {
      setSubmitError(tr(lang, "Please fill all business details.", "Заполните все данные бизнеса."));
      return false;
    }

    setSubmitError(null);
    return true;
  }

  function validateStep3() {
    if (!startDate || !endDate || days < 1) {
      setSubmitError(tr(lang, "Please choose a valid date range.", "Выберите корректный диапазон дат."));
      return false;
    }

    if (availableSlots < 1) {
      setSubmitError(tr(lang, "No slots are available for selected dates.", "На выбранные даты нет свободных слотов."));
      return false;
    }

    setSubmitError(null);
    return true;
  }

  async function handleMediaChange(file: File | null) {
    setMediaError(null);
    setSubmitError(null);

    if (!file) {
      setMediaFile(null);
      setMediaMeta(null);
      return;
    }

    const result = await validateMedia(file, lang);

    if (result.error) {
      setMediaFile(null);
      setMediaMeta(null);
      setMediaError(result.error);
      return;
    }

    setMediaFile(file);
    setMediaMeta(result.meta ?? null);
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!validateStep3()) {
      return;
    }

    if (!mediaFile) {
      setSubmitError(tr(lang, "Please upload an image or MP4 file.", "Пожалуйста, загрузите изображение или MP4 файл."));
      return;
    }

    setSubmitError(null);
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("locationId", locationId);
      formData.append("businessName", businessName);
      formData.append("phone", phone);
      formData.append("title", title);
      formData.append("startDate", startDate);
      formData.append("endDate", endDate);
      formData.append("media", mediaFile);

      const response = await fetch("/api/campaigns/create", {
        method: "POST",
        body: formData
      });

      const data = (await response.json()) as { id?: string; error?: string };

      if (!response.ok || !data.id) {
        setSubmitError(data.error ?? tr(lang, "Could not create campaign.", "Не удалось создать кампанию."));
        return;
      }

      router.push(`/campaigns/${data.id}`);
    } catch {
      setSubmitError(tr(lang, "Could not create campaign.", "Не удалось создать кампанию."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="card space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">{tr(lang, "Create campaign", "Создать кампанию")}</h1>
          <p className="text-sm text-slate-600">
            {tr(lang, "Location:", "Локация:")} {locationName}
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-3">
          {[1, 2, 3].map((entry) => (
            <div key={entry} className={`rounded-md border px-3 py-2 text-sm ${entry <= step ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300"}`}>
              {entry}. {entry === 1 ? tr(lang, "Business", "Бизнес") : entry === 2 ? tr(lang, "Media", "Медиа") : tr(lang, "Dates & Price", "Даты и цена")}
            </div>
          ))}
        </div>

        {step === 1 ? (
          <div className="space-y-3">
            <label className="field-label">
              {tr(lang, "Business name", "Название бизнеса")}
              <input value={businessName} onChange={(event) => setBusinessName(event.target.value)} required />
            </label>
            <label className="field-label">
              {tr(lang, "Phone", "Телефон")}
              <input value={phone} onChange={(event) => setPhone(event.target.value)} required />
            </label>
            <label className="field-label">
              {tr(lang, "Ad title", "Название рекламы")}
              <input value={title} onChange={(event) => setTitle(event.target.value)} required />
            </label>
          </div>
        ) : null}

        {step === 2 ? (
          <div className="space-y-3">
            <label className="field-label">
              {tr(lang, "Media (image or MP4)", "Медиа (изображение или MP4)")}
              <input
                type="file"
                accept="image/*,video/mp4"
                onChange={(event) => void handleMediaChange(event.target.files?.[0] ?? null)}
                required
              />
            </label>

            {mediaMeta ? (
              <div className="rounded-md border border-slate-200 p-3 text-sm">
                <p>
                  <span className="font-medium">{tr(lang, "Type:", "Тип:")}</span> {mediaMeta.kind.toUpperCase()}
                </p>
                <p>
                  <span className="font-medium">{tr(lang, "Size:", "Размер:")}</span> {mediaMeta.sizeMb} MB
                </p>
                {mediaMeta.width && mediaMeta.height ? (
                  <p>
                    <span className="font-medium">{tr(lang, "Resolution:", "Разрешение:")}</span> {mediaMeta.width}x{mediaMeta.height}
                  </p>
                ) : null}
                {typeof mediaMeta.duration === "number" ? (
                  <p>
                    <span className="font-medium">{tr(lang, "Duration:", "Длительность:")}</span> {mediaMeta.duration}s
                  </p>
                ) : null}
              </div>
            ) : null}

            {previewUrl ? (
              mediaFile?.type.startsWith("video") ? (
                <video src={previewUrl} controls className="max-h-72 w-full rounded-md object-contain" />
              ) : (
                <img src={previewUrl} alt="Campaign media preview" className="max-h-72 w-full rounded-md object-contain" />
              )
            ) : (
              <p className="text-sm text-slate-500">
                {tr(lang, "Media preview will appear after upload.", "Предпросмотр появится после загрузки файла.")}
              </p>
            )}
          </div>
        ) : null}

        {step === 3 ? (
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="field-label">
                {tr(lang, "Start date", "Дата начала")}
                <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} required />
              </label>

              <label className="field-label">
                {tr(lang, "End date", "Дата окончания")}
                <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} required />
              </label>
            </div>

            <div className="rounded-md border border-slate-200 p-3 text-sm">
              <p>
                <span className="font-medium">{tr(lang, "Total slots:", "Всего слотов:")}</span> {totalSlots}
              </p>
              <p>
                <span className="font-medium">{tr(lang, "Available for your dates:", "Доступно на ваши даты:")}</span> {availableSlots}
              </p>
              <p>
                <span className="font-medium">{tr(lang, "Days selected:", "Выбрано дней:")}</span> {days}
              </p>
              <p>
                <span className="font-medium">{tr(lang, "Estimated price:", "Примерная цена:")}</span> {formatMoney(totalPrice)}
              </p>
              <p className="mt-2 text-slate-600">
                {tr(
                  lang,
                  "After submitting, you can pay by card/Click/Payme and download invoice.",
                  "После отправки вы сможете оплатить картой/Click/Payme и скачать счёт."
                )}
              </p>
            </div>
          </div>
        ) : null}

        {mediaError ? <p className="text-sm text-rose-600">{mediaError}</p> : null}
        {availabilityError ? <p className="text-sm text-rose-600">{availabilityError}</p> : null}
        {submitError ? <p className="text-sm text-rose-600">{submitError}</p> : null}

        <div className="flex flex-wrap gap-2">
          {step > 1 ? (
            <button type="button" className="btn-secondary" onClick={() => setStep((current) => Math.max(current - 1, 1))}>
              {tr(lang, "Back", "Назад")}
            </button>
          ) : null}

          {step < 3 ? (
            <button
              type="button"
              onClick={() => {
                if (step === 1 && !validateStep1()) {
                  return;
                }

                if (step === 2 && !mediaFile) {
                  setSubmitError(tr(lang, "Please upload validated media.", "Загрузите корректный медиафайл."));
                  return;
                }

                setSubmitError(null);
                setStep((current) => Math.min(current + 1, 3));
              }}
            >
              {tr(lang, "Next", "Далее")}
            </button>
          ) : (
            <button type="submit" disabled={submitting || availableSlots < 1 || days < 1 || !mediaFile} className="sm:w-fit">
              {submitting ? tr(lang, "Submitting...", "Отправка...") : tr(lang, "Submit campaign", "Отправить кампанию")}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
