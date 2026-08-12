"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { employeeLogin, employeeLogout } from "@/lib/api/auth";
import {
  changeMyPassword,
  fetchMyDailyMetrics,
  fetchMyLeads,
  fetchMyMetrics,
  fetchMyProfile,
} from "@/lib/api/me";
import { authStorage } from "@/lib/auth-storage";
import { queryKeys } from "@/lib/query-keys";

export function useLogin() {
  const router = useRouter();

  return useMutation({
    mutationFn: ({
      username,
      password,
    }: {
      username: string;
      password: string;
    }) => employeeLogin(username, password),
    onSuccess: (session) => {
      authStorage.setSession(session);
      router.replace("/my-day");
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: employeeLogout,
    onSettled: () => {
      authStorage.clear();
      queryClient.clear();
      router.replace("/");
    },
  });
}

export function useMyProfile() {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: fetchMyProfile,
    enabled: authStorage.isAuthenticated(),
  });
}

export function useMyMetrics(from: string, to: string) {
  return useQuery({
    queryKey: queryKeys.metrics(from, to),
    queryFn: () => fetchMyMetrics(from, to),
    enabled: authStorage.isAuthenticated() && Boolean(from && to),
  });
}

export function useMyDailyMetrics(from: string, to: string) {
  return useQuery({
    queryKey: queryKeys.dailyMetrics(from, to),
    queryFn: () => fetchMyDailyMetrics(from, to),
    enabled: authStorage.isAuthenticated() && Boolean(from && to),
  });
}

export function useMyLeads(from: string, to: string) {
  return useQuery({
    queryKey: queryKeys.leads(from, to),
    queryFn: () => fetchMyLeads(from, to),
    enabled: authStorage.isAuthenticated() && authStorage.isHr() && Boolean(from && to),
  });
}

export function useChangePassword() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: changeMyPassword,
    onSuccess: () => {
      // Laravel revokes all employee tokens on password change.
      authStorage.clear();
      queryClient.clear();
      router.replace("/?passwordUpdated=1");
    },
  });
}
