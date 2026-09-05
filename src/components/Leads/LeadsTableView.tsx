"use client";

import { useEffect, useMemo, useState } from "react";
import ButtonDefault from "@/components/Button/ButtonDefault";
import LeadSocialVerifier from "@/components/Leads/LeadSocialVerifier";
import EmptyStateDefault from "@/components/UI/EmptyStateDefault";
import LoadingDefault from "@/components/UI/LoadingDefault";
import { useMyDriverLeadsBoard } from "@/hooks/useDriverLeads";
import { ApiError } from "@/lib/api/client";
import { authStorage } from "@/lib/auth-storage";
import { cn } from "@/lib/cn";
import type { ClientEmployee, DriverLeadRecord } from "@/lib/types";
import {
  buildCheckNumberFileContent,
  downloadTextFile,
} from "@/utils/phone-export";
import { isValidPhoneForVerification, whatsAppChatUrl } from "@/utils/phone";

export type LeadBoardKind = "new_leads" | "follow_up";

const BOARD_TABS: { id: LeadBoardKind; label: string; prefix: string }[] = [
  { id: "new_leads", label: "New leads", prefix: "New leads" },
  { id: "follow_up", label: "Follow up leads", prefix: "Follow up" },
];

function boardNameForEmployee(
  prefix: string,
  employee: ClientEmployee | null,
): string {
  const owner =
    employee?.first_name?.trim() ||
    employee?.username?.split(".")[0] ||
    "";
  if (!owner) return prefix;
  const titled = owner.charAt(0).toUpperCase() + owner.slice(1);
  return `${prefix} ${titled}`;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return value.slice(0, 10);
}

export default function LeadsTableView() {
  const [employee, setEmployee] = useState<ClientEmployee | null>(null);
  const [boardKind, setBoardKind] = useState<LeadBoardKind>("new_leads");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    setEmployee(authStorage.getEmployee());
  }, []);

  const boardTab = BOARD_TABS.find((tab) => tab.id === boardKind) ?? BOARD_TABS[0];
  const boardName = boardNameForEmployee(boardTab.prefix, employee);
  const company = employee?.company ?? "JM";

  const boardQuery = useMyDriverLeadsBoard({
    company,
    board: boardName,
    enabled: Boolean(employee),
  });

  const leads = boardQuery.data ?? [];

  useEffect(() => {
    setSelectedIds(new Set());
    setActionMessage(null);
    setActionError(null);
  }, [boardKind, boardName]);

  const selectedLeads = useMemo(
    () => leads.filter((lead) => selectedIds.has(lead.id)),
    [leads, selectedIds],
  );

  const allSelected =
    leads.length > 0 && leads.every((lead) => selectedIds.has(lead.id));

  function toggleAll() {
    if (allSelected) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(leads.map((lead) => lead.id)));
  }

  function toggleOne(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function onGetNumbers() {
    setActionError(null);
    if (selectedLeads.length === 0) {
      setActionError("Select at least one lead.");
      return;
    }

    const { lines, skipped } = buildCheckNumberFileContent(
      selectedLeads.map((lead) => lead.phone),
    );

    if (lines.length === 0) {
      setActionError(
        "No valid phone numbers in the selection. Need digits with country code (US: 1 + 10 digits).",
      );
      return;
    }

    const stamp = new Date().toISOString().slice(0, 10);
    const filename = `checknumber-${boardTab.id}-${stamp}.txt`;
    downloadTextFile(filename, `${lines.join("\n")}\n`);

    setActionMessage(
      `Saved ${lines.length} number${lines.length === 1 ? "" : "s"} to ${filename}` +
        (skipped > 0 ? ` · skipped ${skipped} without phone` : "") +
        ". Upload the TXT on platform.checknumber.ai (one country per file).",
    );
  }

  function onMoveBoard() {
    setActionError(null);
    if (selectedLeads.length === 0) {
      setActionError("Select at least one lead.");
      return;
    }
    const target =
      boardKind === "new_leads"
        ? boardNameForEmployee("Follow up", employee)
        : boardNameForEmployee("New leads", employee);
    setActionError(
      `Move to “${target}” needs a Monday write API (not available on Client Portal yet). Ask backend for POST /me/driver-leads/move.`,
    );
  }

  function onDelete() {
    setActionError(null);
    if (selectedLeads.length === 0) {
      setActionError("Select at least one lead.");
      return;
    }
    setActionError(
      "Delete on Monday needs a write API (not available on Client Portal yet). Ask backend for DELETE /me/driver-leads.",
    );
  }

  const errorMessage =
    boardQuery.error instanceof ApiError
      ? boardQuery.error.message
      : boardQuery.isError
        ? "Could not load your board."
        : null;

  return (
    <div className="flex flex-col gap-6">
      <section className="animate-fade-in">
        <p className="text-sm uppercase tracking-[0.18em] text-[var(--muted)]">
          My Leads · Table
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl tracking-tight text-[var(--foreground)] sm:text-5xl">
          Your Monday boards
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
          New leads and Follow up — every row from your boards. Select leads to
          export numbers for checknumber.ai, or request move / delete once Monday
          write APIs ship.
        </p>
      </section>

      <div className="flex flex-wrap gap-2">
        {BOARD_TABS.map((tab) => {
          const active = tab.id === boardKind;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setBoardKind(tab.id)}
              className={cn(
                "rounded-md border px-4 py-2 text-sm font-medium transition-colors",
                active
                  ? "border-[var(--accent)] bg-[var(--accent)] text-white"
                  : "border-[var(--border-strong)] bg-[var(--surface)] text-[var(--foreground)] hover:bg-[var(--accent-dim)]",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)]/90 px-4 py-3 shadow-[var(--shadow-soft)]">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
            Board
          </p>
          <p className="mt-0.5 font-medium text-[var(--foreground)]">
            {boardName}
            <span className="ml-2 text-sm font-normal text-[var(--muted-foreground)]">
              {leads.length} lead{leads.length === 1 ? "" : "s"}
              {selectedIds.size > 0 ? ` · ${selectedIds.size} selected` : ""}
            </span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ButtonDefault
            size="sm"
            disabled={selectedIds.size === 0}
            onClick={onGetNumbers}
          >
            Get numbers
          </ButtonDefault>
          <ButtonDefault
            size="sm"
            variant="outline"
            disabled={selectedIds.size === 0}
            onClick={onMoveBoard}
          >
            Move board
          </ButtonDefault>
          <ButtonDefault
            size="sm"
            variant="outline"
            disabled={selectedIds.size === 0}
            onClick={onDelete}
            className="border-[#e7a0a6] text-[#c1121f] hover:bg-[#fde2e4]"
          >
            Delete
          </ButtonDefault>
        </div>
      </div>

      {actionMessage ? (
        <p className="rounded-md border border-[#8dceb0] bg-[#d8f3e5] px-4 py-3 text-sm text-[#15803d]">
          {actionMessage}
        </p>
      ) : null}
      {actionError ? (
        <p className="rounded-md border border-[#e7a0a6] bg-[#fde2e4] px-4 py-3 text-sm text-[#c1121f]">
          {actionError}
        </p>
      ) : null}

      {errorMessage ? (
        <EmptyStateDefault title="Board unavailable" description={errorMessage} />
      ) : boardQuery.isLoading || !employee ? (
        <LoadingDefault label="Loading board leads" />
      ) : leads.length === 0 ? (
        <EmptyStateDefault
          title="No leads on this board"
          description={`Nothing synced for “${boardName}” yet.`}
        />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-elevated)] shadow-[var(--shadow-soft)]">
          <div className="max-h-[min(70vh,52rem)] overflow-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="sticky top-0 z-10 bg-[var(--surface)]">
                <tr className="border-b border-[var(--border)] text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleAll}
                      aria-label="Select all leads"
                      className="h-4 w-4 accent-[var(--accent)]"
                    />
                  </th>
                  <th className="px-3 py-3">Name</th>
                  <th className="px-3 py-3">Phone</th>
                  <th className="px-3 py-3">Status</th>
                  <th className="px-3 py-3">Group</th>
                  <th className="px-3 py-3">State</th>
                  <th className="px-3 py-3">Platform</th>
                  <th className="px-3 py-3">Applied</th>
                  <th className="px-3 py-3">Calls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {leads.map((lead) => (
                  <LeadRow
                    key={lead.id}
                    lead={lead}
                    selected={selectedIds.has(lead.id)}
                    onToggle={() => toggleOne(lead.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function LeadRow({
  lead,
  selected,
  onToggle,
}: {
  lead: DriverLeadRecord;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <tr
      className={cn(
        "transition-colors",
        selected ? "bg-[var(--accent-dim)]" : "hover:bg-[var(--surface)]",
      )}
    >
      <td className="px-4 py-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={onToggle}
          aria-label={`Select ${lead.name}`}
          className="h-4 w-4 accent-[var(--accent)]"
        />
      </td>
      <td className="px-3 py-3 font-medium text-[var(--foreground)]">
        {lead.name || "—"}
      </td>
      <td className="px-3 py-3 tabular-nums text-[var(--foreground)]">
        <div className="space-y-2">
          {lead.phone && isValidPhoneForVerification(lead.phone) ? (
            <a
              href={whatsAppChatUrl(lead.phone)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--accent-strong)] underline-offset-2 hover:underline"
              title="Open in WhatsApp"
            >
              {lead.phone}
            </a>
          ) : (
            <p>{lead.phone || "—"}</p>
          )}
          <LeadSocialVerifier phone={lead.phone} compact />
        </div>
      </td>
      <td className="px-3 py-3 text-[var(--muted-foreground)]">
        {lead.status || "—"}
      </td>
      <td className="px-3 py-3 text-[var(--muted-foreground)]">
        {lead.group_title || "—"}
      </td>
      <td className="px-3 py-3 text-[var(--muted-foreground)]">
        {lead.state || "—"}
      </td>
      <td className="px-3 py-3 text-[var(--muted-foreground)]">
        {lead.platform || "—"}
      </td>
      <td className="px-3 py-3 text-[var(--muted-foreground)]">
        {formatDate(lead.applied_on)}
      </td>
      <td className="px-3 py-3 text-[var(--muted-foreground)]">
        {lead.calls_label ?? (lead.calls != null ? String(lead.calls) : "—")}
      </td>
    </tr>
  );
}
