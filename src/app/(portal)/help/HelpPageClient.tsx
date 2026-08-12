"use client";

import { useSearchParams } from "next/navigation";

export default function HelpPageClient() {
  const searchParams = useSearchParams();
  const view = searchParams.get("view") ?? "guide";

  return (
    <div className="flex max-w-2xl flex-col gap-6 animate-fade-in">
      <section>
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
          Help
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl tracking-tight text-[var(--foreground)]">
          {view === "boundaries" ? "What stays out" : "How this portal works"}
        </h1>
        <p className="mt-3 text-base leading-7 text-[var(--muted-foreground)]">
          DRAXIS Client is your personal work hub. DRAXIS Admin is the company
          control system.
        </p>
      </section>

      {view !== "boundaries" ? (
        <section className="animate-rise rounded-2xl border border-[var(--border)] bg-[var(--surface)]/90 p-5 shadow-[var(--shadow-soft)]">
          <h2 className="font-[family-name:var(--font-display)] text-2xl">
            Need access?
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted-foreground)]">
            Ask Head HR or Head Safety to issue employee credentials. Use
            Dashboard for your shift and counts, Performance for trends, and My
            Leads if you are HR.
          </p>
        </section>
      ) : (
        <section className="animate-rise rounded-2xl border border-[var(--border)] bg-[var(--surface)]/90 p-5 shadow-[var(--shadow-soft)]">
          <h2 className="font-[family-name:var(--font-display)] text-2xl">
            What you will never see here
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-[var(--muted-foreground)]">
            <li>Message bodies or who you texted</li>
            <li>Call recordings, transcripts, or QA bot findings</li>
            <li>Other people&apos;s salaries, charges, or spy dashboards</li>
            <li>Cameras, Face ID, desk status, or break warnings</li>
            <li>Creating or editing other employees</li>
          </ul>
        </section>
      )}
    </div>
  );
}
