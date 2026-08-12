import type { ButtonHTMLAttributes, ReactNode } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "ghost" | "outline" | "danger";
type ButtonSize = "sm" | "md" | "lg";

type ButtonDefaultProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  children: ReactNode;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[var(--accent)] text-white hover:bg-[var(--accent-strong)] border border-transparent shadow-[var(--shadow-soft)]",
  ghost:
    "bg-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--accent-dim)] border border-transparent",
  outline:
    "bg-transparent text-[var(--foreground)] border border-[var(--border-strong)] hover:bg-[var(--accent-dim)]",
  danger:
    "bg-[var(--danger-soft)] text-[var(--danger)] border border-[var(--danger)]/25 hover:bg-[var(--danger)]/15",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-5 text-sm",
  lg: "h-12 px-6 text-sm",
};

export default function ButtonDefault({
  variant = "primary",
  size = "md",
  href,
  children,
  className,
  ...props
}: ButtonDefaultProps) {
  const classes = cn(
    "inline-flex cursor-pointer items-center justify-center rounded-md font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:pointer-events-none disabled:opacity-40",
    variantStyles[variant],
    sizeStyles[size],
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
