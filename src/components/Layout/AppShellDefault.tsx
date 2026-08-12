"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type CSSProperties } from "react";
import ButtonDefault from "@/components/Button/ButtonDefault";
import { useLogout } from "@/hooks/useAuth";
import { authStorage } from "@/lib/auth-storage";
import { cn } from "@/lib/cn";
import {
  activeNavItem,
  isSubActive,
  navForEmployee,
  type NavItem,
} from "@/lib/nav";
import type { ClientEmployee } from "@/lib/types";
import { formatPersonName } from "@/utils/formatters";

export default function AppShellDefault({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <AppShellInner>{children}</AppShellInner>
    </Suspense>
  );
}

function AppShellInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString() ? `?${searchParams.toString()}` : "";
  const logout = useLogout();
  const [employee, setEmployee] = useState<ClientEmployee | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    setEmployee(authStorage.getEmployee());
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname, search]);

  const isHr = employee?.department?.toLowerCase() === "hr";
  const nav = navForEmployee(isHr);
  const current = activeNavItem(pathname, isHr) ?? nav[0];

  return (
    <div className="min-h-screen">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-screen w-[16.5rem] flex-col border-r border-[var(--border)] bg-[var(--surface)]/95 shadow-[var(--shadow-soft)] backdrop-blur-xl transition-transform duration-300",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="animate-fade-in border-b border-[var(--border)] px-5 py-5">
          <Link href="/my-day" className="block">
            <p className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-[var(--foreground)]">
              DRAXIS
            </p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
              Client desk
            </p>
          </Link>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
          {nav.map((item, index) => (
            <SideLink
              key={item.id}
              item={item}
              active={current?.id === item.id}
              style={{ animationDelay: `${80 + index * 50}ms` }}
            />
          ))}
        </nav>

        <div className="border-t border-[var(--border)] px-4 py-4">
          <p className="truncate text-sm font-medium text-[var(--foreground)]">
            {formatPersonName(employee?.first_name, employee?.last_name)}
          </p>
          <p className="mt-0.5 text-[11px] uppercase tracking-[0.14em] text-[var(--muted)]">
            {[employee?.company, employee?.department]
              .filter(Boolean)
              .join(" · ") || "Employee"}
          </p>
          <ButtonDefault
            variant="outline"
            size="sm"
            className="mt-3 w-full"
            onClick={() => logout.mutate()}
            disabled={logout.isPending}
          >
            Log out
          </ButtonDefault>
        </div>
      </aside>

      {mobileOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-[var(--foreground)]/25 backdrop-blur-[1px] lg:hidden"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      ) : null}

      <div className="flex min-h-screen min-w-0 flex-col lg:ml-[16.5rem]">
        <header className="sticky top-0 z-20 border-b border-[var(--border)]/80 bg-[var(--surface)]/85 backdrop-blur-md">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] text-[var(--foreground)] transition hover:bg-[var(--accent-dim)] lg:hidden"
              aria-label="Open navigation"
              onClick={() => setMobileOpen(true)}
            >
              ☰
            </button>

            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
                {current?.label}
              </p>
              <div className="mt-2 flex gap-1 overflow-x-auto pb-1">
                {current?.children.map((sub) => {
                  const active = isSubActive(sub.href, pathname, search);
                  return (
                    <Link
                      key={sub.id}
                      href={sub.href}
                      className={cn(
                        "shrink-0 rounded-full px-3.5 py-1.5 text-sm transition-all duration-200",
                        active
                          ? "bg-[var(--accent)] text-white shadow-sm"
                          : "bg-[var(--accent-dim)] text-[var(--muted-foreground)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent-strong)]",
                      )}
                    >
                      {sub.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </header>

        <main className="animate-page-in mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function SideLink({
  item,
  active,
  style,
}: {
  item: NavItem;
  active: boolean;
  style?: CSSProperties;
}) {
  return (
    <Link
      href={item.href}
      style={style}
      className={cn(
        "animate-rise group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
        active
          ? "bg-[var(--accent-soft)] text-[var(--accent-strong)] shadow-sm"
          : "text-[var(--muted-foreground)] hover:bg-[var(--accent-dim)] hover:text-[var(--foreground)]",
      )}
    >
      <span
        className={cn(
          "h-2 w-2 rounded-full transition-transform duration-300",
          active
            ? "scale-125 bg-[var(--accent)]"
            : "bg-[var(--border-strong)] group-hover:bg-[var(--accent)]",
        )}
      />
      {item.label}
    </Link>
  );
}
