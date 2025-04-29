export const getTickets = async ({ cache = { revalidate: 0 } }) => {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_ENDPOINT}/v1/ticket`,
    {
      next: cache,
    }
  );

  if (!res.ok) {
    // This will activate the closest `error.js` Error Boundary
    return undefined;
  }

  return res.json();
  // return res.json();
};
