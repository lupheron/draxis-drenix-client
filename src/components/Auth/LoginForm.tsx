"use client";

import { FormEvent, useState } from "react";
import ButtonDefault from "@/components/Button/ButtonDefault";
import InputDefault from "@/components/FormItems/Input/InputDefault";
import { useLogin } from "@/hooks/useAuth";
import { ApiError, isApiConfigured } from "@/lib/api/client";

export default function LoginForm() {
  const login = useLogin();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const errorMessage =
    login.error instanceof ApiError
      ? login.error.message
      : login.error
        ? "Unable to sign in. Check your credentials or ask Head HR for access."
        : null;

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    login.mutate({ username: username.trim(), password });
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-5">
      <InputDefault
        label="Username"
        name="username"
        autoComplete="username"
        value={username}
        onChange={(event) => setUsername(event.target.value)}
        placeholder="Issued by Head HR / Head Safety"
        required
      />
      <InputDefault
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        placeholder="Your portal password"
        required
      />

      {errorMessage ? (
        <p className="rounded-md border border-[var(--danger)]/25 bg-[var(--danger-soft)] px-3 py-2 text-sm text-[var(--danger)]">
          {errorMessage}
        </p>
      ) : null}

      {!isApiConfigured() ? (
        <p className="text-xs text-[var(--muted)]">
          Set <code className="font-mono">NEXT_PUBLIC_API_URL</code> to your
          Laravel API before signing in.
        </p>
      ) : null}

      <ButtonDefault
        type="submit"
        size="lg"
        className="w-full"
        disabled={login.isPending || !username || !password}
      >
        {login.isPending ? "Signing in…" : "Enter workspace"}
      </ButtonDefault>
    </form>
  );
}
