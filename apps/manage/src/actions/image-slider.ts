import { apiFetch } from "@/lib/api-client";

export const removeImageSlider = async (id: string) => {
  const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/image-slider/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw await res.json();
  }

  return res.json();
};

export const addImageSlider = async (data: FormData) => {
  const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/image-slider`, {
    method: "POST",
    body: data,
  });

  if (!res.ok) {
    throw await res.json();
  }

  return res.json();
};

export const updateImageSlider = async (id: string, data: FormData) => {
  const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/image-slider/${id}`, {
    method: "PATCH",
    body: data,
  });

  if (!res.ok) {
    throw await res.json();
  }

  return res.json();
};
