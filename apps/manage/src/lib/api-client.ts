"use client";
import { getCookie, setCookie, removeCookie } from "typescript-cookie";
import { refreshAccessToken } from "@/actions/auth";

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
  if (!newToken) {
    removeCookie("token", { path: "/" });
    window.location.assign("/auth/login");
    return res;
  }

  const retriedResponse = await fetch(input, requestWithToken(newToken));

  if (retriedResponse.status === 401) {
    removeCookie("token", { path: "/" });
    window.location.assign("/auth/login");
  }

  return retriedResponse;
}
