export type CompanyCode = "JM" | "WF" | "BP";

export type EmployeeShift = "morning" | "afternoon" | "night" | "flexible";

export type DepartmentSlug = "hr" | "safety";

export type PerformancePeriod = "day" | "week" | "month" | "year" | "custom";

/** Client-safe employee profile — no salary, charges, or admin flags. */
export type ClientEmployee = {
  id: number;
  username?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  email?: string | null;
  shift?: EmployeeShift | string | null;
  department?: DepartmentSlug | string | null;
  position?: string | null;
  company?: CompanyCode | string | null;
};

export type EmployeeSession = {
  token: string;
  user_type: "employee";
  employee: ClientEmployee;
};

export type EmployeeMetrics = {
  minutes_on_call: number;
  calls_made: number;
  outbound_calls?: number;
  inbound_calls?: number;
  missed_calls?: number;
  outbound_minutes?: number;
  inbound_minutes?: number;
  messages_total: number;
  messages_inbound: number;
  messages_outbound: number;
  conversations_count?: number;
  leads: number;
  follow_up: number;
  hires: number;
  loaded: number;
  rejected: number;
};

export type DailyMetric = EmployeeMetrics & {
  date: string;
};

export type MeMetricsResponse = EmployeeMetrics & {
  from: string;
  to: string;
};

export type LeadStatus =
  | "new"
  | "follow_up"
  | "hired"
  | "loaded"
  | "rejected"
  | string;

export type ClientLead = {
  id: number | string;
  title?: string | null;
  name?: string | null;
  company_name?: string | null;
  status: LeadStatus;
  follow_up_at?: string | null;
  hired_at?: string | null;
  loaded_at?: string | null;
  rejected_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  notes?: string | null;
};

export type ApiEnvelope<T> = {
  data: T;
  message?: string;
};

export type DriverLeadStatusKey =
  | "rejected"
  | "n_a"
  | "follow_up"
  | "call_back"
  | "hired"
  | "not_valid"
  | "company_driver"
  | "lease_driver"
  | "terminated";

export type DriverLeadRecord = {
  id: number;
  board_name: string;
  group_title: string;
  name: string;
  phone: string | null;
  email: string | null;
  status: string;
  status_key: DriverLeadStatusKey | string;
  board_status?: string | null;
  board_status_key?: string | null;
  status_source?: {
    board_name: string;
    board_id?: string | null;
    status: string;
    status_key: string;
    group_title?: string | null;
  } | null;
  notes: string | null;
  platform: string | null;
  position: string | null;
  state: string | null;
  recruiter: string | null;
  applied_on: string | null;
  contacted_on: string | null;
  columns: Record<string, string | null>;
};

export type DriverLeadSearchGroup = {
  name: string;
  phone: string | null;
  email: string | null;
  application_count: number;
  statuses: string[];
  history: DriverLeadRecord[];
};

export type DriverLeadSearchResponse = {
  found: boolean;
  message: string | null;
  data: DriverLeadSearchGroup[];
};

export type DriverLeadsBrowseMeta = {
  total: number;
  page: number;
  per_page: number;
  last_page: number;
  status: string | null;
  board: string | null;
};

export type DriverLeadsBrowseResponse = {
  data: DriverLeadRecord[];
  meta: DriverLeadsBrowseMeta;
};
