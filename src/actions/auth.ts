//Auth Functions
export const SignIn = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/signin`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ email, password }),
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

export const SignUp = async ({
  name,
  email,
  password,
  confirmPassword,
}: {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/signup`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ name, email, password, confirmPassword }),
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

export const SignOut = async () => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/signout`,
      { credentials: "include" }
    );

    if (!res.ok) {
      return res.json().then((error) => {
        throw error;
      });
    }

    return res.json();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    throw {
      error: "Server error, please try again later",
    };
  }
};

export const validateToken = async (token: string | undefined) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/validate-token`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      return res.json().then((error) => {
        console.log("VALIDATE TOKEN ERROR: ", error);
        throw error;
      });
    }

    return res.json();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (err) {
    throw {
      error: "Server error, please try again later",
    };
  }
};

export const refreshAccessToken = async () => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/refresh-token`,
    {
      method: "POST",
      credentials: "include",
    }
  );

  if (!res.ok) {
    return res.json().then((error) => {
      throw error;
    });
  }

  return res.json();
};

//User Managment Functions
export const removeUser = async ({
  id,
  token,
}: {
  id: string;
  token: string | undefined;
}) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/user/${id}`,
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

export const updateUser = async ({
  data,
  token,
}: {
  data: Record<string, string | boolean>;
  token: string | undefined;
}) => {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/user`, {
      headers: {
        Authorization: `Bearer ${token}`,
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    throw {
      error: "Server error, please try again later",
    };
  }
};
