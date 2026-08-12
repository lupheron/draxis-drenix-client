import { apiRequest } from "@/lib/api/client";
import type { ApiEnvelope, EmployeeSession } from "@/lib/types";

export async function employeeLogin(
  username: string,
  password: string,
): Promise<EmployeeSession> {
  const response = await apiRequest<ApiEnvelope<EmployeeSession>>(
    "/employee/login",
    {
      method: "POST",
      body: JSON.stringify({ username, password }),
    },
  );
  return response.data;
}

export async function employeeLogout(): Promise<void> {
  try {
    await apiRequest("/employee/logout", { method: "POST" });
  } catch {
    // Always clear local session even if the API is unreachable.
  }
}
