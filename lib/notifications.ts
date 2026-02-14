import { isDemoMode } from "@/lib/demo-mode";
import { prisma } from "@/lib/prisma";

type SendNotificationInput = {
  campaignId?: string;
  recipient: string;
  message: string;
  channel: "EMAIL" | "TELEGRAM";
};

async function sendTelegramMessage(message: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return {
      sent: false,
      error: "telegram-not-configured"
    };
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message
      })
    });

    if (!response.ok) {
      return {
        sent: false,
        error: `telegram-http-${response.status}`
      };
    }

    return {
      sent: true
    };
  } catch {
    return {
      sent: false,
      error: "telegram-request-failed"
    };
  }
}

export async function sendNotification(input: SendNotificationInput) {
  if (isDemoMode || !prisma) {
    return;
  }

  if (input.channel === "TELEGRAM") {
    const result = await sendTelegramMessage(input.message);

    await prisma.notificationLog.create({
      data: {
        campaignId: input.campaignId,
        channel: input.channel,
        recipient: input.recipient,
        message: input.message,
        status: result.sent ? "SENT" : `FAILED:${result.error ?? "unknown"}`
      }
    });

    return;
  }

  await prisma.notificationLog.create({
    data: {
      campaignId: input.campaignId,
      channel: input.channel,
      recipient: input.recipient,
      message: input.message,
      status: "QUEUED"
    }
  });
}

type CampaignEventParams = {
  campaignId: string;
  title: string;
  businessName: string;
  phone: string;
  textEn: string;
};

export async function notifyCampaignEvent(params: CampaignEventParams) {
  const adminEmail = process.env.ADMIN_EMAIL ?? "admin@smartcast.local";
  const telegramRecipient = process.env.TELEGRAM_CHAT_ID ?? "telegram-admin";

  const message = `${params.textEn}\nCampaign: ${params.title}\nBusiness: ${params.businessName}\nContact: ${params.phone}\nID: ${params.campaignId}`;

  await Promise.all([
    sendNotification({
      campaignId: params.campaignId,
      channel: "EMAIL",
      recipient: adminEmail,
      message
    }),
    sendNotification({
      campaignId: params.campaignId,
      channel: "TELEGRAM",
      recipient: telegramRecipient,
      message
    })
  ]);
}
