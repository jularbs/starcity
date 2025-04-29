"use client";
import RidesAccordion from "../RidesAccordion/RidesAccordion";
import { useEffect, useState } from "react";
import { shuffle } from "../../lib/shuffler";
import Link from "next/link";

const RidesSection = ({ rides, categories }) => {
  const [ridesState, setRidesState] = useState([]);
  const [categoriesState, setCategoriesState] = useState([]);

  useEffect(() => {
    setRidesState(rides);
    setCategoriesState(shuffle(categories));
  }, []);

  const displayRideItems = () => {
    const temp = categoriesState.map((rc) => {
      return {
        name: rc.name,
        slug: rc.slug,
        rides: shuffle(
          ridesState.filter((ride) => rc._id == ride.rideCategoryId._id)
        ).slice(0, 3),
      };
    });

    return temp.filter((group) => group.rides.length >= 3).slice(0, 3);
  };

  const showCategoryRides = () => {
    return displayRideItems().map((category, key) => {
      return (
        <RidesAccordion
          className="card-item"
          rides={category.rides}
          title={category.name}
          key={key}
        />
      );
    });
  };

  return (
    <div className="max-w-[1600px] mx-auto p-[30px] lg:p-[50px]">
      <div className="mb-6 flex items-center">
        <h2 className="font-sigmar-one mr-4 text-lg xl:text-2xl">
          WORLD CLASS RIDES AND ATTRACTIONS
        </h2>
        <Link href="/rides-and-attractions">
          <span className="bg-sc-orange text-white text-sm font-bold rounded-3xl px-3 py-1 whitespace-nowrap">
            See More
          </span>
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {showCategoryRides()}
      </div>
    </div>
  );
};

export default RidesSection;
