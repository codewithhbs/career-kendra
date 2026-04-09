"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import CompanyProfileContent from "./CompanyProfileContent";
import { AdminLayout } from "./layout/layout";
import PostJob from "./PostJobs/PostJob";
import MyJobs from "./PostJobs/MyJobs";
import AllApplications from "./Applications/AllAplications";
import ViewApplications from "./Applications/ViewApplications";
import Messages from "./Applications/Messages";
import AllInterviews from "./Applications/AllInterviews";
import { API_URL } from "@/constant/api";
import axios from "axios";
import OverviewContent from "./OverViewContent";
axios.defaults.baseURL = API_URL;



export default function MainScreen() {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "overview";

  const renderContent = () => {
    switch (currentTab) {
      case "overview":
        return <OverviewContent />;
      case "company":
        return <CompanyProfileContent />;
      case "post-jobs":
        return <PostJob />;
      case "my-jobs":
        return <MyJobs />;
      case "applications":
        return <AllApplications />;
      case "view-applications":
        return <ViewApplications />;
      case "messages":
        return <Messages/>;
      case "interviews":
        return <AllInterviews/>;
      case "settings":
        return <div className="text-gray-600">Settings – coming soon...</div>;
      default:
        return <OverviewContent />;
    }
  };

  return <AdminLayout>{renderContent()}</AdminLayout>;
}