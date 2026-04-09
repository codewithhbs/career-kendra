import ApplyJob from "@/components/Jobs/ApplyJob";
import React, { Suspense } from "react";

const page = () => {
  return (
    <Suspense>
      <ApplyJob />;
    </Suspense>
  );
};

export default page;
