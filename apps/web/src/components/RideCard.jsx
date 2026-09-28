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
import { getImageSource } from "@/lib/utils";

const RideCard = ({ data, id }) => {
  return (
    <Dialog key={id}>
      <DialogTrigger>
        <div className="relative aspect-3/2 cursor-pointer">
          <Image
            src={getImageSource(data.media)}
            width={600}
            height={300}
            alt={data.name}
            className="absolute w-full h-full object-cover"
          />
          <div className="w-full h-full bg-linear-to-t from-black to-transparent opacity-50"></div>
          <div className="absolute bottom-0 right-0 text-white text-xs p-4">{data.status}</div>
          <div className="p-4 absolute bottom-0 w-full text-white text-left">
            <div className="text-2xl font-extrabold">{data.name}</div>
            <div className="text-xs pr-12.5 whitespace-pre-wrap line-clamp-2">{data.heightRequirements}</div>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="p-0 overflow-hidden border-none">
        <DialogTitle className="hidden"></DialogTitle>
        <DialogHeader>
          <DialogDescription className="text-black p-0" asChild>
            <div>
              <Image
                src={getImageSource(data.media)}
                alt={data.name}
                width={600}
                height={200}
                className="aspect-video object-cover"
              />
              <div className="p-5 text-left">
                <h3 className="text-xl font-extrabold mb-2">{data.name}</h3>
                <p className="mb-3">{data.description}</p>
                <p className="whitespace-pre-wrap">{data.heightRequirements}</p>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default RideCard;
