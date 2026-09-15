import { apiFetch } from "@/lib/api-client";

export const toggleImageSlider = async ({ id }: { id: string; token?: string }) => {
  const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/image-slider/toggle-status`, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "PUT",
    body: JSON.stringify({ id }),
  });

  if (!res.ok) {
    throw await res.json();
  }

  return res.json();
};

export const removeImageSlider = async ({ slug }: { slug: string; token?: string }) => {
  const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/image-slider/${slug}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw await res.json();
  }

  return res.json();
};

export const addImageSlider = async ({ data }: { data: FormData; token?: string }) => {
  const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/image-slider`, {
    method: "POST",
    body: data,
  });

  if (!res.ok) {
    throw await res.json();
  }

  return res.json();
};

export const updateImageSlider = async ({ data }: { data: FormData; token?: string }) => {
  const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/image-slider`, {
    method: "PUT",
    body: data,
  });

  if (!res.ok) {
    throw await res.json();
  }

  return res.json();
};
