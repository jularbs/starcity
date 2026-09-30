import { HttpError } from '@/lib/http-error';

export const getAccessPasses = async ({
  salt,
  refid,
  cache = { revalidate: 0 },
}: {
  salt: string;
  refid: string;
  cache?: NextFetchRequestConfig;
}) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/sale/access-pass?${new URLSearchParams(
      {
        salt: salt,
        refid: refid,
      },
    ).toString()}`,
    {
      next: cache,
    },
  );

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new HttpError(
      res.status,
      body?.error?.message ?? 'Unable to load access pass.',
      body?.error?.code,
    );
  }

  return res.json();
};

export const getMyTickets = async (accessPassToken: string) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/sale/my-tickets`,
    {
      cache: 'no-store',
      headers: {
        Cookie: `accessPassToken=${encodeURIComponent(accessPassToken)}`,
      },
    },
  );

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new HttpError(
      res.status,
      body?.error?.message ?? 'Unable to load access pass.',
      body?.error?.code,
    );
  }

  return res.json();
};
