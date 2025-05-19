"use client";
import styles from "./styles.module.css";
import { useState, useEffect } from "react";
import Link from "next/link";
import { getImageSource } from "@/lib/utils";
import Image from "next/image";
const RidesAccordion = ({ className, rides, title }) => {
  const [active, setActive] = useState(0);
  const [display, setDisplay] = useState([]);

  useEffect(() => {
    setDisplay(rides);
  }, [rides]);

  const showRides = () => {
    return display.map((data, index) => {
      return (
        <div
          className={`${styles.rideDetails} ${
            index === active ? styles.active : ""
          }`}
          key={index}
          onClick={() => {
            setActive(index);
          }}
        >
          <Image
            src={getImageSource(data.media)}
            width={600}
            height={600}
            className="absolute w-full h-full object-cover"
            alt="ride"
          />
          <div className={styles.spacer}></div>
          <div className={styles.details}>
            <div className={styles.name}>{data.name}</div>
            <div className={styles.hReqs}>{data.heightRequirements}</div>
          </div>
        </div>
      );
    });
  };
  return (
    <div className={`${styles.accordionContainer} ${className}`}>
      <div className={styles.title}>{title}</div>
      {showRides()}
      <Link href="/rides-and-attractions">
        <div className={`${styles.control} flex uppercase`}>see more</div>
      </Link>
    </div>
  );
};

export default RidesAccordion;
