import { apiFetch } from "@/lib/api-client";

export const updatePaymentOption = async (id: string, data: Record<string, unknown>) => {
  try {
    const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/payment-option/${id}`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "PATCH",
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      return res.json().then((error) => {
        throw error;
      });
    }

    return res.json();
  } catch {
    throw {
      error: "Server error, please try again later",
    };
  }
};
