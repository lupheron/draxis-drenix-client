import { cn } from "@/lib/cn";
import LoadingDefault from "@/components/UI/LoadingDefault";

type SkeletonDefaultProps = {
  className?: string;
};

/** Thin shimmer block — prefer LoadingDefault for fetch states. */
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
  return <LoadingDefault variant="page" label={label} />;
}
