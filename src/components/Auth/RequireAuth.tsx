"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingDefault from "@/components/UI/LoadingDefault";
import { authStorage } from "@/lib/auth-storage";

type RequireAuthProps = {
  children: React.ReactNode;
  /** When set, only that department may continue. */
  department?: "hr" | "safety";
};

export default function RequireAuth({
  children,
  department,
}: RequireAuthProps) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!authStorage.isAuthenticated()) {
      router.replace("/");
      return;
    }

    if (department === "hr" && !authStorage.isHr()) {
      router.replace("/my-day");
      return;
    }

    if (department === "safety" && !authStorage.isSafety()) {
      router.replace("/my-day");
      return;
    }

    setReady(true);
  }, [department, router]);

  if (!ready) {
    return <LoadingDefault variant="page" label="Opening your workspace" />;
  }

  return <>{children}</>;
}
