export const applyPromoCode = async ({
  code = '',
  transactionAmount = 0,
  cache = { revalidate: 0 },
}) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/promo/apply?code=${code}&transactionAmount=${transactionAmount}`,
    {
      next: cache,
    },
  );

  if (!res.ok) {
    throw await res.json();
  }

  return res.json();
};
