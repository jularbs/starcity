//TODOS: Create logic for parsing params
import { apiFetch } from "@/lib/api-client";

export const fetcher = async ({
  url,
  params,
  cache = { revalidate: 0 },
}: {
  url: string;
  params?: Record<string, string>;
  cache?: Record<string, number | string>;
}) => {
  const baseURL = new URL(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/${url}`);
  const searchParams: URLSearchParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== "") searchParams.append(key, value);
    });
    baseURL.search = searchParams.toString();
  }
  const res = await fetch(baseURL.toString(), {
    next: cache,
  });

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    return undefined;
  }

  return res.json();
  // return res.json();
};

export const fetcherWithToken = async ({
  url,
  params,
  cache = { revalidate: 0 },
}: {
  url: string;
  token?: string;
  params?: Record<string, string>;
  cache?: Record<string, number | string>;
}) => {
  const baseURL = new URL(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/${url}`);
  const searchParams: URLSearchParams = new URLSearchParams();

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== "") searchParams.append(key, value);
    });
    baseURL.search = searchParams.toString();
  }

  const res = await apiFetch(baseURL.toString(), {
    next: cache,
  });

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    return undefined;
  }

  return res.json();
};
