import Link from "next/link"
import Image from "next/image";
import ShopButton from "../ShopButton";
import ClientMobileNavigation from "./ClientMobileNavigation";

const ClientNavigation = async () => {
    return <>
        <div className="relative flex h-navbar-height bg-white justify-between z-50">
            <Link href="/">
                <div>
                    <Image
                        src={'/logo-slogan.png'}
                        width={150}
                        className="ml-4
                            mt-4
                            w-27.5
                            md:w-30
                            lg:w-37.5
                            lg:mt-4"
                        priority
                        height={150}
                        alt="Star City Logo"
                    />
                </div></Link>

            <div className="flex items-center">
                <div className="">
                    <Link href="/" className="[@media(max-width:1300px)]:hidden mx-6 whitespace-nowrap font-bold text-[13px] uppercase">Home</Link>
                    <Link href="/rides-and-attractions" className="[@media(max-width:900px)]:hidden mx-6 whitespace-nowrap font-bold text-[13px] uppercase">Rides and Attractions</Link>
                    <Link href="/page/promos" className="[@media(max-width:1100px)]:hidden mx-6 whitespace-nowrap font-bold text-[13px] uppercase">Promos</Link>
                    <Link href="/page/park_directions" className="[@media(max-width:1200px)]:hidden mx-6 whitespace-nowrap font-bold text-[13px] uppercase">Direction</Link>
                    <Link href="/page/park_regulations" className="[@media(max-width:1100px)]:hidden mx-6 whitespace-nowrap font-bold text-[13px] uppercase">Park Regulations</Link>
                    <Link href="/page/faqs" className="[@media(max-width:900px)]:hidden mx-6 whitespace-nowrap font-bold text-[13px] uppercase">FAQS</Link>
                </div>
                <ClientMobileNavigation />
                <ShopButton>
                    <div className={`mx-3 bg-sc-orange whitespace-nowrap hover:bg-sc-orange rounded-3xl px-4 py-1 font-sigmar-one text-sm lg:text-lg cursor-pointer text-white`}>
                        Buy Tickets
                    </div>
                </ShopButton>
            </div>
        </div>
    </>
};

export default ClientNavigation;
