'use client';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "./ui/button";
import { getOptionByName } from "@/actions/option";
import { ReactNode } from "react";
import useSWR from "swr";
import { useState } from "react";
import TicketPortal from "./TicketPortal";
import { sanitizeHtml } from "@/lib/sanitize";

const ShopButton = ({ children }: { children: ReactNode }) => {
    //TODOS: Error handling and loading state on consent clause
    const { data: consentClause } = useSWR(
        { name: "ETICKET_CONSENT_CLAUSE" },
        getOptionByName
    );

    const [isOpen, setIsOpen] = useState(false)
    const [isTicketPortalOpen, setIsTicketPortalOpen] = useState(false)

    return (
        <>
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    {children}
                </DialogTrigger>
                <DialogContent className="p-0 max-h-[100vh]">
                    <DialogTitle className="hidden">E-ticket Consent Clause</DialogTitle>
                    <DialogHeader >
                        <DialogDescription asChild className="max-h-[75vh] overflow-y-scroll px-4 overscroll-y-none">
                            {consentClause &&
                                <div className="consent-clause-container" dangerouslySetInnerHTML={{ __html: sanitizeHtml(consentClause.value) }} />
                            }
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="p-2">
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={() => {
                            setIsOpen(false);
                            setIsTicketPortalOpen(true)
                        }}>I Agree</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            <TicketPortal open={isTicketPortalOpen} onOpenChange={setIsTicketPortalOpen} />
        </>

    )
}

export default ShopButton;