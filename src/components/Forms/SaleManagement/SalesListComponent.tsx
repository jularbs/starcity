//TODOS: Resend Email Function
//TODOS: Zoned Time for timestamps
//TODOS: Use ISO format on Dates for requests
//TODOS: Filter function?
//TODOS: CSV export
/* eslint-disable @typescript-eslint/no-unused-vars */
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
import { ChartNoAxesColumn, CircleDollarSign, DownloadIcon, LoaderCircle, Tickets, UserCircle } from "lucide-react";

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

const SalesListComponent = () => {
    const [startDate, setStartDate] = useState<Date | undefined>(startOfMonth(new Date()))
    const [endDate, setEndDate] = useState<Date | undefined>(endOfMonth(new Date()))
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [inputSearch, setInputSearch] = useState<string>("");
    const [dateFilter, setDateFilter] = useState<DateRange | undefined>({
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date())
    });

    const [summary, setSummary] = useState<Record<string, number>>({
        customers: -1,
        tickets: -1,
        total: -1,
        average: -1
    })
    //Pagination States
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [skip, setSkip] = useState(0)
    const [limit] = useState(10)

    const { data, isLoading } = useSWR({
        url: "v1/sale",
        params: { skip: skip, limit: limit, start: startDate!.toISOString(), end: endDate!.toISOString(), search: searchQuery }
    }, fetcher)

    const { data: summaryData, isLoading: isSummaryLoading, error } = useSWR({
        url: "v1/sale",
        params: { skip: 0, limit: 0, start: startDate!.toISOString(), end: endDate!.toISOString(), search: searchQuery }
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const showTicketItemsUnformateed = (items: any) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return items.map((item: any, index: Key) => {
            return `${item.ticketId.name} x ${item.qty}`
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
                            {/* <div>{item.paymentDetails?.status}</div> */}
                        </div>
                    </TableCell>
                    <TableCell>
                        <div>
                            {showTicketItems(item.cartItems)}
                        </div>
                    </TableCell>
                    <TableCell>{showCurrency(item.orderTotal)}</TableCell>
                    <TableCell>{format(new Date(item.createdAt), "PPP p")}</TableCell>
                    <TableCell>
                        <div className="flex justify-end gap-2">
                            <a target="_blank" href={`${process.env.NEXT_PUBLIC_WEB_DOMAIN}/accesspass?s=${item.salt}&r=${item.refId}`}>
                                <Button className="text-xs rounded-sm h-7">View Tickets</Button>
                            </a>

                            <Button className="text-xs rounded-sm h-7">Resend Email</Button>
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
            <Pagination className="!mx-0 w-auto">
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

    //Summary Side Effects
    useEffect(() => {
        setSummary({
            customers: -1,
            tickets: -1,
            total: -1,
            average: -1
        });
        if (!isSummaryLoading)
            if (summaryData) {
                //FOR DEBUG
                console.log("SERVER COMPUTED START DATE: ", startDate?.toString())
                console.log("SERVER COMPUTED START DATE TO ISO STRING: ", startDate?.toISOString())
                console.log("SERVER COMPUTED START DATE TO UTC STRING: ", startDate?.toUTCString())
                const customers = summaryData.count;
                const total = summaryData.data?.reduce(
                    (acc: number, obj: Record<string, number>) => acc + obj.orderTotal,
                    0
                );
                const tickets = summaryData.data?.reduce(
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (acc: any, obj: { cartItems: any[]; }) => acc + obj.cartItems.reduce((a: any, b: { qty: any; }) => a + b.qty, 0),
                    0
                );

                setSummary({
                    customers: customers,
                    total: total,
                    tickets: tickets,
                    average: total / customers
                });
            }

    }, [summaryData, isSummaryLoading, startDate, endDate])

    return <>
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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="mb-2 text-sm font-black uppercase text-neutral-600">customers</div>
                            {summary.customers == -1 ? <div className="text-xl font-semibold rounded-lg w-15 h-7 bg-neutral-200 animate-pulse" /> : <div className="text-xl font-semibold">{summary.customers}</div>}
                        </div>
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-neutral-500">
                            <UserCircle size={40} className="text-white " />
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="mb-2 text-sm font-black uppercase text-neutral-600">tickets sold</div>
                            {summary.customers == -1 ? <div className="text-xl font-semibold rounded-lg w-25 h-7 bg-neutral-200 animate-pulse" /> : <div className="text-xl font-semibold">{summary.tickets}</div>}

                        </div>
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-neutral-500">
                            <Tickets size={30} className="text-white " />
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="mb-2 text-sm font-black uppercase text-neutral-600">Total Sales</div>
                            {summary.customers == -1 ? <div className="text-xl font-semibold rounded-lg w-45 h-7 bg-neutral-200 animate-pulse" /> : <div className="text-xl font-semibold">{showCurrency(summary.total)}</div>}
                        </div>
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-neutral-500">
                            <CircleDollarSign size={40} className="text-white " />
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="mb-2 text-sm font-black uppercase text-neutral-600">Average Transaction</div>
                            {summary.customers == -1 ? <div className="text-xl font-semibold rounded-lg w-25 h-7 bg-neutral-200 animate-pulse" /> : <div className="text-xl font-semibold">{summary.average ? showCurrency(summary.average) : "0"}</div>}
                        </div>
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-neutral-500">
                            <ChartNoAxesColumn size={30} className="text-white " />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
        <Card className="p-0 !gap-0">
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
            <CardContent className="p-0 grow-1">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[200px]">Reference ID</TableHead>
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