//TODOS: Zoned Time for timestamps
//TODOS: Filter function?
//TODOS: CSV export
"use client"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { DownloadIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import useSWR from "swr";
import { fetcher } from "@/actions/swr";
import { startOfMonth, endOfMonth, format } from "date-fns";

// import useSWR from "swr";
import { Key, useEffect, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { cn, showCurrency } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { Input } from "@/components/ui/input";
import ResendARComponent from "./ResendARComponent";
import SalesSummaryComponent from "./SalesSummaryComponent";

const SalesListComponent = () => {
    const [startDate, setStartDate] = useState<Date | undefined>(startOfMonth(new Date()))
    const [endDate, setEndDate] = useState<Date | undefined>(endOfMonth(new Date()))
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [inputSearch, setInputSearch] = useState<string>("");
    const [dateFilter, setDateFilter] = useState<DateRange | undefined>({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date())
    });

    //Pagination States
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [skip, setSkip] = useState(0)
    const [limit] = useState(10)

    const [resendArOpen, setResendArOpen] = useState(false);
    const [selectedId, setSelectedId] = useState("")

    const { data, isLoading } = useSWR({
        url: "v1/sale",
        params: { skip: skip, limit: limit, start: format(startDate!, "yyyy-MM-dd"), end: format(endDate!, "yyyy-MM-dd"), search: searchQuery }
    }, fetcher)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const showTicketItems = (items: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return items.map((item: any, index: Key) => {
            return (
                <div key={index}>
                    {item.ticketId.name} x {item.qty}
                </div>
            );
        });
    };

    const showData = () => {
        if (data && !isLoading) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return data?.data?.map((item: any, key: Key) => {
                return <TableRow key={key}>
                    <TableCell className="font-bold">{item.refId}</TableCell>
                    <TableCell>{item.customerName}</TableCell>
                    <TableCell>
                        <div>
                            <div className="font-semibold uppercase">{item.paymentDetails?.option?.name}</div>
                            <div>{item.paymentDetails?.referenceNumber}</div>
                            <div>{item.paymentDetails?.status}</div>
                        </div>
                    </TableCell>
                    <TableCell>
                        <div>
                            {showTicketItems(item.cartItems)}
                        </div>
                    </TableCell>
                    <TableCell>{showCurrency(item.orderTotal)}</TableCell>
                    <TableCell>{format(new Date(item.updatedAt), "PPP p")}</TableCell>
                    <TableCell>
                        <div className="flex justify-end gap-2">
                            <a target="_blank" href={`${process.env.NEXT_PUBLIC_WEB_DOMAIN}/accesspass?s=${item.salt}&r=${item.refId}`}>
                                <Button className="text-xs rounded-sm h-7">View Tickets</Button>
                            </a>

                            <Button className="text-xs rounded-sm h-7"
                                onClick={() => {
                                    setSelectedId(item._id);
                                    setResendArOpen(true);
                                }}
                            >Resend Email</Button>
                        </div>
                    </TableCell>
                </TableRow>
            })
        }

        return new Array(10).fill(0).map((item, key) => {
            return <TableRow key={key}>
                <TableCell><div className="h-6 rounded-lg w-35 bg-muted animate-pulse" /></TableCell>
                <TableCell><div className="h-6 rounded-lg w-50 bg-muted animate-pulse" /></TableCell>
                <TableCell>
                    <div>
                        <div className="w-20 h-6 mb-1 rounded-lg bg-muted animate-pulse" />
                    </div>
                </TableCell>
                <TableCell><div className="h-6 rounded-lg w-35 bg-muted animate-pulse" /></TableCell>
                <TableCell><div className="h-6 rounded-lg w-25 bg-muted animate-pulse" /></TableCell>
                <TableCell><div className="w-40 h-6 rounded-lg bg-muted animate-pulse" /></TableCell>
                <TableCell className="flex justify-end gap-2 text-right">
                    <div className="h-6 rounded-lg w-30 bg-muted animate-pulse" />
                    <div className="h-6 rounded-lg w-30 bg-muted animate-pulse" />
                </TableCell>
            </TableRow>
        })
    }

    const showPagination = () => {
        return <div className="flex items-center justify-between p-4">
            <div className="hidden text-xs font-semibold sm:block">Showing {skip + 1} - {currentPage * limit > data?.count ? data?.count : currentPage * limit} of {data?.count}</div>
            <Pagination className="mx-0! w-auto">
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious href="#"
                            onClick={() => {
                                if (currentPage > 1) {
                                    setSkip(skip - limit);
                                    setCurrentPage(currentPage - 1)
                                }
                            }} />
                    </PaginationItem>
                    <PaginationItem>
                        <PaginationNext href="#"
                            onClick={() => {
                                if (currentPage < totalPages) {
                                    setSkip(skip + limit);
                                    setCurrentPage(currentPage + 1);
                                }
                            }} />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </div>
    }

    //Change Date Side Effects
    useEffect(() => {
        if (data) {
            if (data.count)
                setTotalPages(Math.ceil(data.count / limit));
        }
    }, [data, limit])

    return <>
        <ResendARComponent id={selectedId} open={resendArOpen} onOpenChange={setResendArOpen} />
        <div className="flex w-full max-w-2xl gap-2">
            <Input placeholder="Search for Reference Numbe or Customer Name..."
                value={inputSearch}
                onChange={(e) => {
                    setInputSearch(e.target.value)
                }} />
            <Button
                onClick={() => {
                    setSearchQuery(inputSearch)
                }}>Search
            </Button>
        </div>
        <SalesSummaryComponent startDate={startDate} endDate={endDate} />
        <Card className="p-0 gap-0!">
            <CardHeader className="flex flex-col items-center justify-between p-4 lg:flex-row">
                <div className="text-xl font-bold whitespace-nowrap">Sales Summary</div>
                <div className="flex justify-end gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                className={cn(
                                    "justify-start text-left font-normal",
                                    !dateFilter!.from && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon />
                                {dateFilter!.from ? (
                                    dateFilter!.to ? (
                                        <>
                                            {format(dateFilter!.from, "LLL dd, y")} -{" "}
                                            {format(dateFilter!.to, "LLL dd, y")}
                                        </>
                                    ) : (
                                        format(dateFilter!.from, "LLL dd, y")
                                    )
                                ) : (
                                    <span>Pick a date</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 mt-2 border-2 rounded-lg bg-background border-muted" align="start">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={dateFilter!.from}
                                selected={{
                                    from: dateFilter!.from!,
                                    to: dateFilter!.to,
                                }}
                                onSelect={setDateFilter}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>
                    <Button onClick={() => {
                        setStartDate(dateFilter!.from)
                        setEndDate(dateFilter!.to)
                    }}>Apply Date</Button>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button size="icon" variant="outline">
                                    <DownloadIcon />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Download to CSV</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                </div>
            </CardHeader>
            <CardContent className="p-0 grow">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-50">Reference ID</TableHead>
                            <TableHead>Customer Name</TableHead>
                            <TableHead>Payment Details</TableHead>
                            <TableHead>Tickets</TableHead>
                            <TableHead>Amount Paid</TableHead>
                            <TableHead>Transaction Date</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {showData()}
                    </TableBody>
                </Table>
                {data && data.count < 1 && <div className="w-full p-5 text-center">No available sales</div>}
            </CardContent>
            {data && data.count > 0 && showPagination()}
        </Card>

    </>


}

export default SalesListComponent;