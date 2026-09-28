import { apiFetch } from "@/lib/api-client";

export const uploadFromEditor = async ({ data }: { data: FormData; token?: string }) => {
  const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/upload/editor`, {
    method: "POST",
    body: data,
  });

  if (!res.ok) {
    throw await res.json();
  }

  const response = await res.json();
  return response.data;
};
