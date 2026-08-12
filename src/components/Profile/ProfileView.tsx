"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ButtonDefault from "@/components/Button/ButtonDefault";
import InputDefault from "@/components/FormItems/Input/InputDefault";
import EmptyStateDefault from "@/components/UI/EmptyStateDefault";
import SkeletonDefault from "@/components/UI/SkeletonDefault";
import { useChangePassword, useMyProfile } from "@/hooks/useAuth";
import { ApiError } from "@/lib/api/client";
import { authStorage } from "@/lib/auth-storage";
import type { ClientEmployee } from "@/lib/types";
import { formatPersonName, formatShift } from "@/utils/formatters";

export default function ProfileView() {
  const searchParams = useSearchParams();
  const view = searchParams.get("view") ?? "details";
  const profileQuery = useMyProfile();
  const changePassword = useChangePassword();
  const [cached, setCached] = useState<ClientEmployee | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");

  useEffect(() => {
    setCached(authStorage.getEmployee());
  }, []);

  useEffect(() => {
    if (profileQuery.data) {
      authStorage.updateEmployee(profileQuery.data);
      setCached(profileQuery.data);
    }
  }, [profileQuery.data]);

  const employee = profileQuery.data ?? cached;
  const profileError =
    profileQuery.error instanceof ApiError
      ? profileQuery.error.message
      : profileQuery.isError
        ? "Could not refresh profile from the API."
        : null;

  function onSubmitPassword(event: FormEvent) {
    event.preventDefault();
    changePassword.mutate({
      current_password: currentPassword,
      password,
      password_confirmation: confirmation,
    });
  }

  const passwordError =
    changePassword.error instanceof ApiError
      ? changePassword.error.message
      : changePassword.isError
        ? "Password change failed."
        : null;

  return (
    <div className="flex flex-col gap-7">
      <section className="animate-fade-in">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[var(--muted)]">
          Profile
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-4xl tracking-tight text-[var(--foreground)] sm:text-5xl">
          {view === "security"
            ? "Security"
            : formatPersonName(employee?.first_name, employee?.last_name)}
        </h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-[var(--muted-foreground)]">
          {view === "security"
            ? "Update your portal password. Salary and admin flags are not editable here."
            : "Your contact details and shift. Salary, charges, and admin flags stay out of this portal."}
        </p>
      </section>

      {view !== "security" ? (
        <>
          {profileQuery.isLoading && !employee ? (
            <SkeletonDefault className="skeleton-shimmer h-48 rounded-2xl" />
          ) : employee ? (
            <section className="animate-rise grid gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)]/90 p-5 shadow-[var(--shadow-soft)] sm:grid-cols-2">
              <Field
                label="Name"
                value={formatPersonName(
                  employee.first_name,
                  employee.last_name,
                )}
              />
              <Field label="Username" value={employee.username ?? "—"} />
              <Field label="Email" value={employee.email ?? "—"} />
              <Field label="Phone" value={employee.phone ?? "—"} />
              <Field label="Company" value={employee.company ?? "—"} />
              <Field label="Department" value={employee.department ?? "—"} />
              <Field label="Position" value={employee.position ?? "—"} />
              <Field label="Shift" value={formatShift(employee.shift)} />
            </section>
          ) : (
            <EmptyStateDefault
              title="Profile missing"
              description="Sign in again to refresh your session profile."
            />
          )}

          {profileError ? (
            <p className="text-sm text-[var(--muted)]">
              Using cached session profile. {profileError}
            </p>
          ) : null}
        </>
      ) : (
        <section className="animate-rise max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--surface)]/90 p-5 shadow-[var(--shadow-soft)]">
          <h2 className="font-[family-name:var(--font-display)] text-2xl text-[var(--foreground)]">
            Change password
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            After a successful change you will be signed out and must log in
            again.
          </p>
          <form onSubmit={onSubmitPassword} className="mt-5 flex flex-col gap-4">
            <InputDefault
              label="Current password"
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              required
            />
            <InputDefault
              label="New password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              hint="At least 8 characters"
              required
            />
            <InputDefault
              label="Confirm new password"
              type="password"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              required
            />
            {passwordError ? (
              <p className="text-sm text-[var(--danger)]">{passwordError}</p>
            ) : null}
            {password && confirmation && password !== confirmation ? (
              <p className="text-sm text-[var(--danger)]">
                New password and confirmation do not match.
              </p>
            ) : null}
            <ButtonDefault
              type="submit"
              disabled={
                changePassword.isPending ||
                !currentPassword ||
                !password ||
                password !== confirmation
              }
            >
              {changePassword.isPending ? "Saving…" : "Update password"}
            </ButtonDefault>
          </form>
        </section>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="animate-rise">
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-1 text-[var(--foreground)]">{value}</p>
    </div>
  );
}
