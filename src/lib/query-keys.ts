export const queryKeys = {
  profile: ["me", "profile"] as const,
  metrics: (from: string, to: string) => ["me", "metrics", from, to] as const,
  dailyMetrics: (from: string, to: string) =>
    ["me", "metrics", "daily", from, to] as const,
  attendanceSummary: (from: string, to: string) =>
    ["me", "attendance", "summary", from, to] as const,
  attendanceDays: (from: string, to: string) =>
    ["me", "attendance", "days", from, to] as const,
  attendanceDay: (date: string) =>
    ["me", "attendance", "day", date] as const,
  attendanceRequests: ["me", "attendance", "requests"] as const,
  driverLeadsSearch: (
    company: string,
    params: { name?: string; phone?: string; email?: string } | null,
  ) => ["me", "driver-leads", "search", company, params] as const,
  driverLeadsBrowse: (params: {
    company: string;
    status?: string;
    board?: string;
    page?: number;
    per_page?: number;
  }) => ["me", "driver-leads", "browse", params] as const,
};
