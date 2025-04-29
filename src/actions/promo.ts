export const applyPromoCode = async ({
  code = "",
  transactionAmount = 0,
  cache = { revalidate: 0 },
}) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/promo/apply?code=${code}&transactionAmount=${transactionAmount}`,
      {
        next: cache,
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
