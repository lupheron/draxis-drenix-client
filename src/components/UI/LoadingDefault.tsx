"use client";

import { cn } from "@/lib/cn";

type LoadingDefaultProps = {
  label?: string;
  variant?: "page" | "section" | "inline";
  className?: string;
};

export default function LoadingDefault({
  label = "Loading",
  variant = "section",
  className,
}: LoadingDefaultProps) {
  const size =
    variant === "inline"
      ? "h-5 w-5 border-2"
      : variant === "page"
        ? "h-10 w-10 border-[3px]"
        : "h-8 w-8 border-[3px]";

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        variant === "page" && "min-h-[50vh]",
        variant === "section" &&
          "min-h-[220px] rounded-2xl border border-[var(--border)] bg-[var(--surface)]/80 shadow-[var(--shadow-soft)]",
        variant === "inline" && "min-h-0 flex-row gap-2",
        className,
      )}
    >
      <div
        className={cn(
          "animate-spin rounded-full border-[var(--border-strong)] border-t-[var(--accent)]",
          size,
        )}
      />
      <p
        className={cn(
          "text-[var(--muted-foreground)]",
          variant === "inline" ? "text-xs" : "text-sm",
        )}
      >
        {label}
      </p>
    </div>
  );
}

export function PageSpinner({ label = "Loading" }: { label?: string }) {
  return <LoadingDefault variant="page" label={label} />;
}
