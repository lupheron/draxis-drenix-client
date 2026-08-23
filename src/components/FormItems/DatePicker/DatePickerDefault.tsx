"use client";

import { useEffect, useId, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import { format, parse, isValid } from "date-fns";
import { cn } from "@/lib/cn";
import "react-day-picker/style.css";

type DatePickerDefaultProps = {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  id?: string;
};

function parseIso(value: string): Date | undefined {
  if (!value) return undefined;
  const parsed = parse(value, "yyyy-MM-dd", new Date());
  return isValid(parsed) ? parsed : undefined;
}

function toIso(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export default function DatePickerDefault({
  label,
  value,
  onChange,
  min,
  max,
  id,
}: DatePickerDefaultProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const selected = parseIso(value);
  const minDate = parseIso(min ?? "");
  const maxDate = parseIso(max ?? "");

  useEffect(() => {
    if (!open) return;

    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative flex flex-col gap-2">
      {label ? (
        <label
          htmlFor={inputId}
          className="text-xs font-medium uppercase tracking-[0.16em] text-[var(--muted-foreground)]"
        >
          {label}
        </label>
      ) : null}

      <button
        id={inputId}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className={cn(
          "flex h-11 w-full cursor-pointer items-center justify-between rounded-md border border-[var(--border)] bg-[var(--surface)] px-3 text-left text-sm outline-none transition-colors",
          "hover:border-[var(--border-strong)] focus:border-[var(--accent)]",
        )}
      >
        <span className={selected ? "text-[var(--foreground)]" : "text-[var(--muted)]"}>
          {selected ? format(selected, "MMM d, yyyy") : "Select date"}
        </span>
        <span className="text-[10px] uppercase tracking-[0.18em] text-[var(--muted)]">
          Date
        </span>
      </button>

      {open ? (
        <div
          role="dialog"
          aria-label={label ?? "Choose date"}
          className="absolute top-[calc(100%+0.5rem)] z-40 rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 shadow-[var(--shadow-lift)]"
        >
          <DayPicker
            mode="single"
            selected={selected}
            onSelect={(date) => {
              if (!date) return;
              onChange(toIso(date));
              setOpen(false);
            }}
            disabled={[
              ...(minDate ? [{ before: minDate }] : []),
              ...(maxDate ? [{ after: maxDate }] : []),
            ]}
          />
        </div>
      ) : null}
    </div>
  );
}
