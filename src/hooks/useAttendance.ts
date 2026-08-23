"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createMyAttendanceRequest,
  fetchMyAttendanceDay,
  fetchMyAttendanceDays,
  fetchMyAttendanceRequests,
  fetchMyAttendanceSummary,
} from "@/lib/api/attendance";
import { authStorage } from "@/lib/auth-storage";
import { queryKeys } from "@/lib/query-keys";
import type { CreateAttendanceRequestInput } from "@/lib/types";

export function useMyAttendanceSummary(from: string, to: string) {
  return useQuery({
    queryKey: queryKeys.attendanceSummary(from, to),
    queryFn: () => fetchMyAttendanceSummary(from, to),
    enabled: authStorage.isAuthenticated() && Boolean(from && to),
  });
}

export function useMyAttendanceDays(from: string, to: string) {
  return useQuery({
    queryKey: queryKeys.attendanceDays(from, to),
    queryFn: () => fetchMyAttendanceDays(from, to),
    enabled: authStorage.isAuthenticated() && Boolean(from && to),
  });
}

export function useMyAttendanceDay(date: string | null) {
  return useQuery({
    queryKey: queryKeys.attendanceDay(date ?? ""),
    queryFn: () => fetchMyAttendanceDay(date!),
    enabled: authStorage.isAuthenticated() && Boolean(date),
  });
}

export function useMyAttendanceRequests() {
  return useQuery({
    queryKey: queryKeys.attendanceRequests,
    queryFn: fetchMyAttendanceRequests,
    enabled: authStorage.isAuthenticated(),
  });
}

export function useCreateAttendanceRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateAttendanceRequestInput) =>
      createMyAttendanceRequest(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.attendanceRequests,
      });
      void queryClient.invalidateQueries({
        queryKey: ["me", "attendance", "summary"],
      });
    },
  });
}
