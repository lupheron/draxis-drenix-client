import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type SelectOption = {
  value: string;
  label: string;
};

type SelectDefaultProps = {
  label?: string;
  hint?: string;
  error?: string;
  options: SelectOption[];
  wrapperClassName?: string;
} & SelectHTMLAttributes<HTMLSelectElement>;

export default function SelectDefault({
  label,
  hint,
  error,
  options,
  wrapperClassName,
  className,
  id,
  ...props
}: SelectDefaultProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className={cn("flex flex-col gap-2", wrapperClassName)}>
      {label ? (
        <label
          htmlFor={selectId}
          className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--muted-foreground)]"
        >
          {label}
        </label>
      ) : null}

      <select
        id={selectId}
        className={cn(
          "h-11 w-full rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--foreground)] outline-none transition-colors focus:border-[var(--accent)] focus:bg-[var(--surface-elevated)]",
          error ? "border-[var(--danger)]" : undefined,
          className,
        )}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {error ? (
        <p className="text-xs text-[var(--danger)]">{error}</p>
      ) : hint ? (
        <p className="text-xs text-[var(--muted)]">{hint}</p>
      ) : null}
    </div>
  );
}
