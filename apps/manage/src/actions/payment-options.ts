import { apiFetch } from '@/lib/api-client';

export const updatePaymentOption = async (
  id: string,
  data: Record<string, unknown>,
) => {
  const res = await apiFetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/payment-option/${id}`,
    {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'PATCH',
      body: JSON.stringify(data),
    },
  );

  if (!res.ok) {
    throw await res.json();
  }

  return res.json();
};
