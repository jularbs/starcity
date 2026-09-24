import { apiFetch } from "@/lib/api-client";
import { getCookie } from "typescript-cookie";

export const SignIn = async ({ email, password }: { email: string; password: string }) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/signin`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
    credentials: "include",
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    throw await res.json();
  }

  return res.json();
};

export const SignUp = async ({
  name,
  email,
  password,
  confirmPassword,
}: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/signup`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({ name, email, password, confirmPassword }),
  });

  if (!res.ok) {
    throw await res.json();
  }

  return res.json();
};

export const SignOut = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/signout`, {
    headers: {
      Authorization: `Bearer ${getCookie("token") ?? ""}`,
    },
    credentials: "include",
  });

  if (!res.ok) {
    throw await res.json();
  }

  return res.json();
};

export const validateToken = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/validate-token`, {
    headers: {
      Authorization: `Bearer ${getCookie("token")}`,
    },
  });

  if (!res.ok) {
    throw await res.json();
  }

  return res.json();
};

export const refreshAccessToken = async () => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/refresh-token`, {
    method: "POST",
    credentials: "include",
  });

  if (!res.ok) {
    throw await res.json();
  }

  const response = await res.json();
  return response.data ?? response;
};

export const removeUser = async (id: string) => {
  const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/user/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw await res.json();
  }

  return res.json();
};

export const unblockUser = async (id: string) => {
  const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/user/unblock/${id}`, {
    method: "PATCH",
  });

  if (!res.ok) {
    throw await res.json();
  }

  return res.json();
};

export const updateUser = async (id: string, data: Record<string, unknown>) => {
  const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/user/${id}`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "PATCH",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw await res.json();
  }

  return res.json();
};

export const changePassword = async (data: Record<string, unknown>) => {
  const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/user/change-password`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "PATCH",
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    throw await res.json();
  }

  return res.json();
};
