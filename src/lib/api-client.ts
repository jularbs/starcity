"use client";
import { getCookie, setCookie, removeCookie } from "typescript-cookie";
import { refreshAccessToken } from "@/actions/auth";

// De-dupe concurrent 401s so only one refresh request is made at a time.
let pendingRefresh: Promise<string | null> | null = null;

export async function refreshAccessTokenOnce(): Promise<string | null> {
  if (!pendingRefresh) {
    pendingRefresh = refreshAccessToken()
      .then((data) => {
        setCookie("token", data.token, { expires: 7, path: "/" });
        return data.token as string;
      })
      .catch(() => {
        removeCookie("token", { path: "/" });
        return null;
      })
      .finally(() => {
        pendingRefresh = null;
      });
  }
  return pendingRefresh;
}

// Authenticated fetch that transparently refreshes an expired access token
// and retries the request once before giving up.
export async function apiFetch(input: string | URL, init: RequestInit = {}): Promise<Response> {
  const requestWithToken = (token: string | undefined) => ({
    ...init,
    credentials: "include" as RequestCredentials,
    headers: {
      ...init.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  const res = await fetch(input, requestWithToken(getCookie("token")));

  if (res.status !== 401) return res;

  const newToken = await refreshAccessTokenOnce();
  if (!newToken) return res;

  return fetch(input, requestWithToken(newToken));
}
