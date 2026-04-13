import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import GuestRoute from "./middleware/GuestRoute";
import ProtectedRoute from "./middleware/ProtectedRoute";
import AdminLayout from "./layout/Adminlayout";
import Dashboard from "./pages/Dashboard";
import Placeholder from "./pages/Placeholder";
import Login from "./pages/Login";
import AllListedUser from "./pages/MANAGE_USER/AllListedUser";
import ViewUser from "./pages/MANAGE_USER/ViewUser";
import EditUser from "./pages/MANAGE_USER/EditUser";
import AllCompany from "./pages/MANAGE_COMPANY/AllCompany";
import ViewCompany from "./pages/MANAGE_COMPANY/ViewCompany";
import EditCompany from "./pages/MANAGE_COMPANY/EditCompany";
import { AllJobs } from "./pages/MANAGE_JOBS/AllJobs";
import EditJob from "./pages/MANAGE_JOBS/EditJob";
import CheckApplies from "./pages/MANAGE_JOBS/CheckApplies";
import AllRoles from "./pages/MANAGE_ROLES/AllRoles";
import AllPermissions from "./pages/MANAGE_ROLES/AllPermissions";
import Admins from "./pages/MANAGE_ROLES/Admins";
import CompanyEmployess from "./pages/MANAGE_ROLES/CompanyEmployess";
import NewEmployee from "./pages/MANAGE_ROLES/NewEmploye";
import AllInterview from "./pages/MANAGE_INTERVIEWS/AllInterview";
import ViewApply from "./pages/MANAGE_JOBS/ViewApply";
import ContactMessages from "./pages/MANAGE_WEBSITE/contact";
import WebSettings from "./pages/MANAGE_WEBSITE/webSettings";
import Pages from "./pages/MANAGE_WEBSITE/Pages";
import WhyChooseus from "./pages/MANAGE_WEBSITE/WhyChooseus";
import Organization from "./pages/MANAGE_WEBSITE/Organization";
import Services from "./pages/MANAGE_WEBSITE/service";
import CreateAndEditService from "./pages/EditAndCreatePages/CreateAndEditService";
import CreateAndEditPages from "./pages/EditAndCreatePages/CreateAndEditPages";
import AllEmployerList from "./pages/MANAGE_EMPLOYERS/AllEmployerList";


const App = () => {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: "DM Sans, sans-serif",
            fontSize: "0.875rem",
            background: "#0f0e0c",
            color: "#f5f1ea",
            border: "1px solid rgba(184,151,90,0.3)",
          },
          success: {
            iconTheme: { primary: "#b8975a", secondary: "#0f0e0c" },
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "#fff" },
          },
        }}
      />

      <Routes>
        {/* Redirect root to dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Guest-only routes (redirect if already authenticated) */}
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Protected routes (redirect to login if not authenticated) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analytics" element={<Placeholder />} />

            {/* User Related */}
            <Route path="/users" element={<AllListedUser />} />
            <Route path="/view-user/:id" element={<ViewUser />} />
            <Route path="/edit-user/:id" element={<EditUser />} />

            {/* Employer Related */}
            <Route path="/employers" element={<AllEmployerList />} />
            {/* <Route path="/view-employer/:id" element={<ViewUser />} />
            <Route path="/edit-employer/:id" element={<EditUser />} /> */}


            {/* Company Releated  */}
            <Route path="/clients" element={<AllCompany />} />
            <Route path="/clients/:id" element={<ViewCompany />} />
            <Route path="/clients/edit/:id" element={<EditCompany />} />
            {/* Jobs  */}
            <Route path="/jobs/:status" element={<AllJobs />} />
            <Route path="/jobs/edit/:id" element={<EditJob />} />
            <Route path="/jobs/check-applies/:id" element={<CheckApplies />} />


            {/* Teams amd Roles */}
            <Route path="/active/roles" element={<AllRoles />} />
            <Route path="/active/permission" element={<AllPermissions />} />
            <Route path="/active/company-employees" element={<CompanyEmployess />} />
            <Route path="/active/new-employee" element={<NewEmployee />} />

            <Route path="/active/admins" element={<Admins />} />

            {/* Interviews */}
            <Route path="/interviews" element={<AllInterview />} />
            <Route path="/check-applies/candidates/:id" element={<ViewApply />} />


          <Route path="/website/contact-messages" element={<ContactMessages />} />
          <Route path="/website/settings" element={<WebSettings />} />

          <Route path="/cms/services" element={<Services />} />
          <Route path="/cms/services/create" element={<CreateAndEditService />} />
          <Route path="/cms/services/edit/:id" element={<CreateAndEditService />} />

          
          <Route path="/cms/pages" element={<Pages />} />
         <Route path="/cms/pages/create" element={<CreateAndEditPages />} />
          <Route path="/cms/pages/edit/:id" element={<CreateAndEditPages />} />



          <Route path="/cms/why-choose-us" element={<WhyChooseus />} />
          <Route path="/cms/organization-logos" element={<Organization />} />


            <Route path="/leads" element={<Placeholder />} />
            <Route path="/contracts" element={<Placeholder />} />
            <Route path="/projects" element={<Placeholder />} />
            <Route path="/invoices" element={<Placeholder />} />
            <Route path="/reports" element={<Placeholder />} />
            <Route path="/team" element={<Placeholder />} />
            <Route path="/settings" element={<Placeholder />} />
          </Route>
        </Route>

        {/* 404 catch-all */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;