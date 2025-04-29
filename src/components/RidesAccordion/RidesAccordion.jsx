"use client";
import styles from "./styles.module.css";
import { useState, useEffect } from "react";
import Link from "next/link";
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
          style={{
            backgroundImage: `url('${data.media.location}')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
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
