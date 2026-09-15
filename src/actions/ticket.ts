// TODOS: Declare types
import { apiFetch } from "@/lib/api-client";
import { isApiError } from "@/lib/errors";

export const createTicket = async (data: unknown) => {
  try {
    const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/ticket`, {
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
  } catch (e) {
    if (isApiError(e)) {
      throw e;
    }
    throw {
      error: "Server error, please try again later",
    };
  }
};

export const updateTicket = async (id: string, data: unknown) => {
  try {
    const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/ticket/${id}`, {
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
  } catch (e) {
    if (isApiError(e)) {
      throw e;
    }
    throw {
      error: "Server error, please try again later",
    };
  }
};

export const removeTicket = async ({ id }: { id: string }) => {
  try {
    const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/ticket/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      return res.json().then((error) => {
        throw error;
      });
    }

    return res.json();
  } catch (e) {
    if (isApiError(e)) {
      throw e;
    }
    throw {
      error: "Server error, please try again later",
    };
  }
};
