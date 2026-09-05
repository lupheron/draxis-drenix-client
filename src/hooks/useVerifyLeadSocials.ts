import { useMutation } from "@tanstack/react-query";
import { verifyLeadSocials } from "@/lib/api/lead-verification";
import type { LeadSocialVerificationData } from "@/types/lead-verification";

export function useVerifyLeadSocials() {
  return useMutation({
    mutationFn: (phone: string) => verifyLeadSocials(phone),
  });
}

export type { LeadSocialVerificationData };
