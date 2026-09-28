import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
  SheetTitle,
} from '@/components/ui/sheet';
import Link from 'next/link';
import { Menu } from 'lucide-react';

const ClientMobileNavigation = async () => {
  return (
    <>
      <Sheet>
        <SheetTrigger
          className="px-5 hidden 
            [@media(max-width:900px)]:order-last
            [@media(max-width:900px)]:pl-2
            [@media(max-width:1300px)]:block"
        >
          <Menu />
        </SheetTrigger>
        <SheetContent
          className={`p-8 text-white bg-sc-orange border-sc-orange text-xl font-sigmar-one`}
        >
          <SheetTitle></SheetTitle>
          <Link href="/">
            <SheetClose className="text-left">Home</SheetClose>
          </Link>
          <Link href="/rides-and-attractions">
            <SheetClose className="text-left">Rides and Attractions</SheetClose>
          </Link>
          <Link href="/page/promos">
            <SheetClose className="text-left">Promos</SheetClose>
          </Link>
          <Link href="/page/park_directions">
            <SheetClose className="text-left">Direction</SheetClose>
          </Link>
          <Link href="/page/park_regulations">
            <SheetClose className="text-left">Park Regulations</SheetClose>
          </Link>
          <Link href="/page/faqs">
            <SheetClose className="text-left">FAQS</SheetClose>
          </Link>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default ClientMobileNavigation;
