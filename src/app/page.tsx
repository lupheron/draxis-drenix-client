"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import LoginForm from "@/components/Auth/LoginForm";
import { authStorage } from "@/lib/auth-storage";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [passwordUpdated, setPasswordUpdated] = useState(false);

  useEffect(() => {
    if (searchParams.get("passwordUpdated") === "1") {
      setPasswordUpdated(true);
    }
    if (authStorage.isAuthenticated()) {
      router.replace("/my-day");
    }
  }, [router, searchParams]);

  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 top-16 h-72 w-72 rounded-full bg-[var(--atmosphere-c)] blur-3xl" />
        <div className="absolute -right-16 bottom-10 h-80 w-80 rounded-full bg-[var(--atmosphere-a)] blur-3xl" />
      </div>

      <div className="relative grid w-full max-w-5xl overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface)]/80 shadow-[var(--shadow-lift)] backdrop-blur-sm lg:grid-cols-[1.15fr_0.85fr]">
        <section className="animate-fade-in flex flex-col justify-between gap-10 border-b border-[var(--border)] bg-[linear-gradient(160deg,rgba(228,242,239,0.9),rgba(255,255,255,0.55)_45%,rgba(231,238,244,0.85))] p-8 sm:p-12 lg:border-b-0 lg:border-r">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
              Employee workspace
            </p>
            <h1 className="mt-4 font-[family-name:var(--font-display)] text-5xl leading-none tracking-tight text-[var(--foreground)] sm:text-6xl">
              DRAXIS
            </h1>
            <p className="mt-5 max-w-md text-base leading-7 text-[var(--muted-foreground)]">
              Your desk in the light — tasks, metrics, and leads that belong to
              you. Not the control room.
            </p>
          </div>
          <p className="text-sm text-[var(--muted)]">
            Credentials are issued by Head HR / Head Safety. Admin tools stay in
            the separate DRAXIS Admin app.
          </p>
        </section>

        <section className="animate-rise flex flex-col justify-center p-8 sm:p-10">
          <h2 className="font-[family-name:var(--font-display)] text-3xl text-[var(--foreground)]">
            Sign in
          </h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Use your employee portal username and password.
          </p>
          {passwordUpdated ? (
            <p className="mt-4 rounded-md border border-[var(--success)]/25 bg-[var(--success-soft)] px-3 py-2 text-sm text-[var(--success)]">
              Password updated. Sign in with your new password.
            </p>
          ) : null}
          <div className="mt-8">
            <LoginForm />
          </div>
        </section>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <LoginPageContent />
    </Suspense>
  );
}
