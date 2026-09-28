"use client"
import { Card, CardContent } from "@/components/ui/card";
import { ChartNoAxesColumn, CircleDollarSign, Tickets, UserCircle } from "lucide-react";
import { fetcher } from "@/actions/swr"
import { format } from "date-fns/format"
import { useEffect, useState } from "react"
import useSWR from "swr"
import { showCurrency } from "@/lib/utils";
import { endOfMonth, startOfMonth } from "date-fns";

const SalesSummaryComponent = ({ startDate, endDate }: {
    startDate?: Date | undefined,
    endDate?: Date | undefined
}) => {

    const [start,] = useState<Date>(startDate || startOfMonth(new Date()))
    const [end,] = useState<Date>(endDate || endOfMonth(new Date()))

    const { data, isLoading } = useSWR(start && end ? {
        url: "v1/sale",
        params: { skip: 0, limit: 0, start: format(start, "yyyy-MM-dd"), end: format(end, "yyyy-MM-dd") }
    } : null, fetcher)

    const [summary, setSummary] = useState<Record<string, number>>({
        customers: -1,
        tickets: -1,
        total: -1,
        average: -1
    })

    useEffect(() => {
        setSummary({
            customers: -1,
            tickets: -1,
            total: -1,
            average: -1
        });
        if (!isLoading)
            if (data) {
                const customers = data.data.length;
                const total = data.data?.reduce(
                    (acc: number, obj: Record<string, number>) => acc + obj.orderTotal,
                    0
                );
                const tickets = data.data?.reduce(
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

    }, [data, isLoading, startDate, endDate])

    return <>
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
        </div></>
}


export default SalesSummaryComponent;