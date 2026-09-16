export const fetcher = async ({ url = "", cache = { revalidate: 0 } }) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/${url}`, {
    next: cache,
  });

  if (!res.ok) {
    throw await res.json();
  }

  return res.json();
};
