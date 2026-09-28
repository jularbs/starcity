'use client';
import { useState } from 'react';
import RideCard from './RideCard';

const RideGallery = ({ rides, rideCategories }) => {
  const [chosenCategory, setChosenCategory] = useState();

  const displayRides = () => {
    return rides.map((ride, index) => {
      if (chosenCategory == null || chosenCategory == ride.rideCategoryId._id)
        return <RideCard data={ride} key={index} id={index} />;
    });
  };

  const showCategories = () => {
    return rideCategories.map((category, key) => {
      return (
        <div
          className={`whitespace-nowrap rounded-3xl px-3 py-1 mx-1 text-white font-bold text-md cursor-pointer
            ${
              chosenCategory == category._id ? 'bg-sc-orange' : 'bg-neutral-400'
            }
            `}
          onClick={() => {
            setChosenCategory(category._id);
          }}
          key={key}
        >
          {category.name}
        </div>
      );
    });
  };

  return (
    <>
      <div className="flex justify-center [@media(max-width:1000px)]:justify-start p-4 overflow-x-scroll ">
        <div
          className={`whitespace-nowrap rounded-3xl px-3 py-1 mx-1 text-white font-bold text-md cursor-pointer
            ${chosenCategory == null ? 'bg-sc-orange' : 'bg-neutral-400'}`}
          onClick={() => {
            setChosenCategory(null);
          }}
        >
          All Rides and Attractions
        </div>
        {showCategories()}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 max-w-[1800px] mx-auto p-4">
        {displayRides()}
      </div>
    </>
  );
};

export default RideGallery;
