"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useDropzone } from "react-dropzone";
import axios from "axios";

import { useEmployerAuthStore } from "@/store/employerAuth.store";
import { API_URL, IMAGE_URL } from "@/constant/api";
import { INDUSTRIES } from "@/lib/industries";

import CompanyProfileHeader from "./components/CompanyProfileHeader";
import CompanyLogoSection from "./components/CompanyLogoSection";
import BasicInformationSection from "./components/BasicInformationSection";
import ContactAndLocationSection from "./components/ContactAndLocationSection";
import AboutAndSocialSection from "./components/AboutAndSocialSection";

export default function CompanyProfileContent() {
  const router = useRouter();
  const { company, fetchCompanyProfile, loading, isAuthenticated, token } =
    useEmployerAuthStore();
  const [isSaving, setIsSaving] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  console.log(token);
  const [form, setForm] = useState({
    companyName: "",
    companyTagline: "",
    companyCategory: "",
    companySize: "",
    GST: "",
    PAN: "",
    foundedYear: "",
    country: "India",
    state: "",
    city: "",
    companyEmail: "",
    companyPhone: "",
    companyWebsite: "",
    linkedinUrl: "",
    facebookUrl: "",
    instagramUrl: "",
    twitterUrl: "",
    youtubeUrl: "",
    githubUrl: "",
    whatsappNumber: "",
    googleMapsUrl: "",
    pincode: "",
    fullAddress: "",
    description: "",
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/auth/login-employers");
    } else {
      fetchCompanyProfile();
    }
  }, [isAuthenticated, fetchCompanyProfile, router]);

  // Populate form when company data is loaded
  useEffect(() => {
    if (!company) return;

    setForm({
      companyName: company.companyName || "",
      companyTagline: company.companyTagline || "",
      companyCategory: company.companyCategory || "",
      companySize: company.companySize || "",
      GST: company.GST || "",
      PAN: company.PAN || "",
      foundedYear: company.foundedYear || "",
      country: company.country || "India",
      state: company.state || "",
      city: company.city || "",
      companyEmail:
        company.companyEmail || company?.employer?.employerEmail || "",
      companyPhone:
        company.companyPhone || company?.employer?.employerContactNumber || "",
      companyWebsite: company.companyWebsite || "",
      linkedinUrl: company.linkedinUrl || "",
      facebookUrl: company.facebookUrl || "",
      instagramUrl: company.instagramUrl || "",
      twitterUrl: company.twitterUrl || "",
      youtubeUrl: company.youtubeUrl || "",
      githubUrl: company.githubUrl || "",
      whatsappNumber: company.whatsappNumber || "",
      googleMapsUrl: company.googleMapsUrl || "",
      pincode: company.pincode || "",
      fullAddress: company.fullAddress || "",
      description: company.description || "",
    });

    if (company.companyLogo) {
      setLogoPreview(`${IMAGE_URL}${company.companyLogo}`);
    } else {
      setLogoPreview(null);
    }
  }, [company]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Only image files allowed");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size must be under 2MB");
      return;
    }

    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    maxFiles: 1,
    multiple: false,
  });

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!form.companyName.trim()) errs.companyName = "Company name is required";
    if (
      form.GST &&
      !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(
        form.GST.toUpperCase(),
      )
    ) {
      errs.GST = "Invalid GSTIN format";
    }
    if (
      form.PAN &&
      !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.PAN.toUpperCase())
    ) {
      errs.PAN = "Invalid PAN format";
    }
    if (form.foundedYear && !/^(19|20)\d{2}$/.test(form.foundedYear)) {
      errs.foundedYear = "Year must be 1900–2099";
    }
    if (
      form.companyEmail &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.companyEmail)
    ) {
      errs.companyEmail = "Invalid email";
    }
    if (form.companyPhone && !/^[6-9]\d{9}$/.test(form.companyPhone)) {
      errs.companyPhone = "Must be valid 10-digit Indian mobile number";
    }
    if (form.pincode && !/^\d{6}$/.test(form.pincode)) {
      errs.pincode = "PIN code must be 6 digits";
    }
    if (form.description.trim() && form.description.trim().length < 30) {
      errs.description = "Description should be at least 30 characters";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) {
      toast.error("Please correct the errors");
      return;
    }

    if (isSaving) return;
    setIsSaving(true);

    try {
      const clean = (value: unknown) => {
        if (typeof value === "string") {
          const trimmed = value.trim();
          return trimmed ? trimmed : undefined;
        }

        if (value === null || value === undefined) {
          return undefined;
        }

        return value;
      };

      const cleanUpper = (value?: string) =>
        value?.trim() ? value.trim().toUpperCase() : undefined;

      // Create axios instance
      const api = axios.create({
        baseURL: API_URL,
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      /* ==============================
       STEP 1 – CREATE (if not exists)
    =============================== */

      let companyId = company?.id;

      if (!companyId) {
        const createPayload = {
          companyName: clean(form.companyName),
          companyTagline: clean(form.companyTagline),
          companyCategory: clean(form.companyCategory),
          companySize: clean(form.companySize),
          GST: cleanUpper(form.GST),
          PAN: cleanUpper(form.PAN),
          foundedYear: clean(form.foundedYear),
          country: clean(form.country),
          state: clean(form.state),
          city: clean(form.city),
        };

        const createRes = await api.post(
          "/company/create-step1",
          createPayload,
        );

        companyId = createRes?.data?.data?.id;
      }

      /* ==============================
       STEP 2 – UPDATE
    =============================== */

      const updatePayload = {
        companyName: clean(form.companyName),
        companyTagline: clean(form.companyTagline),
        companyCategory: clean(form.companyCategory),
        companySize: clean(form.companySize),
        GST: cleanUpper(form.GST),
        PAN: cleanUpper(form.PAN),
        foundedYear: clean(form.foundedYear),
        country: clean(form.country),
        state: clean(form.state),
        city: clean(form.city),
        companyEmail: clean(form.companyEmail),
        companyPhone: clean(form.companyPhone),
        companyWebsite: clean(form.companyWebsite),
        linkedinUrl: clean(form.linkedinUrl),
        facebookUrl: clean(form.facebookUrl),
        instagramUrl: clean(form.instagramUrl),
        twitterUrl: clean(form.twitterUrl),
        youtubeUrl: clean(form.youtubeUrl),
        githubUrl: clean(form.githubUrl),
        whatsappNumber: clean(form.whatsappNumber),
        googleMapsUrl: clean(form.googleMapsUrl),
        pincode: clean(form.pincode),
        fullAddress: clean(form.fullAddress),
        description: clean(form.description),
      };

      if (logoFile) {
        const formData = new FormData();

        Object.entries(updatePayload).forEach(([key, value]) => {
          if (value !== undefined) {
            formData.append(key, String(value));
          }
        });

        formData.append("companyLogo", logoFile);

        await api.put("/company/update-step2", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        await api.put("/company/update-step2", updatePayload);
      }

      toast.success("Company profile saved successfully 🎉");

      setIsEditMode(false);
      setLogoFile(null);

      await fetchCompanyProfile(); // refresh latest data
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        // Axios specific error
        console.error("Save error:", err.response?.data || err.message);

        const message = err.response?.data?.message ?? "Could not save profile";

        toast.error(message);
      } else {
        // Non-axios error
        console.error("Unexpected error:", err);
        toast.error("Something went wrong");
      }
    } finally {
      setIsSaving(false);
    }
  };
  const handleCancel = () => {
    setIsEditMode(false);
    setLogoFile(null);

    if (company) {
      setForm({
        companyName: company.companyName || "",
        companyTagline: company.companyTagline || "",
        companyCategory: company.companyCategory || "",
        companySize: company.companySize || "",
        GST: company.GST || "",
        PAN: company.PAN || "",
        foundedYear: company.foundedYear || "",
        country: company.country || "India",
        state: company.state || "",
        city: company.city || "",
        companyEmail:
          company.companyEmail || company?.employer?.employerEmail || "",
        companyPhone:
          company.companyPhone ||
          company?.employer?.employerContactNumber ||
          "",
        companyWebsite: company.companyWebsite || "",
        linkedinUrl: company.linkedinUrl || "",
        facebookUrl: company.facebookUrl || "",
        instagramUrl: company.instagramUrl || "",
        twitterUrl: company.twitterUrl || "",
        youtubeUrl: company.youtubeUrl || "",
        githubUrl: company.githubUrl || "",
        whatsappNumber: company.whatsappNumber || "",
        googleMapsUrl: company.googleMapsUrl || "",
        pincode: company.pincode || "",
        fullAddress: company.fullAddress || "",
        description: company.description || "",
      });
      setLogoPreview(
        company.companyLogo ? `${IMAGE_URL}${company.companyLogo}` : null,
      );
    }
  };

  if (!company && !loading) {
    return (
      <div className="py-12 text-center text-gray-500 text-sm">
        Loading company profile...
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-3 py-3">
      <CompanyProfileHeader
        companyName={company?.companyName}
        isEditMode={isEditMode}
        onEdit={() => setIsEditMode(true)}
        onSave={handleSave}
        onCancel={handleCancel}
        isSaving={loading}
      />

      <div className="mt-6 space-y-6">
        <CompanyLogoSection
          logoPreview={logoPreview}
          isEditMode={isEditMode}
          getRootProps={getRootProps}
          getInputProps={getInputProps}
          isDragActive={isDragActive}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BasicInformationSection
            isEditMode={isEditMode}
            form={form}
            setForm={setForm}
            errors={errors}
            industries={[...INDUSTRIES]}
          />

          <ContactAndLocationSection
            isEditMode={isEditMode}
            form={form}
            setForm={setForm}
            errors={errors}
          />
        </div>

        <AboutAndSocialSection
          isEditMode={isEditMode}
          form={form}
          setForm={setForm}
          errors={errors}
          socialLinks={[
            { key: "linkedinUrl", label: "LinkedIn" },
            { key: "facebookUrl", label: "Facebook" },
            { key: "instagramUrl", label: "Instagram" },
            { key: "twitterUrl", label: "Twitter / X" },
            { key: "youtubeUrl", label: "YouTube" },
            { key: "githubUrl", label: "GitHub" },
            {
              key: "whatsappNumber",
              label: "WhatsApp",
              prefix: "https://wa.me/",
            },
          ]}
          company={company}
        />
      </div>
    </div>
  );
}
