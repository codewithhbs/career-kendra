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
import CreateCompany from "./CreateCompany";
import ManageCompaines from "./ManageCompaines";
import UpdateCompany from "./UpdateCompany";
import EmployerProfileUpdate from "./Setting";
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
      case "create-company":
        return <CreateCompany/>;
      case "manage-companies":
        return <ManageCompaines/>;
      case "update-company":
        return <UpdateCompany/>;
      case "settings":
        return <EmployerProfileUpdate/>;
      default:
        return <OverviewContent />;
    }
  };

  return <AdminLayout>{renderContent()}</AdminLayout>;
}