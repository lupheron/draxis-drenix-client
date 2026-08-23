import { apiRequest } from "@/lib/api/client";
import type {
  ApiEnvelope,
  AttendanceDay,
  AttendanceRequest,
  AttendanceSummary,
  CreateAttendanceRequestInput,
} from "@/lib/types";

export async function fetchMyAttendanceSummary(
  from: string,
  to: string,
): Promise<AttendanceSummary> {
  const response = await apiRequest<ApiEnvelope<AttendanceSummary>>(
    `/me/attendance/summary?from=${from}&to=${to}`,
  );
  return response.data;
}

export async function fetchMyAttendanceDays(
  from: string,
  to: string,
): Promise<AttendanceDay[]> {
  const response = await apiRequest<ApiEnvelope<AttendanceDay[]>>(
    `/me/attendance/days?from=${from}&to=${to}`,
  );
  return response.data;
}

export async function fetchMyAttendanceDay(
  date: string,
): Promise<AttendanceDay> {
  const response = await apiRequest<ApiEnvelope<AttendanceDay>>(
    `/me/attendance/days/${date}`,
  );
  return response.data;
}

export async function fetchMyAttendanceRequests(): Promise<
  AttendanceRequest[]
> {
  const response = await apiRequest<ApiEnvelope<AttendanceRequest[]>>(
    "/me/attendance/requests",
  );
  return response.data;
}

export async function createMyAttendanceRequest(
  input: CreateAttendanceRequestInput,
): Promise<AttendanceRequest> {
  const response = await apiRequest<ApiEnvelope<AttendanceRequest>>(
    "/me/attendance/requests",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return response.data;
}
