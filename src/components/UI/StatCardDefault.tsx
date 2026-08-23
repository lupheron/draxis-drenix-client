import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";

type StatCardDefaultProps = {
  label: string;
  value: ReactNode;
  hint?: string;
  className?: string;
  style?: CSSProperties;
  accent?: "teal" | "green" | "red" | "blue" | "orange" | "gold";
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
  green: {
    shell: "bg-[linear-gradient(145deg,#d8f3e5_0%,#f7fafc_55%)] border-[#8dceb0]",
    label: "text-[#15803d]",
    bar: "bg-[#15803d]",
  },
  red: {
    shell: "bg-[linear-gradient(145deg,#fde2e4_0%,#f7fafc_55%)] border-[#e7a0a6]",
    label: "text-[#c1121f]",
    bar: "bg-[#c1121f]",
  },
  blue: {
    shell: "bg-[linear-gradient(145deg,#dbe7fb_0%,#f7fafc_55%)] border-[#93b4f0]",
    label: "text-[#1d4ed8]",
    bar: "bg-[#1d4ed8]",
  },
  orange: {
    shell: "bg-[linear-gradient(145deg,#fde7d6_0%,#f7fafc_55%)] border-[#f0b27a]",
    label: "text-[#ea580c]",
    bar: "bg-[#ea580c]",
  },
  gold: {
    shell: "bg-[linear-gradient(145deg,#f8ecc4_0%,#f7fafc_55%)] border-[#e0c36a]",
    label: "text-[#ca8a04]",
    bar: "bg-[#ca8a04]",
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
