import { apiFetch } from "@/lib/api-client";

export const getPaymentOptions = async ({ cache = { revalidate: 0 } }) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/payment-option`, {
      next: cache,
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

export const togglePaymentOption = async ({ id }: { token?: string; id: string }) => {
  try {
    const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/payment-option/toggle-status`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "PUT",
      body: JSON.stringify({ _id: id }),
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
