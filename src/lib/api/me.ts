import { apiRequest } from "@/lib/api/client";
import type {
  ApiEnvelope,
  ClientEmployee,
  ClientLead,
  DailyMetric,
  MeMetricsResponse,
} from "@/lib/types";

export async function fetchMyProfile(): Promise<ClientEmployee> {
  const response = await apiRequest<ApiEnvelope<ClientEmployee>>("/me/profile");
  return response.data;
}

export async function fetchMyMetrics(
  from: string,
  to: string,
): Promise<MeMetricsResponse> {
  const response = await apiRequest<ApiEnvelope<MeMetricsResponse>>(
    `/me/metrics?from=${from}&to=${to}`,
  );
  return response.data;
}

export async function fetchMyDailyMetrics(
  from: string,
  to: string,
): Promise<DailyMetric[]> {
  const response = await apiRequest<ApiEnvelope<DailyMetric[]>>(
    `/me/metrics/daily?from=${from}&to=${to}`,
  );
  return response.data;
}

export async function fetchMyLeads(
  from: string,
  to: string,
): Promise<ClientLead[]> {
  const response = await apiRequest<ApiEnvelope<ClientLead[]>>(
    `/me/leads?from=${from}&to=${to}`,
  );
  return response.data;
}

export async function changeMyPassword(input: {
  current_password: string;
  password: string;
  password_confirmation: string;
}): Promise<void> {
  await apiRequest("/me/password", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
