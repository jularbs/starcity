"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "../ui/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getImageSource, showPHdate } from "@/lib/utils";
const AccessPassViewer = ({ accessPasses, details }) => {
  const [filtered, setFiltered] = useState([]);
  const searchParams = useSearchParams();
  const salt = searchParams.get("s");
  const refid = searchParams.get("r");

  console.log("salt: ", salt);
  console.log("refId: ", refid);
  useEffect(() => {
    filter();
  }, [accessPasses]);

  const filter = () => {
    const ticketNames = accessPasses.map((item) => {
      return item.ticketId.name;
    });

    const utn = [...new Set(ticketNames)];

    const filteredTickets = utn.map((name) => {
      return {
        name: name,
        accessPass: accessPasses.filter((ap) => ap.ticketId.name === name),
      };
    });

    setFiltered(filteredTickets);
  };

  const accesspassCard = (accesspass, index) => {
    return (
      <div
        className="w-[350px] bg-white px-4 pt-8 pb-4 text-center 
        shrink-0 grow-0 rounded-2xl drop-shadow-[5px_5px_rgba(0,0,0,0.9)]"
        key={index}
      >
        <h3 className="font-bold text-lg">
          <span>{`#${index + 1} `}</span>
          {`${accesspass.ticketId?.name}`}
        </h3>
        <div className="text-[10px] text-neutral-500">
          {accesspass.accessToken}
        </div>
        <div className="text-red-500 text-[12px] leading-tight font-semibold mt-3">
          Warning: Only QR codes purchased at www.starcity.com.ph are valid. Do
          not buy from other sources.
        </div>
        <img
          className="mx-auto"
          src={getImageSource(accesspass.QRcode)}
          width={350}
          height={350}
          alt={`qrcode-${accesspass.accessToken}`}
        />
        <p className="text-xs font-bold mb-1">
          Purchase Date: {showPHdate(details.createdAt)}
        </p>
        <p className="text-xs font-bold">
          This QR Code is valid until {details.expiryDate}.
        </p>
        <a
          href={`/accesspass?t=${accesspass.accessToken}&s=${salt}&r=${refid}`}
          target={"_blank"}
        >
          <Button className="block w-full bg-sc-orange font-bold mt-4 hover:text-white">
            Download
          </Button>
        </a>
      </div>
    );
  };

  const showAccessPassCards = (items) => {
    return items.map((item, index) => {
      return accesspassCard(item, index);
    });
  };

  const showFiltered = () => {
    return filtered.map((item, index) => {
      return (
        <div key={index}>
          <div className="text-xl md:text-2xl font-black uppercase text-white px-6 mb-2">
            {item.name}
          </div>
          <div className="flex flex-row overflow-x-auto gap-6 px-6 pb-6">
            {/* {showAccessPass(item.accessPass)} */}
            {showAccessPassCards(item.accessPass)}
          </div>
        </div>
      );
    });
  };

  return (
    <>
      <div className="mt-4">{showFiltered()}</div>
    </>
  );
};

export default AccessPassViewer;
