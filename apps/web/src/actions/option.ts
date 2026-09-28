import { HttpError } from '@/lib/http-error';

export const getOptions = async ({ cache = { revalidate: 0 } }) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/option`, {
    next: cache,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new HttpError(
      res.status,
      body?.error?.message ?? 'Unable to load options.',
      body?.error?.code,
    );
  }

  return res.json();
};

export const getOptionByName = async ({ name }: { name: string }) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/option/name/${name}`,
  );

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new HttpError(
      res.status,
      body?.error?.message ?? 'Unable to load option.',
      body?.error?.code,
    );
  }

  return res.json();
};
