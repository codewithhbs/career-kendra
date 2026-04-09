import LoginForm from "@/components/Login/LoginForm";
import React, { Suspense } from "react";

const page = () => {
  return(
    <Suspense fallback={"...Loading"}>
      <LoginForm/>;
    </Suspense>
  )
};

export default page;
