"use client";

import { useMemo, useState } from "react";
import EmptyStateDefault from "@/components/UI/EmptyStateDefault";
import { PeriodControls, usePeriodRange } from "@/components/UI/PeriodControls";
import SkeletonDefault from "@/components/UI/SkeletonDefault";
import { useMyLeads } from "@/hooks/useAuth";
import { ApiError } from "@/lib/api/client";
import type { ClientLead } from "@/lib/types";
import { cn } from "@/lib/cn";

export default function LeadsView() {
  const { period, setPeriod, custom, setCustom, range } = usePeriodRange("month");
  const leadsQuery = useMyLeads(range.from, range.to);
  const [selected, setSelected] = useState<ClientLead | null>(null);

  const leads = leadsQuery.data ?? [];
  const errorMessage =
    leadsQuery.error instanceof ApiError
      ? leadsQuery.error.message
      : leadsQuery.isError
        ? "Could not load your leads."
        : null;

  const sorted = useMemo(
    () =>
      [...leads].sort((a, b) => {
        const aDate = a.updated_at ?? a.created_at ?? "";
        const bDate = b.updated_at ?? b.created_at ?? "";
        return bDate.localeCompare(aDate);
      }),
    [leads],
  );

  return (
    <div className="flex flex-col gap-8">
      <section className="animate-fade-in">
        <p className="text-sm uppercase tracking-[0.18em] text-[var(--muted)]">
          My Leads
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl tracking-tight text-[var(--foreground)] sm:text-5xl">
          Leads on your desk
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
          Only leads attributed to you. Company-wide boards and driver
          enrichment stay in Admin.
        </p>
      </section>

      <PeriodControls
        period={period}
        onPeriodChange={setPeriod}
        custom={custom}
        onCustomChange={setCustom}
      />
      <p className="-mt-5 text-xs text-[var(--muted)]">
        America/Chicago (Central Time)
      </p>

      {errorMessage ? (
        <EmptyStateDefault
          title="Leads unavailable"
          description={`${errorMessage} Backend needs GET /me/leads?from=&to= for HR employees.`}
        />
      ) : leadsQuery.isLoading ? (
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <SkeletonDefault key={index} className="h-16" />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <EmptyStateDefault
          title="No leads in this period"
          description="When Monday sync attributes leads to you, they will appear here."
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--surface)]/90 shadow-[var(--shadow-soft)]">
          <ul className="divide-y divide-[var(--border)]">
            {sorted.map((lead) => {
              const title =
                lead.title || lead.name || lead.company_name || `Lead #${lead.id}`;
              return (
                <li key={String(lead.id)}>
                  <button
                    type="button"
                    onClick={() => setSelected(lead)}
                    className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition-colors hover:bg-[var(--accent-dim)] sm:px-5"
                  >
                    <div>
                      <p className="font-medium text-[var(--foreground)]">
                        {title}
                      </p>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {[lead.company_name, lead.updated_at ?? lead.created_at]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </div>
                    <StatusPill status={lead.status} />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {selected ? (
        <LeadDrawer lead={selected} onClose={() => setSelected(null)} />
      ) : null}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded-md px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.12em]",
        statusStyles(status),
      )}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}

function statusStyles(status: string): string {
  const normalized = status.toLowerCase();
  if (normalized.includes("hire") || normalized === "hired") {
    return "bg-[var(--success-soft)] text-[var(--success)]";
  }
  if (normalized.includes("load")) {
    return "bg-[var(--accent-soft)] text-[var(--accent-strong)]";
  }
  if (normalized.includes("reject")) {
    return "bg-[var(--danger-soft)] text-[var(--danger)]";
  }
  if (normalized.includes("follow")) {
    return "bg-[#f3ebe0] text-[#8a6a3d]";
  }
  return "bg-[var(--accent-dim)] text-[var(--muted-foreground)]";
}

function LeadDrawer({
  lead,
  onClose,
}: {
  lead: ClientLead;
  onClose: () => void;
}) {
  const title =
    lead.title || lead.name || lead.company_name || `Lead #${lead.id}`;

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-[var(--foreground)]/25 backdrop-blur-[2px]">
      <button
        type="button"
        className="h-full flex-1 cursor-default"
        aria-label="Close lead details"
        onClick={onClose}
      />
      <aside className="animate-drawer-in flex h-full w-full max-w-md flex-col border-l border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-lift)]">
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-5 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-[var(--muted)]">
              Lead detail
            </p>
            <h2 className="mt-1 font-[family-name:var(--font-display)] text-2xl text-[var(--foreground)]">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-[var(--muted-foreground)] hover:bg-[var(--accent-dim)]"
          >
            Close
          </button>
        </div>
        <div className="flex flex-col gap-4 overflow-y-auto px-5 py-5 text-sm">
          <DetailRow label="Status" value={lead.status.replaceAll("_", " ")} />
          <DetailRow label="Company" value={lead.company_name ?? "—"} />
          <DetailRow label="Created" value={lead.created_at ?? "—"} />
          <DetailRow label="Updated" value={lead.updated_at ?? "—"} />
          <DetailRow label="Follow-up" value={lead.follow_up_at ?? "—"} />
          <DetailRow label="Hired" value={lead.hired_at ?? "—"} />
          <DetailRow label="Loaded" value={lead.loaded_at ?? "—"} />
          <DetailRow label="Rejected" value={lead.rejected_at ?? "—"} />
          {lead.notes ? (
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
                Notes
              </p>
              <p className="mt-2 leading-6 text-[var(--foreground)]">
                {lead.notes}
              </p>
            </div>
          ) : null}
        </div>
      </aside>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-[var(--border)]/70 pb-3">
      <span className="text-xs uppercase tracking-[0.14em] text-[var(--muted)]">
        {label}
      </span>
      <span className="text-right text-[var(--foreground)]">{value}</span>
    </div>
  );
}
