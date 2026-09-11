import { apiFetch } from "@/lib/api-client";

export const createPromo = async ({ data }: { data: FormData; token?: string }) => {
  try {
    const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/promo`, {
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

export const updatePromo = async ({ data }: { data: FormData; token?: string }) => {
  try {
    const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/promo`, {
      method: "PATCH",
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

export const togglePromo = async ({ id }: { id: string; token?: string }) => {
  try {
    const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/promo/toggle`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ id }),
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

export const removePromo = async ({ id }: { id: string; token?: string }) => {
  try {
    const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/promo/${id}`, {
      method: "DELETE",
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
