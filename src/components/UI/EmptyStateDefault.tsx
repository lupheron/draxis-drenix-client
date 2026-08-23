type EmptyStateDefaultProps = {
  title: string;
  description: string;
};

export default function EmptyStateDefault({
  title,
  description,
}: EmptyStateDefaultProps) {
  return (
    <div className="rounded-xl border border-dashed border-[var(--border-strong)] bg-[var(--surface)]/60 px-6 py-12 text-center">
      <h3 className="font-[family-name:var(--font-display)] text-2xl text-[var(--foreground)]">
        {title}
      </h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[var(--muted-foreground)]">
        {description}
      </p>
    </div>
  );
}
