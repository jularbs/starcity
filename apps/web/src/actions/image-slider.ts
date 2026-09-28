export const getImageSliders = async ({ cache = { revalidate: 0 } }) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/image-slider`,
    {
      next: cache,
    },
  );

  if (!res.ok) {
    throw await res.json();
  }

  return res.json();
};
