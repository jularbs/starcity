import { apiFetch } from "@/lib/api-client";

export const saveOption = async ({ data }: { token?: string; data: Record<string, string> }) => {
  try {
    const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/option`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify(data),
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
