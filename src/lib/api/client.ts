import { authStorage } from "@/lib/auth-storage";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ??
  "http://127.0.0.1:8000/api";

type ApiErrorBody = {
  message?: string;
  errors?: Record<string, string[]>;
};

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(
    status: number,
    message: string,
    errors?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = authStorage.getToken();

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    let body: ApiErrorBody = {};
    try {
      body = (await response.json()) as ApiErrorBody;
    } catch {
      body = {};
    }

    if (response.status === 401 && typeof window !== "undefined") {
      authStorage.clear();
    }

    throw new ApiError(
      response.status,
      firstErrorMessage(body) ??
        body.message ??
        `Request failed with status ${response.status}`,
      body.errors,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export function isApiConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_API_URL);
}

function firstErrorMessage(body: ApiErrorBody): string | undefined {
  if (!body.errors) return undefined;
  for (const messages of Object.values(body.errors)) {
    if (messages?.[0]) return messages[0];
  }
  return undefined;
}

export { API_BASE_URL };
