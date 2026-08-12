import type { InputHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/cn";

type InputDefaultProps = {
  label?: string;
  hint?: string;
  error?: string;
  wrapperClassName?: string;
  leftSlot?: ReactNode;
  rightSlot?: ReactNode;
} & InputHTMLAttributes<HTMLInputElement>;

export default function InputDefault({
  label,
  hint,
  error,
  wrapperClassName,
  leftSlot,
  rightSlot,
  className,
  id,
  ...props
}: InputDefaultProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={cn("flex flex-col gap-2", wrapperClassName)}>
      {label ? (
        <label
          htmlFor={inputId}
          className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted-foreground)]"
        >
          {label}
        </label>
      ) : null}

      <div className="relative">
        {leftSlot ? (
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">
            {leftSlot}
          </div>
        ) : null}

        <input
          id={inputId}
          className={cn(
            "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:bg-[var(--surface-elevated)]",
            leftSlot ? "pl-10" : undefined,
            rightSlot ? "pr-10" : undefined,
            error ? "border-[var(--danger)]" : undefined,
            className,
          )}
          {...props}
        />

        {rightSlot ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">
            {rightSlot}
          </div>
        ) : null}
      </div>

      {error ? (
        <p className="text-xs text-[var(--danger)]">{error}</p>
      ) : hint ? (
        <p className="text-xs text-[var(--muted)]">{hint}</p>
      ) : null}
    </div>
  );
}
