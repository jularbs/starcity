export const toggleImageSlider = async ({
  id,
  token,
}: {
  id: string;
  token: string | undefined;
}) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/image-slider/toggle-status`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        method: "PUT",
        body: JSON.stringify({ id }),
      }
    );

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

export const removeImageSlider = async ({
  slug,
  token,
}: {
  slug: string;
  token: string | undefined;
}) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/image-slider/${slug}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: "DELETE",
      }
    );

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

export const addImageSlider = async ({
  data,
  token,
}: {
  data: FormData;
  token: string | undefined;
}) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/image-slider`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: "POST",
        body: data,
      }
    );

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

export const updateImageSlider = async ({
  data,
  token,
}: {
  data: FormData;
  token: string | undefined;
}) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/image-slider`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        method: "PUT",
        body: data,
      }
    );

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
