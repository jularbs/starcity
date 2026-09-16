export const getOptions = async ({ cache = { revalidate: 0 } }) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/option`, {
    next: cache,
  });

  if (!res.ok) {
    throw await res.json();
  }

  return res.json();
};

export const getOptionByName = async ({ name }: { name: string }) => {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/option/name/${name}`);

  if (!res.ok) {
    throw await res.json();
  }

  return res.json();
};
