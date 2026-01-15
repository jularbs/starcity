import { getOptionByName } from "@/actions/option";
import { getRides } from "@/actions/ride";
import { shuffle } from "@/lib/shuffler";
import RideCard from "@/components/RideCard";
import { sanitizeHtml } from "@/lib/sanitize";

export default async function Page({ params }: {
    params: Promise<{ option: string }>
}) {
    const { option } = await params;
    const htmlContent = await getOptionByName({ name: option.toUpperCase() });
    const rides = await getRides({});


    const displayRides = () => {
        return shuffle(rides.slice(0, 5)).map((ride, index) => {
            return <RideCard data={ride} key={index} id={index} />;
        });
    };

    return (
        <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row pt-3">
            <div className="grow">
                <div className="font-sigmar-one text-2xl text-center m-3">{htmlContent.name.replace(/_/g, " ")}</div>
                <div className="html-content-container font-montserrat p-4" dangerouslySetInnerHTML={{ __html: sanitizeHtml(htmlContent.value) }} />
            </div>
            <div className="flex-[350px] grow-0 shrink-0 p-3">
                <p className="text-center font-extrabold text-2xl lg:text-lg mb-2">Our Rides and Attractions</p>
                <div className="grid grid-cols-1 lg:grid-cols-1 md:grid-cols-2 gap-3">
                    {displayRides()}
                </div>
            </div>
        </div>

    );
}
