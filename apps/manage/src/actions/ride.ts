import { apiFetch } from "@/lib/api-client";

export const addRideCategory = async (data: Record<string, unknown>) => {
  const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/ride-category`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw await res.json();
  }

  return res.json();
};

export const createRide = async (data: FormData) => {
  const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/ride`, {
    method: "POST",
    body: data,
  });

  if (!res.ok) {
    throw await res.json();
  }

  return res.json();
};

export const updateRide = async (id: string, data: FormData) => {
  const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/ride/${id}`, {
    method: "PATCH",
    body: data,
  });

  if (!res.ok) {
    throw await res.json();
  }

  return res.json();
};

export const removeRide = async (id: string) => {
  const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/ride/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw await res.json();
  }

  return res.json();
};
