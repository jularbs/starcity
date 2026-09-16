import { apiFetch } from "@/lib/api-client";

export const resendAcknowledmentReceipt = async (id: string) => {
  const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/sale/resend-email`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ id }),
  });

  if (!res.ok) {
    throw await res.json();
  }

  return res.json();
};
