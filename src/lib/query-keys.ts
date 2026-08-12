export const queryKeys = {
  profile: ["me", "profile"] as const,
  metrics: (from: string, to: string) => ["me", "metrics", from, to] as const,
  dailyMetrics: (from: string, to: string) =>
    ["me", "metrics", "daily", from, to] as const,
  leads: (from: string, to: string) => ["me", "leads", from, to] as const,
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
