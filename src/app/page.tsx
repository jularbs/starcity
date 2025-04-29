import TopFoldAdvertisement from "@/components/TopFoldAdvertisement";
import RidesSection from "@/components/RidesSection/RidesSection"
import { getRides, getRideCategories } from "@/actions/ride";
import { getImageSliders } from "@/actions/image-slider";
import ImageSlider from "@/components/ImageSlider";
import ConfirmationModal from "@/components/ConfirmationModal";

export default async function Home() {

  const ridesData = getRides({});
  const rideCategoriesData = getRideCategories({});
  const imageSlidersData = getImageSliders({})
  const [rides, rideCategories, imageSliders] = await Promise.all([ridesData, rideCategoriesData, imageSlidersData]);

  return (
    <div className="">
      <TopFoldAdvertisement />
      <ImageSlider data={imageSliders} />
      <RidesSection rides={rides} categories={rideCategories} />
      <ConfirmationModal />
    </div>
  );
}
