import { apiFetch } from "@/lib/api-client";

export const addRideCategory = async ({ data }: { data: Record<string, string>; token?: string }) => {
  try {
    const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/ride-category`, {
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

export const createRide = async ({ data }: { data: FormData; token?: string }) => {
  try {
    const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/ride`, {
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

export const updateRide = async ({ data }: { data: FormData; token?: string }) => {
  try {
    const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/ride`, {
      method: "PUT",
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

export const removeRide = async ({ slug }: { slug: string; token?: string }) => {
  try {
    const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/ride/${slug}`, {
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
