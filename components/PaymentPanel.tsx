"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lang, tr } from "@/lib/i18n";
import { formatMoney } from "@/lib/pricing";

type Props = {
  lang: Lang;
  campaignId: string;
  amountUsd: number;
  paymentStatus: "PENDING" | "PAID" | "FAILED" | "NONE";
  invoiceNumber?: string;
};

export function PaymentPanel({ lang, campaignId, amountUsd, paymentStatus, invoiceNumber }: Props) {
  const router = useRouter();
  const [method, setMethod] = useState("card");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onPay() {
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("campaignId", campaignId);
      formData.append("method", method);

      const response = await fetch("/api/payments/checkout", {
        method: "POST",
        body: formData
      });

      const data = (await response.json()) as { ok?: boolean; invoiceNumber?: string; error?: string };

      if (!response.ok || !data.ok) {
        setError(data.error ?? tr(lang, "Payment failed.", "Платёж не выполнен."));
        return;
      }

      setMessage(
        data.invoiceNumber
          ? tr(lang, `Payment successful. Invoice ${data.invoiceNumber} generated.`, `Платёж выполнен. Счёт ${data.invoiceNumber} создан.`)
          : tr(lang, "Payment successful.", "Платёж выполнен.")
      );
      router.refresh();
    } catch {
      setError(tr(lang, "Payment failed.", "Платёж не выполнен."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card space-y-3">
      <h2 className="text-xl font-semibold">{tr(lang, "Payment & Invoice", "Оплата и счёт")}</h2>
      <p className="text-sm text-slate-600">
        {tr(lang, "Amount due:", "К оплате:")} {formatMoney(amountUsd)}
      </p>
      <p className="text-sm text-slate-600">
        {tr(lang, "Payment status:", "Статус оплаты:")}{" "}
        <span className="font-medium">{paymentStatus === "NONE" ? tr(lang, "UNPAID", "НЕ ОПЛАЧЕНО") : paymentStatus}</span>
      </p>

      {invoiceNumber ? (
        <a
          href={`/api/invoices/${campaignId}`}
          className="inline-flex rounded-md border border-slate-900 bg-slate-900 px-3 py-2 text-sm font-medium text-white no-underline"
        >
          {tr(lang, "Download invoice", "Скачать счёт")} ({invoiceNumber})
        </a>
      ) : null}

      {paymentStatus !== "PAID" ? (
        <div className="space-y-2">
          <label className="field-label">
            {tr(lang, "Payment method", "Способ оплаты")}
            <select value={method} onChange={(event) => setMethod(event.target.value)}>
              <option value="card">{tr(lang, "Card", "Карта")}</option>
              <option value="click">Click</option>
              <option value="payme">Payme</option>
            </select>
          </label>
          <button type="button" onClick={onPay} disabled={loading}>
            {loading ? tr(lang, "Processing...", "Обработка...") : tr(lang, "Pay now", "Оплатить")}
          </button>
        </div>
      ) : null}

      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
