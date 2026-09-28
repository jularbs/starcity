import RideGallery from "@/components/RideGallery";
import { getRides, getRideCategories } from "@/actions/ride";

export default async function RidesAndAttraction() {
  const rides = await getRides({});
  const rideCategories = await getRideCategories({});

  const rideList = rides?.data;
  const rideCategoryList = rideCategories?.data;
  return (
    <div className="py-4">
      <h2 className="text-center font-sigmar-one text-2xl lg:text-4xl mt-2">Rides and Attractions</h2>
      <RideGallery rides={rideList} rideCategories={rideCategoryList} />
    </div>
  );
}
