import { apiFetch } from '@/lib/api-client';

export const saveOption = async (data: Record<string, string>) => {
  const res = await apiFetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/option`,
    {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(data),
    },
  );

  if (!res.ok) {
    throw await res.json();
  }

  return res.json();
};
