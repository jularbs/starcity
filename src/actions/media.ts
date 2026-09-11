import { apiFetch } from "@/lib/api-client";

export const uploadFromEditor = async ({ data }: { data: FormData; token?: string }) => {
  try {
    const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/upload/editor`, {
      method: "POST",
      body: data,
    });

    if (!res.ok) {
      return res.json().then((error) => {
        throw error;
      });
    }

    return res.json();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    throw {
      error: "Server error, please try again later",
    };
  }
};
