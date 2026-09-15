import { apiFetch } from "@/lib/api-client";

export const createPromo = async ({ data }: { data: FormData; token?: string }) => {
  const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/promo`, {
    method: "POST",
    body: data,
  });

  if (!res.ok) {
    throw await res.json();
  }

  return res.json();
};

export const updatePromo = async ({ data }: { data: FormData; token?: string }) => {
  const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/promo`, {
    method: "PATCH",
    body: data,
  });

  if (!res.ok) {
    throw await res.json();
  }

  return res.json();
};

export const togglePromo = async ({ id }: { id: string; token?: string }) => {
  const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/promo/toggle`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({ id }),
  });

  if (!res.ok) {
    throw await res.json();
  }

  return res.json();
};

export const removePromo = async ({ id }: { id: string; token?: string }) => {
  const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/promo/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw await res.json();
  }

  return res.json();
};
