import { cn } from "@/lib/cn";

type SkeletonDefaultProps = {
  className?: string;
};

export default function SkeletonDefault({ className }: SkeletonDefaultProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-lg bg-[var(--border)]/70",
        className,
      )}
    />
  );
}

export function PageSpinner({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--border-strong)] border-t-[var(--accent)]" />
      <p className="text-sm text-[var(--muted)]">{label}</p>
    </div>
  );
}
