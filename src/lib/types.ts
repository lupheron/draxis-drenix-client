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
  board_owner?: string | null;
  owner?: string | null;
  moved_to?: string | null;
  calls?: number | null;
  calls_label?: string | null;
  got_cdl?: string | null;
  placement?: "current" | "previous" | "process" | string;
  applied_on: string | null;
  contacted_on: string | null;
  extra_columns?: Record<string, string | null>;
  columns?: Record<string, string | null>;
};

export type DriverLeadOwnershipStep = {
  owner: string;
  role: "first" | "current" | "desk" | string;
};

export type DriverLeadSearchGroup = {
  name: string;
  phone: string | null;
  email: string | null;
  application_count: number;
  statuses: string[];
  current_owner?: string | null;
  origin_owner?: string | null;
  ownership?: DriverLeadOwnershipStep[];
  calls?: number | null;
  calls_label?: string | null;
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

export type AttendanceStatus =
  | "present"
  | "late"
  | "no_show"
  | "break"
  | "missing_punch"
  | "excused"
  | "pending_review"
  | null;

export type AttendanceEventType =
  | "check_in"
  | "check_out"
  | "break"
  | string;

export type AttendanceEvent = {
  id: number;
  type: AttendanceEventType;
  event_kind?: "check_in" | "check_out" | "break" | "other" | string;
  action?: string | null;
  occurred_at: string;
  shift?: string | null;
  late_minutes?: number | null;
  sheet_note?: string | null;
  source?: string | null;
};

export type AttendanceDay = {
  id: number;
  date: string;
  status: AttendanceStatus | string;
  check_in_at: string | null;
  check_out_at: string | null;
  break_at?: string | null;
  late_minutes: number;
  shift_start?: string | null;
  shift_end?: string | null;
  /** Sheet Shift Time window (e.g. 08:00 - 17:00 CT). */
  shift?: string | null;
  sheet_note?: string | null;
  admin_note?: string | null;
  is_manual_override?: boolean;
  events?: AttendanceEvent[];
};

export type AttendanceSummary = {
  from: string;
  to: string;
  timezone: string;
  today: {
    date: string;
    status: AttendanceStatus | string;
    check_in_at: string | null;
    check_out_at: string | null;
    late_minutes: number;
    notes: string | null;
  };
  period: {
    present_days: number;
    late_days: number;
    no_show_days: number;
    excused_days: number;
    break_days: number;
    pending_requests: number;
  };
};

export type AttendanceRequestType = "dispute" | "absence";

export type AttendanceRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "resolved";

export type AttendanceRequest = {
  id: number;
  type: AttendanceRequestType | string;
  status: AttendanceRequestStatus | string;
  date: string;
  message: string;
  admin_comment?: string | null;
  created_at?: string | null;
  resolved_at?: string | null;
  related_day_id?: number | null;
};

export type CreateAttendanceRequestInput = {
  type: AttendanceRequestType;
  date: string;
  message: string;
  related_day_id?: number;
};
