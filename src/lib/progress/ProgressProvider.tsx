"use client";
import { AppProgressBar as ProgressBar } from "next-nprogress-bar";
import { ReactNode, Suspense } from "react";

const ProgressProvider = ({ children }: { children: ReactNode }) => {
  return (
    <>
      {children}
      {/* Styling in global css */}
      <Suspense>
        <ProgressBar
          height="5px"
          color="rgb(255, 166, 0)"
          options={{ showSpinner: true }}
          shallowRouting
        />
      </Suspense>
    </>
  );
};

export default ProgressProvider;
