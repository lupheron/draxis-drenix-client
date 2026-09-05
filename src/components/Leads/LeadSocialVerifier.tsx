"use client";

import { useState } from "react";
import ButtonDefault from "@/components/Button/ButtonDefault";
import { useVerifyLeadSocials } from "@/hooks/useVerifyLeadSocials";
import { cn } from "@/lib/cn";
import type { LeadSocialVerificationData } from "@/types/lead-verification";
import {
  resolveTelegramBadge,
  resolveWhatsappBadge,
  type SocialPlatformBadgeView,
} from "@/utils/lead-social-status";
import {
  isValidPhoneForVerification,
  telegramChatUrl,
  whatsAppChatUrl,
} from "@/utils/phone";
import { formatApiError } from "@/utils/portal-errors";

type Props = {
  phone: string | null | undefined;
  /** Inline badges only — no outer border */
  compact?: boolean;
  className?: string;
};

const toneStyles = {
  success: "border-[#8dceb0] bg-[#d8f3e5] text-[#15803d]",
  warning: "border-[#f0b27a] bg-[#fde7d6] text-[#ea580c]",
  danger: "border-[#e7a0a6] bg-[#fde2e4] text-[#c1121f]",
  muted:
    "border-[var(--border)] bg-[var(--surface)] text-[var(--muted-foreground)]",
} as const;

function PlatformBadge({
  platform,
  view,
  compact,
  href,
}: {
  platform: string;
  view: SocialPlatformBadgeView;
  compact?: boolean;
  href?: string;
}) {
  const className = cn(
    "inline-flex max-w-full items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.1em]",
    toneStyles[view.tone],
    href && "cursor-pointer transition-opacity hover:opacity-90",
  );

  const content = (
    <>
      <span className="truncate">
        {compact ? view.shortLabel : view.longLabel}
      </span>
      <span className="opacity-70">
        · {platform}
        {href ? " ↗" : ""}
      </span>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
        title={
          platform === "WhatsApp"
            ? "Open in WhatsApp"
            : `${view.hint} — Open in ${platform}`
        }
      >
        {content}
      </a>
    );
  }

  return (
    <span className={className} title={view.hint}>
      {content}
    </span>
  );
}

function SearchLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--muted-foreground)] underline-offset-2 hover:text-[var(--foreground)] hover:underline"
    >
      {label} →
    </a>
  );
}

function ResultPanel({
  data,
  compact,
}: {
  data: LeadSocialVerificationData;
  compact?: boolean;
}) {
  const whatsapp = resolveWhatsappBadge(data);
  const telegram = resolveTelegramBadge(data);
  const whatsappHref =
    data.whatsapp || data.whatsapp_status === "valid"
      ? whatsAppChatUrl(data.phone)
      : undefined;
  const telegramHref =
    data.telegram || data.telegram_status === "found"
      ? telegramChatUrl(data.phone)
      : undefined;
  const showPrivacyNote =
    !data.telegram &&
    (data.telegram_status === "not_found_or_hidden" || !data.telegram_status);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <PlatformBadge
          platform="WhatsApp"
          view={whatsapp}
          compact={compact}
          href={whatsappHref}
        />
        <PlatformBadge
          platform="Telegram"
          view={telegram}
          compact={compact}
          href={telegramHref}
        />
      </div>

      {!whatsappHref || !telegramHref ? (
        <div className="flex flex-wrap gap-3">
          {!whatsappHref ? (
            <SearchLink href={whatsAppChatUrl(data.phone)} label="Try WhatsApp" />
          ) : null}
          {!telegramHref ? (
            <SearchLink
              href={telegramChatUrl(data.phone)}
              label="Try Telegram"
            />
          ) : null}
        </div>
      ) : null}

      {showPrivacyNote && !compact ? (
        <p className="text-xs leading-relaxed text-[var(--muted-foreground)]">
          Telegram often hides numbers from API lookup when users set{" "}
          <span className="text-[var(--foreground)]">
            Privacy → Phone number → Nobody
          </span>
          . Your Telegram app may still show a name if you have chatted with
          them.
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <SearchLink href={data.facebook_search_url} label="Facebook search" />
        <SearchLink href={data.instagram_search_url} label="Instagram" />
      </div>
      <p className="text-[10px] text-[var(--muted)]">Checked {data.phone}</p>
    </div>
  );
}

export default function LeadSocialVerifier({
  phone,
  compact = false,
  className,
}: Props) {
  const verify = useVerifyLeadSocials();
  const [result, setResult] = useState<LeadSocialVerificationData | null>(null);

  const valid = isValidPhoneForVerification(phone);

  async function handleVerify() {
    if (!phone?.trim()) return;
    setResult(null);
    try {
      const response = await verify.mutateAsync(phone);
      setResult(response.data);
    } catch {
      /* error shown below */
    }
  }

  if (!valid) {
    return (
      <p className={cn("text-xs text-[var(--muted-foreground)]", className)}>
        Add a valid phone number to verify WhatsApp & Telegram.
      </p>
    );
  }

  return (
    <div
      className={cn(
        !compact &&
          "rounded-xl border border-[var(--border)] bg-[var(--surface)]/80 p-4",
        className,
      )}
    >
      {!compact ? (
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
          Social verification
        </p>
      ) : null}

      <div
        className={cn("flex flex-wrap items-center gap-3", !compact && "mt-3")}
      >
        <ButtonDefault
          type="button"
          size="sm"
          variant={compact ? "outline" : "primary"}
          disabled={verify.isPending}
          onClick={() => void handleVerify()}
        >
          {verify.isPending ? "Checking…" : "Verify socials"}
        </ButtonDefault>
        {!result ? (
          <div className="flex flex-wrap gap-3">
            <SearchLink href={whatsAppChatUrl(phone!)} label="Try WhatsApp" />
            <SearchLink href={telegramChatUrl(phone!)} label="Try Telegram" />
          </div>
        ) : null}
      </div>

      {verify.isError ? (
        <p className="mt-2 text-xs text-[var(--danger)]">
          {formatApiError(verify.error)}
        </p>
      ) : null}

      {result ? (
        <div className={cn(compact ? "mt-2" : "mt-3")}>
          <ResultPanel data={result} compact={compact} />
        </div>
      ) : null}
    </div>
  );
}
