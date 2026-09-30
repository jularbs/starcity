import { getAccessPasses } from '@/actions/accesspass';
import AccessPassViewer from '@/components/AccessPassViewer/AccessPassViewer';
import { getOptionByName } from '@/actions/option';
import SingleTicketViewer from '@/components/SingleTicketViewer';
import { HttpError } from '@/lib/http-error';

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string }>;
}) {
  //TODOS: Deprecate salt and refID usage 1 month after implementation of session management
  const filters = await searchParams;

  let data;
  try {
    ({ data } = await getAccessPasses({
      salt: filters.s,
      refid: filters.r,
    }));
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

    throw err;
  }

  const { accessPasses, ...details } = data;

  if (filters.t) {
    const singleTicket = accessPasses.find(
      (item: { accessToken: string }) => item.accessToken == filters.t,
    );
    const { data: termsAndConditionData } = await getOptionByName({
      name: `TNC_${singleTicket.ticketId.slug.toUpperCase()}`,
    });
    return (
      <SingleTicketViewer
        singleTicket={singleTicket}
        termsAndCondition={termsAndConditionData}
        details={details}
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

      <AccessPassViewer accessPasses={accessPasses} details={details} />
    </div>
  );
}
