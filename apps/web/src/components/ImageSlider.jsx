"use client";
// TODOS: show Prev or Next Button
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Image from "next/image";
import Autoplay from "embla-carousel-autoplay";
import { getImageSource } from "@/lib/utils";

const ImageSlider = ({ data }) => {
  const showImageSlider = () => {
    return data
      .filter((item) => item.status == true)
      .filter((item) => item.startDate <= new Date().toISOString())
      .filter((item) => item.endDate >= new Date().toISOString())
      .sort((a, b) => {
        if (a.order < b.order) return -1;
        return 1;
      })
      .map((item, key) => {
        return (
          <CarouselItem key={key}>
            <Image
              src={getImageSource(item.image)}
              width={1800}
              height={675}
              alt={`banner-${item._id}`}
              className="w-full"
            />
          </CarouselItem>
        );
      });
  };

  return (
    <>
      <Carousel
        opts={{
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 10000,
          }),
        ]}
      >
        <CarouselContent>{showImageSlider()}</CarouselContent>
      </Carousel>
    </>
  );
};

export default ImageSlider;
