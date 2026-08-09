import type { AnalyticsOverview } from "../types/analytics";
import type { Token, User } from "../types/auth";
import type { Click } from "../types/click";
import type { Link } from "../types/link";

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function parseErrorDetail(response: Response): Promise<string> {
  try {
    const body = await response.json();
    if (typeof body?.detail === "string") return body.detail;
  } catch {
    // response body wasn't JSON, fall through to the generic message
  }
  return `Request failed with status ${response.status}`;
}

export async function registerUser(email: string, password: string): Promise<User> {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) throw new ApiError(response.status, await parseErrorDetail(response));
  return response.json();
}

export async function login(email: string, password: string): Promise<Token> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ username: email, password }),
  });
  if (!response.ok) throw new ApiError(response.status, await parseErrorDetail(response));
  return response.json();
}

export async function fetchCurrentUser(token: string): Promise<User> {
  const response = await fetch("/api/auth/me", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new ApiError(response.status, await parseErrorDetail(response));
  return response.json();
}

export async function fetchLinks(token: string): Promise<Link[]> {
  const response = await fetch("/api/links", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new ApiError(response.status, await parseErrorDetail(response));
  return response.json();
}

export async function createLink(
  token: string,
  targetUrl: string,
  customSlug?: string
): Promise<Link> {
  const response = await fetch("/api/links", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ target_url: targetUrl, custom_slug: customSlug || undefined }),
  });
  if (!response.ok) throw new ApiError(response.status, await parseErrorDetail(response));
  return response.json();
}

export async function fetchLink(token: string, shortCode: string): Promise<Link> {
  const response = await fetch(`/api/links/${shortCode}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new ApiError(response.status, await parseErrorDetail(response));
  return response.json();
}

export async function fetchClicks(token: string, shortCode: string): Promise<Click[]> {
  const response = await fetch(`/api/links/${shortCode}/clicks`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new ApiError(response.status, await parseErrorDetail(response));
  return response.json();
}

export async function fetchAnalyticsOverview(token: string): Promise<AnalyticsOverview> {
  const response = await fetch("/api/analytics/overview", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new ApiError(response.status, await parseErrorDetail(response));
  return response.json();
}
