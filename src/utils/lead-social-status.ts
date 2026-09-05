import type {
  LeadSocialVerificationData,
  TelegramVerificationStatus,
  WhatsappVerificationStatus,
} from "@/types/lead-verification";

export type SocialPlatformBadgeTone = "success" | "muted" | "warning" | "danger";

export type SocialPlatformBadgeView = {
  shortLabel: string;
  longLabel: string;
  hint: string;
  tone: SocialPlatformBadgeTone;
};

const TELEGRAM_PRIVACY_HINT =
  "Telegram may hide this number from API lookup (Privacy → Phone number). The account can still exist — your Telegram app may show the name if you have chatted or saved the contact.";

const WHATSAPP_NOT_REGISTERED_HINT =
  "This number is not registered on WhatsApp, or Whapi could not confirm it.";

export function resolveWhatsappBadge(
  data: Pick<LeadSocialVerificationData, "whatsapp" | "whatsapp_status">,
): SocialPlatformBadgeView {
  if (data.whatsapp || data.whatsapp_status === "valid") {
    return {
      shortLabel: "✓ Active",
      longLabel: "Active on WhatsApp",
      hint: "Whapi confirmed this number on WhatsApp.",
      tone: "success",
    };
  }

  switch (data.whatsapp_status) {
    case "pending":
      return {
        shortLabel: "… Pending",
        longLabel: "WhatsApp check pending",
        hint: "Whapi is still processing this lookup. Try again in a moment.",
        tone: "warning",
      };
    case "error":
      return {
        shortLabel: "! Error",
        longLabel: "WhatsApp check failed",
        hint: "Whapi returned an error. Check backend logs and channel connection.",
        tone: "danger",
      };
    case "not_configured":
      return {
        shortLabel: "— N/A",
        longLabel: "WhatsApp not configured",
        hint: "WHAPI_TOKEN is not set on the backend.",
        tone: "muted",
      };
    case "not_registered":
      return {
        shortLabel: "✗ Not registered",
        longLabel: "Not on WhatsApp",
        hint: WHATSAPP_NOT_REGISTERED_HINT,
        tone: "muted",
      };
    default:
      return {
        shortLabel: "✗ Not found",
        longLabel: "Not found on WhatsApp",
        hint: WHATSAPP_NOT_REGISTERED_HINT,
        tone: "muted",
      };
  }
}

export function resolveTelegramBadge(
  data: Pick<LeadSocialVerificationData, "telegram" | "telegram_status">,
): SocialPlatformBadgeView {
  if (data.telegram || data.telegram_status === "found") {
    return {
      shortLabel: "✓ Active",
      longLabel: "Active on Telegram",
      hint: "Telegram lookup found an account for this number.",
      tone: "success",
    };
  }

  switch (data.telegram_status) {
    case "not_found_or_hidden":
      return {
        shortLabel: "🔒 Hidden",
        longLabel: "Not searchable (privacy)",
        hint: TELEGRAM_PRIVACY_HINT,
        tone: "warning",
      };
    case "error":
      return {
        shortLabel: "! Error",
        longLabel: "Telegram check failed",
        hint: "Telegram provider returned an error. Check TG session / API config.",
        tone: "danger",
      };
    case "not_configured":
      return {
        shortLabel: "— N/A",
        longLabel: "Telegram not configured",
        hint: "Telegram API credentials are not set on the backend.",
        tone: "muted",
      };
    default:
      return {
        shortLabel: "🔒 Hidden?",
        longLabel: "Not searchable (privacy)",
        hint: TELEGRAM_PRIVACY_HINT,
        tone: "warning",
      };
  }
}

export function inferTelegramStatus(
  data: LeadSocialVerificationData,
): TelegramVerificationStatus {
  if (data.telegram_status) return data.telegram_status;
  return data.telegram ? "found" : "not_found_or_hidden";
}

export function inferWhatsappStatus(
  data: LeadSocialVerificationData,
): WhatsappVerificationStatus {
  if (data.whatsapp_status) return data.whatsapp_status;
  return data.whatsapp ? "valid" : "not_registered";
}
