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
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/sale/access-pass?${new URLSearchParams({
      salt: salt,
      refid: refid,
    }).toString()}`,
    {
      next: cache,
    },
  );

  if (!res.ok) {
    return res.json().then((error) => {
      throw error;
    });
  }

  return res.json();
  // return res.json();
};
