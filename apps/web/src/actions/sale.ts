export const createCheckout = async (
  checkoutDetails: Record<string, unknown>,
) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/sale/checkout`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(checkoutDetails),
    },
  );

  if (!res.ok) {
    throw await res.json();
  }

  return res.json();
};

export const getSaleDetails = async ({
  refid,
  cache = { revalidate: 0 },
}: {
  refid: string;
  cache?: { revalidate: number };
}) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/sale/${refid}`,
    {
      next: cache,
    },
  );

  if (!res.ok) {
    throw await res.json();
  }

  return res.json();
};

export const requestPaymayaCheckout = async (
  checkoutDetails: Record<string, unknown>,
) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/paymaya/checkout`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(checkoutDetails),
    },
  );

  if (!res.ok) {
    throw await res.json();
  }

  return res.json();
};

export const createDragonPayCheckout = async (
  checkoutDetails: Record<string, unknown>,
) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/payment/dragonpay`,
    {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(checkoutDetails),
    },
  );

  if (!res.ok) {
    throw await res.json();
  }

  return res.json();
};
