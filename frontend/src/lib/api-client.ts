import createClient from "openapi-fetch";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

// This client is typed via the generated schema.
// Run `npm run generate-client` to regenerate after backend changes.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const apiClient = createClient<any>({
  baseUrl: API_BASE_URL,
  credentials: "include", // send HTTP-only cookies automatically
});

// Typed API helpers

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  full_name?: string;
}

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserResponse {
  id: string;
  email: string;
  full_name: string | null;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string;
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message = (body as { detail?: string }).detail ?? response.statusText;
    throw new Error(message);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

export const authApi = {
  login: (data: LoginRequest) =>
    fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    }).then((r) => handleResponse<TokenPair>(r)),

  register: (data: RegisterRequest) =>
    fetch(`${API_BASE_URL}/api/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    }).then((r) => handleResponse<UserResponse>(r)),

  logout: () =>
    fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
      method: "POST",
      credentials: "include",
    }).then((r) => handleResponse<void>(r)),

  me: () =>
    fetch(`${API_BASE_URL}/api/v1/users/me`, {
      credentials: "include",
    }).then((r) => handleResponse<UserResponse>(r)),
};
