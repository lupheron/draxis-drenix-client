import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type ChartPanelProps = {
  title: string;
  hint?: string;
  children: ReactNode;
  className?: string;
  heightClassName?: string;
};

export default function ChartPanel({
  title,
  hint,
  children,
  className,
  heightClassName = "h-64",
}: ChartPanelProps) {
  return (
    <section
      className={cn(
        "animate-rise rounded-2xl border border-[var(--border)] bg-[var(--surface)]/90 p-5 shadow-[var(--shadow-soft)] transition-shadow duration-300 hover:shadow-[var(--shadow-lift)]",
        className,
      )}
    >
      <div className="mb-4">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-[var(--muted-foreground)]">
          {title}
        </h2>
        {hint ? (
          <p className="mt-1 text-sm text-[var(--muted)]">{hint}</p>
        ) : null}
      </div>
      <div className={heightClassName}>{children}</div>
    </section>
  );
}
