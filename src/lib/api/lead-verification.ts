import { apiRequest } from "@/lib/api/client";
import type { LeadSocialVerificationResponse } from "@/types/lead-verification";
import { cleanPhoneDigits } from "@/utils/phone";

export async function verifyLeadSocials(
  phone: string,
): Promise<LeadSocialVerificationResponse> {
  const digits = cleanPhoneDigits(phone);
  return apiRequest<LeadSocialVerificationResponse>("/leads/verify-socials", {
    method: "POST",
    body: JSON.stringify({ phone: digits }),
  });
}
