export type AuthMode = "signup" | "signin";

export interface AuthUser {
  id: number;
  email: string;
  username: string;
  fullName: string;
  university: string;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
  location?: string;
  website?: string;
}

async function request<T>(url: string, options: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });
  } catch {
    throw new Error("Cannot reach auth server. Start the app with `npm run dev`.");
  }

  const rawBody = await response.text();
  let data: any = null;
  if (rawBody) {
    try {
      data = JSON.parse(rawBody);
    } catch {
      if (!response.ok) {
        throw new Error("Auth server returned an invalid response.");
      }
      throw new Error("Unexpected server response.");
    }
  }

  if (!response.ok) {
    throw new Error(data?.error || "Request failed.");
  }

  if (!data) {
    throw new Error("Auth server returned an empty response.");
  }

  return data as T;
}

export async function requestOtp(payload: {
  mode: AuthMode;
  email: string;
  fullName?: string;
  username?: string;
}) {
  return request<{ message: string; deliveredByEmail?: boolean; devOtp?: string }>(
    "/api/auth/request-otp",
    {
    method: "POST",
    body: JSON.stringify(payload),
    }
  );
}

export async function verifyOtp(payload: {
  mode: AuthMode;
  email: string;
  otp: string;
}) {
  return request<{ user: AuthUser }>("/api/auth/verify-otp", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
