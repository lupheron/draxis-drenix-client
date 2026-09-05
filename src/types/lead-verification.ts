export type WhatsappVerificationStatus =
  | "valid"
  | "not_registered"
  | "error"
  | "pending"
  | "not_configured";

export type TelegramVerificationStatus =
  | "found"
  | "not_found_or_hidden"
  | "not_configured"
  | "error";

export type LeadSocialVerificationData = {
  phone: string;
  whatsapp: boolean;
  telegram: boolean;
  /** Extended status from backend — optional until Laravel ships it */
  whatsapp_status?: WhatsappVerificationStatus;
  telegram_status?: TelegramVerificationStatus;
  facebook_search_url: string;
  instagram_search_url: string;
};

export type LeadSocialVerificationResponse = {
  status: "success";
  data: LeadSocialVerificationData;
};
