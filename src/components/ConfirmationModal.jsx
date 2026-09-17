"use client";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { AlertCircle, CircleCheckBigIcon, Info, LoaderCircle } from "lucide-react";
import { getSaleDetails } from "@/actions/sale";
import { Skeleton } from "./ui/skeleton";

const ConfirmationModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saleDetails, setSaleDetails] = useState({});
  const searchParams = useSearchParams();
  const refid = searchParams.get("refid");
  const payment = searchParams.get("payment");

  const statusConstants = ["success", "PAYMENT_SUCCESS", "S", "s", "COMPLETED", "SUCCESSFUL"];

  const isSuccess = (value) => {
    const filtered = statusConstants.filter((item) => item == value);
    if (filtered.length > 0) {
      return true;
    } else {
      return false;
    }
  };

  useEffect(() => {
    if (refid && payment) {
      setLoading(true);
      setIsOpen(true);
      getSaleDetails({ refid: refid }).then((response) => {
        const { data } = response;
        setLoading(false);
        setSaleDetails(data);
      });
    }
  }, [refid, payment]);

  const showHeader = () => {
    if (loading)
      return (
        <div className="text-center p-3">
          <LoaderCircle className="animate-spin mx-auto mb-2" size={60} />
          <div className="font-bold text-2xl">Loading Transaction</div>
          <div className="text-xs px-4 leading-4 text-neutral-600">
            Please wait while we retrieve your transaction details. Thank you!
          </div>
        </div>
      );

    if (saleDetails)
      if (saleDetails.paymentDetails)
        if (saleDetails.paymentDetails.status) {
          if (isSuccess(saleDetails.paymentDetails.status))
            return (
              <div className="text-center p-3">
                <CircleCheckBigIcon className="text-green-600 mx-auto mb-2" size={60} />
                <div className="font-bold text-2xl">Thank you for your purchase!</div>
                <div className="text-xs px-4 leading-4 text-neutral-600">
                  We have sent you an email with all the details of your order, acknowledgement receipt and how to view
                  your tickets.
                </div>
              </div>
            );
        } else {
          return (
            <div className="text-center p-3">
              <Info className="mx-auto mb-2 text-neutral-400" size={60} />
              <div className="font-bold text-2xl">Your transaction is pending.</div>
              <div className="text-xs px-4 leading-4 text-neutral-600">
                You will receive an email regarding instructions on how to complete your transaction. Tickets and
                acknowledgement receipt will be sent once completed
              </div>
            </div>
          );
        }

    return (
      <div className="text-center p-3">
        <AlertCircle className="mx-auto mb-2 text-red-400" size={60} />
        <div className="font-bold text-2xl pb-4">Transaction not found</div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger></DialogTrigger>
      <DialogContent className="p-0 rounded-none">
        <DialogTitle className="hidden">Testing</DialogTitle>
        <DialogHeader>
          <DialogDescription className="text-black" asChild>
            <div className="pt-10">
              {showHeader()}
              {saleDetails && (
                <div className="mt-7 p-4">
                  <div className="flex justify-between items-center text-[16px] mb-3">
                    <div className="font-bold">Reference Number</div>
                    {loading ? <Skeleton className="h-4 w-[150px]" /> : <div className="">{saleDetails?.refId}</div>}
                  </div>
                  <div className="flex justify-between items-center text-[16px] mb-3">
                    <div className="font-bold">Customer Name</div>
                    {loading ? (
                      <Skeleton className="h-4 w-[190px]" />
                    ) : (
                      <div className="">{saleDetails?.customerName}</div>
                    )}
                  </div>
                  <div className="flex justify-between items-center text-[16px] mb-3">
                    <div className="font-bold">Contact Number</div>
                    {loading ? (
                      <Skeleton className="h-4 w-[120px]" />
                    ) : (
                      <div className="">{saleDetails?.contactNumber}</div>
                    )}
                  </div>
                  <div className="flex justify-between items-center text-[16px] mb-10">
                    <div className="font-bold">Email Address</div>
                    {loading ? (
                      <Skeleton className="h-4 w-[150px]" />
                    ) : (
                      <div className="">{saleDetails?.emailAddress}</div>
                    )}
                  </div>
                  <div className="flex justify-between items-center text-[16px] mb-3">
                    <div className="font-bold">Payment Gateway</div>
                    {loading ? (
                      <Skeleton className="h-4 w-[120px]" />
                    ) : (
                      <div className="">{saleDetails?.paymentDetails?.option?.name}</div>
                    )}
                  </div>
                  <div className="flex justify-between text-[16px] mb-3">
                    <div className="font-bold">Transaction Number</div>
                    {loading ? (
                      <Skeleton className="h-4 w-[150px]" />
                    ) : (
                      <div className="">{saleDetails?.paymentDetails?.referenceNumber}</div>
                    )}
                  </div>
                  <div className="flex justify-between text-[16px] mb-3">
                    <div className="font-bold">Payment Status</div>
                    {loading ? (
                      <Skeleton className="h-4 w-[80px]" />
                    ) : (
                      <div className="">{saleDetails?.paymentDetails?.status}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmationModal;
