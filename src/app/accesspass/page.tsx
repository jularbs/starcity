import { getAccessPasses } from "@/actions/accesspass";
import AccessPassViewer from "@/components/AccessPassViewer/AccessPassViewer";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getOptionByName } from "@/actions/option";
import SingleTicketViewer from "@/components/SingleTicketViewer";

export default async function Page({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string }>
}) {
    const filters = await searchParams;
    try {
        const { data } = await getAccessPasses({
            salt: filters.s,
            refid: filters.r
        })

        const { accessPasses, ...details } = data;

        if (filters.t) {
            const singleTicket = accessPasses.find((item: { accessToken: string; }) => item.accessToken == filters.t);
            const { data: termsAndConditionData } = await getOptionByName({ name: `TNC_${singleTicket.ticketId.slug.toUpperCase()}` });
            return <SingleTicketViewer singleTicket={singleTicket} termsAndCondition={termsAndConditionData} details={details} />
        }

        return (
            <div className="relative bg-sc-orange min-h-screen w-screen">
                <div className="text-white text-center">
                    <h1 className="text-center pt-8 font-sigmar-one text-xl md:text-3xl">
                        Hello, {details.customerName}
                    </h1>
                    <p className="uppercase font-bold text-xs md:text-sm ">Your star city access pass</p>
                </div>

                <AccessPassViewer accessPasses={accessPasses} details={details} />
            </div>
        );

    } catch (err) {
        console.log(err)
        return (
            <div className="text-center pt-8 px-3">
                <h2 className="text-2xl font-bold uppercase">{err.message || err.error || 'Invalid Data'}</h2>
                <Link href="/">
                    <Button className="mt-3 border-2 border-black bg-white text-black">Go to homepage</Button>
                </Link>
            </div>
        );
    }
}
