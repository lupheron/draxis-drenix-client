"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import ButtonDefault from "@/components/Button/ButtonDefault";
import InputDefault from "@/components/FormItems/Input/InputDefault";
import SelectDefault from "@/components/FormItems/Select/SelectDefault";
import EmptyStateDefault from "@/components/UI/EmptyStateDefault";
import LoadingDefault from "@/components/UI/LoadingDefault";
import {
  useMyDriverLeadSearch,
  useMyDriverLeadsBrowse,
} from "@/hooks/useDriverLeads";
import { ApiError } from "@/lib/api/client";
import { authStorage } from "@/lib/auth-storage";
import { cn } from "@/lib/cn";
import { chartColors } from "@/lib/chart-theme";
import type {
  CompanyCode,
  DriverLeadRecord,
  DriverLeadSearchGroup,
  DriverLeadStatusKey,
} from "@/lib/types";

const STATUS_OPTIONS: { value: DriverLeadStatusKey | ""; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "n_a", label: "N/A" },
  { value: "rejected", label: "Rejected" },
  { value: "follow_up", label: "Follow up" },
  { value: "call_back", label: "Call back" },
  { value: "hired", label: "Hired" },
  { value: "not_valid", label: "Not valid" },
  { value: "company_driver", label: "Company driver" },
  { value: "lease_driver", label: "Lease driver" },
  { value: "terminated", label: "Terminated" },
];

const STATUS_COLORS: Record<string, string> = {
  rejected: "#b42318",
  n_a: chartColors.muted,
  follow_up: chartColors.slate,
  call_back: chartColors.sand,
  hired: chartColors.green,
  not_valid: "#8a6a3d",
  company_driver: chartColors.teal,
  lease_driver: chartColors.slate,
  terminated: "#7f1d1d",
};

type BrowseLayout = "table" | "cards";

function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return value.slice(0, 10);
}

function StatusBadge({ statusKey, label }: { statusKey: string; label: string }) {
  const color = STATUS_COLORS[statusKey] ?? chartColors.slate;
  return (
    <span
      className="inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em]"
      style={{
        borderColor: `${color}55`,
        backgroundColor: `${color}18`,
        color,
      }}
    >
      {label}
    </span>
  );
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  if (!value?.trim()) return null;
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-1 text-sm text-[var(--foreground)]">{value}</p>
    </div>
  );
}

function HistoryCard({ record }: { record: DriverLeadRecord }) {
  const extras = Object.entries(record.extra_columns ?? {}).filter(
    ([, value]) => value?.trim(),
  );
  const statusFromProcess = record.status_source;
  const placement =
    record.placement === "current"
      ? "Current desk"
      : record.placement === "previous"
        ? "Earlier desk"
        : record.placement === "process"
          ? "Process board"
          : null;
  const callsLabel = record.calls_label ?? (record.calls != null ? String(record.calls) : null);

  return (
    <article className="animate-rise rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] p-4 shadow-[var(--shadow-soft)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          {placement ? (
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
              {placement}
            </p>
          ) : null}
          <p className="mt-1 font-medium text-[var(--foreground)]">
            {record.owner ? `${record.owner} · ${record.board_name}` : record.board_name}
          </p>
          <p className="mt-1 text-xs text-[var(--muted-foreground)]">
            {record.group_title}
            {record.moved_to && record.board_owner !== record.moved_to
              ? ` · moved to ${record.moved_to}`
              : null}
          </p>
          {statusFromProcess ? (
            <p className="mt-1 text-xs text-[var(--muted)]">
              Status from {statusFromProcess.board_name}
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {callsLabel ? (
            <span className="inline-flex rounded-full border border-[#93b4f0] bg-[#dbe7fb] px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#1d4ed8]">
              {callsLabel === "1" ? "1 call" : `${callsLabel} calls`}
            </span>
          ) : null}
          <StatusBadge statusKey={record.status_key} label={record.status} />
        </div>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <DetailField label="Name" value={record.name} />
        <DetailField label="Phone" value={record.phone} />
        <DetailField label="Email" value={record.email} />
        <DetailField label="State" value={record.state} />
        <DetailField label="Platform" value={record.platform} />
        <DetailField label="Position" value={record.position} />
        <DetailField label="CDL" value={record.got_cdl} />
        <DetailField label="Applied" value={formatDate(record.applied_on)} />
        <DetailField label="Contacted" value={formatDate(record.contacted_on)} />
      </div>

      {record.notes?.trim() ? (
        <div className="mt-4 border-t border-[var(--border)] pt-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            Notes
          </p>
          <p className="mt-1 whitespace-pre-wrap text-sm text-[var(--foreground)]">
            {record.notes}
          </p>
        </div>
      ) : null}

      {extras.length > 0 ? (
        <div className="mt-4 border-t border-[var(--border)] pt-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
            More
          </p>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2">
            {extras.map(([key, value]) => (
              <div key={key}>
                <dt className="text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
                  {key}
                </dt>
                <dd className="mt-1 text-sm text-[var(--foreground)]">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      ) : null}
    </article>
  );
}

function SearchResultGroup({ group }: { group: DriverLeadSearchGroup }) {
  const [open, setOpen] = useState(true);
  const trail = group.ownership ?? [];
  const callsLabel =
    group.calls_label ?? (group.calls != null ? String(group.calls) : null);

  return (
    <section className="animate-rise overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]/90 shadow-[var(--shadow-soft)]">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-[var(--accent-dim)]"
      >
        <div>
          <p className="font-[family-name:var(--font-display)] text-lg font-semibold text-[var(--foreground)]">
            {group.name}
          </p>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            {[group.phone, group.email].filter(Boolean).join(" · ") || "No contact"}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {group.current_owner ? (
              <span className="rounded-full bg-[#dbe7fb] px-2.5 py-0.5 text-[11px] font-semibold text-[#1d4ed8]">
                Now: {group.current_owner}
              </span>
            ) : null}
            {group.origin_owner &&
            group.current_owner &&
            group.origin_owner.toLowerCase() !== group.current_owner.toLowerCase() ? (
              <span className="rounded-full bg-[#fde7d6] px-2.5 py-0.5 text-[11px] font-semibold text-[#ea580c]">
                First: {group.origin_owner}
              </span>
            ) : null}
            {trail.length > 1 ? (
              <span className="text-xs text-[var(--muted-foreground)]">
                {trail.map((step) => step.owner).join(" → ")}
              </span>
            ) : null}
            {callsLabel ? (
              <span className="rounded-full bg-[#d8f3e5] px-2.5 py-0.5 text-[11px] font-semibold text-[#15803d]">
                {callsLabel === "1" ? "1 HR call" : `${callsLabel} HR calls`}
              </span>
            ) : null}
            <span className="text-xs text-[var(--muted)]">
              {group.application_count} board
              {group.application_count === 1 ? "" : "s"}
            </span>
            {group.statuses.map((status) => (
              <StatusBadge
                key={status}
                statusKey={status}
                label={status.replace(/_/g, " ")}
              />
            ))}
          </div>
        </div>
        <span className="text-xs text-[var(--muted)]">{open ? "▾" : "▸"}</span>
      </button>

      {open ? (
        <div className="space-y-3 border-t border-[var(--border)] px-5 py-4">
          {group.history.map((record) => (
            <HistoryCard key={record.id} record={record} />
          ))}
        </div>
      ) : null}
    </section>
  );
}

function BrowseRow({ record }: { record: DriverLeadRecord }) {
  return (
    <tr className="border-b border-[var(--border)] last:border-b-0 hover:bg-[var(--accent-dim)]/60">
      <td className="px-4 py-3 font-medium text-[var(--foreground)]">{record.name}</td>
      <td className="px-4 py-3 text-[var(--muted-foreground)]">{record.phone ?? "—"}</td>
      <td className="px-4 py-3 text-[var(--muted-foreground)]">{record.email ?? "—"}</td>
      <td className="px-4 py-3">
        <StatusBadge statusKey={record.status_key} label={record.status} />
      </td>
      <td className="px-4 py-3 text-[var(--muted-foreground)]">{record.board_name}</td>
      <td className="px-4 py-3 text-[var(--muted-foreground)]">{record.owner ?? record.recruiter ?? "—"}</td>
      <td className="px-4 py-3 text-[var(--muted-foreground)]">
        {record.calls_label ?? (record.calls != null ? String(record.calls) : "—")}
      </td>
      <td className="px-4 py-3 text-[var(--muted-foreground)]">{record.state ?? "—"}</td>
      <td className="px-4 py-3 text-[var(--muted-foreground)]">
        {formatDate(record.applied_on)}
      </td>
    </tr>
  );
}

export default function DriverDatabaseView() {
  const searchParams = useSearchParams();
  const tab = searchParams.get("tab") === "browse" ? "browse" : "search";

  const [company, setCompany] = useState<CompanyCode>("JM");
  const [searchName, setSearchName] = useState("");
  const [searchPhone, setSearchPhone] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [searchSubmitted, setSearchSubmitted] = useState<{
    name: string;
    phone: string;
    email: string;
  } | null>(null);

  const [browseStatus, setBrowseStatus] = useState<DriverLeadStatusKey | "">("");
  const [browseBoard, setBrowseBoard] = useState("");
  const [browsePage, setBrowsePage] = useState(1);
  const [browseLayout, setBrowseLayout] = useState<BrowseLayout>("table");

  useEffect(() => {
    const employee = authStorage.getEmployee();
    if (employee?.company && ["JM", "WF", "BP"].includes(employee.company)) {
      setCompany(employee.company as CompanyCode);
    }
  }, []);

  const searchParamsMemo = useMemo(
    () =>
      searchSubmitted
        ? {
            company,
            name: searchSubmitted.name,
            phone: searchSubmitted.phone,
            email: searchSubmitted.email,
          }
        : null,
    [company, searchSubmitted],
  );

  const {
    data: searchData,
    isLoading: searchLoading,
    isFetching: searchFetching,
    isError: searchError,
    error: searchErr,
    refetch: refetchSearch,
  } = useMyDriverLeadSearch(searchParamsMemo, Boolean(searchSubmitted));

  const {
    data: browseData,
    isLoading: browseLoading,
    isError: browseError,
    error: browseErr,
  } = useMyDriverLeadsBrowse({
    company,
    status: browseStatus,
    board: browseBoard,
    page: browsePage,
    per_page: 50,
  });

  const browseRows = browseData?.data ?? [];
  const browseMeta = browseData?.meta;

  function handleSearch(event: FormEvent) {
    event.preventDefault();
    const name = searchName.trim();
    const phone = searchPhone.trim();
    const email = searchEmail.trim();
    if (!name && !phone && !email) return;

    const next = { name, phone, email };
    const sameQuery =
      searchSubmitted?.name === next.name &&
      searchSubmitted?.phone === next.phone &&
      searchSubmitted?.email === next.email;

    setSearchSubmitted(next);

    // Same fields keep the same query key, so a failed/empty result would
    // otherwise stick. Refetch so Search always tries again on click.
    if (sameQuery) {
      void refetchSearch();
    }
  }

  function clearSearch() {
    setSearchName("");
    setSearchPhone("");
    setSearchEmail("");
    setSearchSubmitted(null);
  }

  const searchErrorMessage =
    searchErr instanceof ApiError
      ? searchErr.message
      : searchError
        ? "Search failed."
        : null;

  const browseErrorMessage =
    browseErr instanceof ApiError
      ? browseErr.message
      : browseError
        ? "Could not load driver leads."
        : null;

  return (
    <div className="flex flex-col gap-7">
      <section className="animate-fade-in">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
          Driver database
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-[var(--foreground)] sm:text-5xl">
          {tab === "browse" ? "Browse leads" : "Search history"}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
          Synced from Monday boards hourly — no live Monday calls. Company:{" "}
          <span className="font-medium text-[var(--foreground)]">{company}</span>
        </p>
      </section>

      {tab === "search" ? (
        <section className="animate-rise rounded-2xl border border-[var(--border)] bg-[linear-gradient(180deg,#eef5fa_0%,#f7fafc_100%)] p-5 shadow-[var(--shadow-soft)] sm:p-6">
          <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--foreground)]">
            Search
          </h2>
          <p className="mt-1 text-sm text-[var(--muted-foreground)]">
            Match by name, phone, and/or email. Fill one or more fields.
          </p>

          <form
            onSubmit={handleSearch}
            className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <InputDefault
              label="Name"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="Driver name"
            />
            <InputDefault
              label="Phone"
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value)}
              placeholder="+1..."
            />
            <InputDefault
              label="Email"
              type="email"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
            />
            <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-1">
              <ButtonDefault type="submit" className="flex-1">
                Search
              </ButtonDefault>
              {searchSubmitted ? (
                <ButtonDefault type="button" variant="ghost" onClick={clearSearch}>
                  Clear
                </ButtonDefault>
              ) : null}
            </div>
          </form>

          <div className="mt-6">
            {!searchSubmitted ? (
              <p className="text-sm text-[var(--muted-foreground)]">
                Enter at least one field and search to see full board history.
              </p>
            ) : searchLoading || searchFetching ? (
              <LoadingDefault label="Searching driver leads" />
            ) : searchErrorMessage ? (
              <p className="text-sm text-[var(--danger)]">{searchErrorMessage}</p>
            ) : searchData?.found === false ? (
              <p className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-8 text-center text-sm text-[var(--muted-foreground)]">
                Nothing found
              </p>
            ) : (
              <div className="space-y-4">
                {(searchData?.data ?? []).map((group) => (
                  <SearchResultGroup
                    key={`${group.name}-${group.phone ?? ""}-${group.email ?? ""}`}
                    group={group}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      ) : (
        <section className="animate-rise space-y-4">
          <div className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[linear-gradient(180deg,#e8f7f3_0%,#f7fafc_100%)] p-5 shadow-[var(--shadow-soft)] lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold text-[var(--foreground)]">
                Browse
              </h2>
              <p className="mt-1 text-sm text-[var(--muted-foreground)]">
                Filter synced leads from the database.
              </p>
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <SelectDefault
                label="Status"
                value={browseStatus}
                onChange={(event) => {
                  setBrowseStatus(event.target.value as DriverLeadStatusKey | "");
                  setBrowsePage(1);
                }}
                wrapperClassName="min-w-44"
                options={STATUS_OPTIONS}
              />
              <InputDefault
                label="Board"
                value={browseBoard}
                onChange={(e) => {
                  setBrowseBoard(e.target.value);
                  setBrowsePage(1);
                }}
                placeholder="Optional board filter"
                wrapperClassName="min-w-48"
              />
              <div className="flex gap-1 rounded-lg bg-[var(--accent-dim)] p-1">
                {(
                  [
                    ["table", "Table"],
                    ["cards", "Cards"],
                  ] as const
                ).map(([layout, label]) => (
                  <button
                    key={layout}
                    type="button"
                    onClick={() => setBrowseLayout(layout)}
                    className={cn(
                      "rounded-md px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] transition-all",
                      browseLayout === layout
                        ? "bg-[var(--accent)] text-white shadow-sm"
                        : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {browseLoading ? (
            <LoadingDefault label="Loading driver leads" />
          ) : browseErrorMessage ? (
            <EmptyStateDefault
              title="Browse unavailable"
              description={browseErrorMessage}
            />
          ) : browseRows.length === 0 ? (
            <EmptyStateDefault
              title="No leads for this filter"
              description="Try another status or clear the board filter."
            />
          ) : browseLayout === "table" ? (
            <>
              <div className="overflow-x-auto rounded-2xl border border-[var(--border)] bg-[var(--surface)]/90 shadow-[var(--shadow-soft)]">
                <table className="w-full min-w-[960px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--accent-dim)]">
                      {[
                        "Name",
                        "Phone",
                        "Email",
                        "Status",
                        "Board",
                        "Owner",
                        "Calls",
                        "State",
                        "Applied",
                      ].map((header) => (
                        <th
                          key={header}
                          className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {browseRows.map((record) => (
                      <BrowseRow key={record.id} record={record} />
                    ))}
                  </tbody>
                </table>
              </div>
              <BrowsePagination
                meta={browseMeta}
                page={browsePage}
                onPageChange={setBrowsePage}
              />
            </>
          ) : (
            <>
              <div className="grid gap-4 lg:grid-cols-2">
                {browseRows.map((record) => (
                  <HistoryCard key={record.id} record={record} />
                ))}
              </div>
              <BrowsePagination
                meta={browseMeta}
                page={browsePage}
                onPageChange={setBrowsePage}
              />
            </>
          )}
        </section>
      )}
    </div>
  );
}

function BrowsePagination({
  meta,
  page,
  onPageChange,
}: {
  meta?: {
    total: number;
    page: number;
    last_page: number;
  };
  page: number;
  onPageChange: (page: number) => void;
}) {
  if (!meta) return null;

  if (meta.last_page > 1) {
    return (
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-[var(--shadow-soft)]">
        <p className="text-sm text-[var(--muted-foreground)]">
          Page {meta.page} of {meta.last_page} · {meta.total.toLocaleString()}{" "}
          total
        </p>
        <div className="flex gap-2">
          <ButtonDefault
            type="button"
            size="sm"
            variant="outline"
            disabled={page <= 1}
            onClick={() => onPageChange(Math.max(1, page - 1))}
          >
            Previous
          </ButtonDefault>
          <ButtonDefault
            type="button"
            size="sm"
            variant="outline"
            disabled={page >= meta.last_page}
            onClick={() => onPageChange(Math.min(meta.last_page, page + 1))}
          >
            Next
          </ButtonDefault>
        </div>
      </div>
    );
  }

  return (
    <p className="text-sm text-[var(--muted-foreground)]">
      {meta.total.toLocaleString()} lead{meta.total === 1 ? "" : "s"}
    </p>
  );
}
