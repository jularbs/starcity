import { apiFetch } from "@/lib/api-client";

export const toggleImageSlider = async ({ id }: { id: string; token?: string }) => {
  try {
    const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/image-slider/toggle-status`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "PUT",
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

export const removeImageSlider = async ({ slug }: { slug: string; token?: string }) => {
  try {
    const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/image-slider/${slug}`, {
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

export const addImageSlider = async ({ data }: { data: FormData; token?: string }) => {
  try {
    const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/image-slider`, {
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

export const updateImageSlider = async ({ data }: { data: FormData; token?: string }) => {
  try {
    const res = await apiFetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/image-slider`, {
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
