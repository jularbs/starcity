import { getMyTickets } from '@/actions/accesspass';
import AccessPassViewer from '@/components/AccessPassViewer/AccessPassViewer';
import { getOptionByName } from '@/actions/option';
import SingleTicketViewer from '@/components/SingleTicketViewer';
import { HttpError } from '@/lib/http-error';
import { cookies } from 'next/headers';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>;
}) {
  const filters = await searchParams;
  const accessPassToken = (await cookies()).get('accessPassToken')?.value;

  if (!accessPassToken) {
    return (
      <main className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="text-3xl font-bold sm:text-4xl">
          Access pass unavailable
        </h1>
        <p className="max-w-md text-muted-foreground">
          Open the access pass link from your email to view your tickets.
        </p>
      </main>
    );
  }

  let data;
  try {
    ({ data } = await getMyTickets(accessPassToken));
  } catch (err) {
    if (err instanceof HttpError && err.status === 429) {
      return (
        <main className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="text-sm font-semibold tracking-widest text-muted-foreground uppercase">
            Rate limited
          </p>
          <h1 className="text-3xl font-bold sm:text-4xl">Too many requests</h1>
          <p className="max-w-md text-muted-foreground">
            You&apos;ve made too many attempts. Please wait a while before
            trying again.
          </p>
        </main>
      );
    }

    if (err instanceof HttpError && [401, 404].includes(err.status)) {
      return (
        <main className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
          <h1 className="text-3xl font-bold sm:text-4xl">
            Access pass unavailable
          </h1>
          <p className="max-w-md text-muted-foreground">
            This access pass link has expired. Open the latest link from your
            email to view your tickets.
          </p>
        </main>
      );
    }

    throw err;
  }

  const { accessPasses, ...details } = data;

  if (filters.t) {
    const singleTicket = accessPasses.find(
      (item: { accessToken: string }) => item.accessToken === filters.t,
    );
    if (!singleTicket) {
      return (
        <main className="flex min-h-[70vh] flex-col items-center justify-center gap-4 px-6 text-center">
          <h1 className="text-3xl font-bold sm:text-4xl">
            Access pass unavailable
          </h1>
          <p className="max-w-md text-muted-foreground">
            This ticket is not part of the current access pass session.
          </p>
        </main>
      );
    }

    const { data: termsAndConditionData } = await getOptionByName({
      name: `TNC_${singleTicket.ticketId.slug.toUpperCase()}`,
    });
    return (
      <SingleTicketViewer
        singleTicket={singleTicket}
        termsAndCondition={termsAndConditionData}
        details={details}
        backHref="/my-tickets"
      />
    );
  }

  return (
    <div className="relative bg-sc-orange min-h-screen w-screen">
      <div className="text-white text-center">
        <h1 className="text-center pt-8 font-sigmar-one text-xl md:text-3xl">
          Hello, {details.customerName}
        </h1>
        <p className="uppercase font-bold text-xs md:text-sm ">
          Your star city access pass
        </p>
      </div>

      <AccessPassViewer
        accessPasses={accessPasses}
        details={details}
        singleTicketPath="/my-tickets"
      />
    </div>
  );
}
