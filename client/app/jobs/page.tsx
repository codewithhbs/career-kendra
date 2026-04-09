import CareerWithUs from "@/components/Jobs/Jobs";
import React, { Suspense } from "react";


export default function Page() {
  return (
    <Suspense>
      <CareerWithUs
      
        singlePage={true}
      />
    </Suspense>
  );
}
