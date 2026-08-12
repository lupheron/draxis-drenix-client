import { cn } from "@/lib/cn";

type EmptyStateDefaultProps = {
  title: string;
  description: string;
  className?: string;
};

export default function EmptyStateDefault({
  title,
  description,
  className,
}: EmptyStateDefaultProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--surface)]/60 px-6 py-12 text-center",
        className,
      )}
    >
      <h3 className="font-[family-name:var(--font-display)] text-2xl text-[var(--foreground)]">
        {title}
      </h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--muted-foreground)]">
        {description}
      </p>
    </div>
  );
}
