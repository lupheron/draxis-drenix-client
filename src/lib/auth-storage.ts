import type { ClientEmployee, EmployeeSession } from "@/lib/types";

const TOKEN_KEY = "draxis_client_token";
const USER_TYPE_KEY = "draxis_client_user_type";
const EMPLOYEE_KEY = "draxis_client_employee";

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

export const authStorage = {
  getToken(): string | null {
    if (!isBrowser()) return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  getEmployee(): ClientEmployee | null {
    if (!isBrowser()) return null;
    const raw = localStorage.getItem(EMPLOYEE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as ClientEmployee;
    } catch {
      return null;
    }
  },

  setSession(session: EmployeeSession): void {
    if (!isBrowser()) return;
    localStorage.setItem(TOKEN_KEY, session.token);
    localStorage.setItem(USER_TYPE_KEY, "employee");
    localStorage.setItem(EMPLOYEE_KEY, JSON.stringify(session.employee));
  },

  updateEmployee(employee: ClientEmployee): void {
    if (!isBrowser()) return;
    localStorage.setItem(EMPLOYEE_KEY, JSON.stringify(employee));
  },

  clear(): void {
    if (!isBrowser()) return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_TYPE_KEY);
    localStorage.removeItem(EMPLOYEE_KEY);
  },

  isAuthenticated(): boolean {
    return Boolean(this.getToken());
  },

  isHr(): boolean {
    const department = this.getEmployee()?.department?.toLowerCase();
    return department === "hr";
  },

  isSafety(): boolean {
    const department = this.getEmployee()?.department?.toLowerCase();
    return department === "safety";
  },
};
