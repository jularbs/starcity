// TODOS: Fix any type
"use client";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import React from "react";

const RideCard = ({ data, id }) => {
  return (
    <Dialog key={id}>
      <DialogTrigger>
        <div className="relative aspect-[3/2] cursor-pointer">
          <Image
            src={data.media.location}
            width={300}
            height={300}
            alt={data.name}
            className="absolute w-full h-full object-cover"
            quality={90}
          ></Image>
          <div className="w-full h-full bg-gradient-to-t from-black to-transparent opacity-50"></div>
          <div className="absolute bottom-0 right-0 text-white text-xs p-4">
            {data.status}
          </div>
          <div className="p-4 absolute bottom-0 w-full text-white text-left">
            <div className="text-2xl font-extrabold">{data.name}</div>
            <div className="text-xs pr-[50px] whitespace-pre-wrap line-clamp-2">
              {data.heightRequirements}
            </div>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="p-0 rounded-none">
        <DialogTitle className=""></DialogTitle>
        <DialogHeader>
          <DialogDescription className="text-black" asChild>
            {/* <Image src={data.media.location} alt={data.name} width={300} height={300} className="w-full h-auto" /> */}
            <div className="p-5 text-left">
              <h3 className="text-xl font-extrabold mb-2">{data.name}</h3>
              <p className="mb-3">{data.description}</p>
              <p className="whitespace-pre-wrap">{data.heightRequirements}</p>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default RideCard;
