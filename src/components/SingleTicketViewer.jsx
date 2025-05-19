"use client";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import { getImageSource, showPHdate } from "@/lib/utils";
import Image from "next/image";
import { ChevronLeft, LoaderCircle } from "lucide-react";

//DONWLOADER
import { toJpeg } from "html-to-image";
import { useState } from "react";

const SingleTicketViewer = ({ singleTicket, termsAndCondition, details }) => {
  const searchParams = useSearchParams();
  const salt = searchParams.get("s");
  const refid = searchParams.get("r");

  const [loading, setLoading] = useState({
    download: false,
  });
  const downloadQRCode = () => {
    setLoading({ ...loading, download: true });
    toJpeg(document.getElementById(`qrcode-capturearea`), {
      quality: 0.95,
    }).then((dataUrl) => {
      const link = document.createElement("a");
      link.setAttribute("download", `${singleTicket.accessToken}.jpeg`);
      link.setAttribute("target", "_blank");
      link.href = dataUrl;
      link.click();
      setLoading({ ...loading, download: false });
    });
  };

  return (
    <div className="max-w-[800px] mx-auto mt-[50px]">
      <div className="absolute right-3 top-[70px]">
        <Link href={`/accesspass?s=${salt}&r=${refid}`}>
          <Button className="flex items-center gap-1 !pr-4" variant="outline">
            <ChevronLeft className="w-[5px]" />
            <span className="text-xs font-bold">Back </span>
          </Button>
        </Link>
      </div>
      <div className="text-center p-4 bg-background" id="qrcode-capturearea">
        {/* <h1 className="mb-4 uppercase font-sigmar-one text-xl">Your Star City Access Pass</h1> */}
        <h3 className="font-bold text-lg">
          {`${singleTicket.ticketId?.name}`}
        </h3>
        <div className="text-[10px] text-neutral-500">
          {singleTicket.accessToken}
        </div>
        <div className="text-red-500 text-[12px] leading-tight font-semibold mt-3 max-w-[400px] mx-auto">
          Warning: Only QR codes purchased at www.starcity.com.ph are valid. Do
          not buy from other sources.
        </div>
        <img
          src={getImageSource(singleTicket.QRcode)}
          width={300}
          height={300}
          alt={`qrcode-${singleTicket.accessToken}`}
          className="mx-auto max-w-screen"
        />
        <p className="text-sm font-semibold mb-1">
          Purchase Date: {showPHdate(details.createdAt)}
        </p>
        <p className="text-lg font-extrabold">
          This QR Code is valid until {details.expiryDate}.
        </p>
      </div>
      <div className="my-5 text-center px-3">
        <p className="text-xs mb-1 ">
          For mobile, press and hold QR code to download or take a screenshot
        </p>
        <Button
          onClick={downloadQRCode}
          className="bg-sc-orange w-full max-w-[400px] font-bold text-black hover:text-white"
        >
          {loading.download && <LoaderCircle className="animate-spin" />}
          Download QR Code
        </Button>
      </div>
      <h4 className="text-center mt-5 text-xl font-extrabold">
        Terms and Condition
      </h4>
      <div
        dangerouslySetInnerHTML={{ __html: termsAndCondition.value }}
        className="html-content-container font-montserrat p-6"
      />
    </div>
  );
};

export default SingleTicketViewer;
