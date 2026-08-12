import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

type StatCardDefaultProps = {
  label: string;
  value: ReactNode;
  hint?: string;
  className?: string;
  style?: CSSProperties;
  accent?: "teal" | "slate" | "sand" | "green";
};

const accents: Record<
  NonNullable<StatCardDefaultProps["accent"]>,
  { shell: string; label: string; bar: string }
> = {
  teal: {
    shell: "bg-[linear-gradient(145deg,#d5f0eb_0%,#f7fafc_55%)] border-[#9fd4cb]",
    label: "text-[var(--accent-strong)]",
    bar: "bg-[var(--accent)]",
  },
  slate: {
    shell: "bg-[linear-gradient(145deg,#d7e7f2_0%,#f7fafc_55%)] border-[#9dbcd4]",
    label: "text-[var(--ink-blue)]",
    bar: "bg-[var(--ink-blue)]",
  },
  sand: {
    shell: "bg-[linear-gradient(145deg,#f5e8c7_0%,#f7fafc_55%)] border-[#ddc58a]",
    label: "text-[var(--amber)]",
    bar: "bg-[var(--amber)]",
  },
  green: {
    shell: "bg-[linear-gradient(145deg,#d8f3e5_0%,#f7fafc_55%)] border-[#8dceb0]",
    label: "text-[var(--success)]",
    bar: "bg-[var(--success)]",
  },
};

export default function StatCardDefault({
  label,
  value,
  hint,
  className,
  style,
  accent = "teal",
}: StatCardDefaultProps) {
  const tone = accents[accent];

  return (
    <div
      style={style}
      className={cn(
        "group relative animate-rise overflow-hidden rounded-2xl border p-5 shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]",
        tone.shell,
        className,
      )}
    >
      <span
        className={cn(
          "absolute left-0 top-0 h-full w-1.5 rounded-l-2xl",
          tone.bar,
        )}
      />
      <div className="relative pl-1">
        <p
          className={cn(
            "text-[11px] font-semibold uppercase tracking-[0.16em]",
            tone.label,
          )}
        >
          {label}
        </p>
        <p className="mt-3 font-[family-name:var(--font-display)] text-3xl font-semibold tracking-tight text-[var(--foreground)] sm:text-4xl">
          {value}
        </p>
        {hint ? (
          <p className="mt-2 text-sm text-[var(--muted-foreground)]">{hint}</p>
        ) : null}
      </div>
    </div>
  );
}
