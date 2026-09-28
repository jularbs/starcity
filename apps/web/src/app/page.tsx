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

  const imageSliderList = imageSliders?.data;
  const rideCategoryList = rideCategories?.data;
  const rideList = rides?.data;

  return (
    <div className="">
      <TopFoldAdvertisement />
      <ImageSlider data={imageSliderList} />
      <RidesSection rides={rideList} categories={rideCategoryList} />
      <ConfirmationModal />
    </div>
  );
}
