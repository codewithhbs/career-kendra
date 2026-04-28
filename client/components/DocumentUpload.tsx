"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import {
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Loader2,
  X,
  RefreshCw,
} from "lucide-react";

const documentTypes = [
  { key: "6month_salary_slip", label: "6 Months Salary Slip", multiple: true },
  {
    key: "highest_education_certificate",
    label: "Highest Education Certificate",
    multiple: false,
  },
  { key: "12th_marksheet", label: "12th Marksheet", multiple: false },
  {
    key: "last_company_experience_letter",
    label: "Last Company Experience Letter",
    multiple: false,
  },
  {
    key: "id_proof",
    label: "ID Proof (Aadhaar / PAN / Passport)",
    multiple: false,
  },
  {
    key: "bank_details_for_sallery",
    label: "Bank Details for Salary",
    multiple: false,
  },
  {
    key: "last_company_offer_letter",
    label: "Last Company Offer Letter",
    multiple: false,
  },
];

type DocumentStatus = "pending" | "approved" | "rejected";

interface UploadedDocument {
  id?: string; // assuming backend returns id for reupload
  type: string;
  fileName: string;
  filePath: string;
  status: DocumentStatus;
  rejectionReason?: string | null;
  verifiedBy?: any;
  verifiedAt?: string | null;
}

const DocumentUploadPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { token } = useAuthStore();

  const applicationId = searchParams.get("applicationId");
  const type = searchParams.get("type"); // "status" or null/undefined

  const [files, setFiles] = useState<Record<string, File[]>>({});
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedData, setUploadedData] = useState(null);

  const [uploadedDocs, setUploadedDocs] = useState<UploadedDocument[]>([]);
  const [reUploading, setReUploading] = useState<Record<string, boolean>>({});

  // Redirect if no token (uncomment when ready)
  // useEffect(() => {
  //     if (!token) router.push("/login?redirect=/documents/upload");
  // }, [token, router]);

  if (!applicationId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl p-8 text-center border">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            Invalid Link
          </h2>
          <p className="text-gray-600 mb-6 text-sm">
            Application ID is missing.
          </p>
          <button
            onClick={() => router.push("/auth/profile?tab=interviews")}
            className="flex items-center gap-2 mx-auto px-6 py-3 bg-gray-900 hover:bg-black text-white rounded-xl transition text-sm font-medium"
          >
            <ArrowLeft size={18} /> Back to Interviews
          </button>
        </div>
      </div>
    );
  }

  const handleFileChange = (docKey: string, fileList: FileList | null) => {
    if (!fileList) return;

    const validFiles = Array.from(fileList).filter(
      (file) => file.type === "application/pdf",
    );

    if (validFiles.length !== fileList.length) {
      alert("Only PDF files are allowed.");
    }

    setFiles((prev) => ({ ...prev, [docKey]: validFiles }));
  };

  const removeFile = (type: string, index: number) => {
    setFiles((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  const uploadDocuments = async () => {
    if (Object.keys(files).length === 0) {
      alert("Please select at least one document.");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      Object.keys(files).forEach((type) => {
        files[type].forEach((file) => formData.append(type, file));
      });

      await axios.post(
        `https://api.careerkendra.com/api/v1/applications/upload-documents/${applicationId}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } },
      );


      

      setUploadSuccess(true);
      setTimeout(() => router.push("/auth/profile?tab=interviews"), 1800);
    } catch (error: any) {
      console.error("Upload error:", error);
      alert(
        error.response?.data?.message || "Upload failed. Please try again.",
      );
    } finally {
      setUploading(false);
    }
  };

  const fetchUploadedDocuments = async () => {
    try {
      const res = await axios.get(
        `https://api.careerkendra.com/api/v1/applications/documents/${applicationId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      console.log("Fetched documents:", res.data);
      setUploadedData(res.data.data);
      setUploadedDocs(res.data.data?.documents || []);
    } catch (error) {
      console.error("Fetch documents error:", error);
    }
  };

  const reUploadDocument = async (doc: UploadedDocument, file: File) => {
    console.log("Re-uploading document:", doc, file);
    // if (!doc.id) {
    //     alert("Document ID not found. Cannot re-upload.");
    //     return;
    // }

    setReUploading((prev) => ({ ...prev, [doc.type]: true }));

    const formData = new FormData();
    formData.append(doc.type, file); // as per your backend

    try {
      await axios.put(
        `https://api.careerkendra.com/api/v1/applications/reupload-document/${uploadedData?.id}`,
        formData,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      alert("Document re-uploaded successfully!");
      fetchUploadedDocuments(); // refresh list
    } catch (error: any) {
      console.error("Re-upload error:", error);
      alert(error.response?.data?.message || "Re-upload failed.");
    } finally {
      setReUploading((prev) => ({ ...prev, [doc.type]: false }));
    }
  };

  // Fetch documents when in status mode
  useEffect(() => {
    if (type === "status" && token) {
      fetchUploadedDocuments();
    }
  }, [type, token, applicationId]);

  const hasAnyFiles = Object.values(files).some((arr) => arr.length > 0);

  // Status badge helper
  const getStatusBadge = (
    status: DocumentStatus,
    rejectionReason?: string | null,
  ) => {
    if (status === "approved") {
      return (
        <span className="px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
          Approved
        </span>
      );
    }
    if (status === "rejected") {
      return (
        <div>
          <span className="px-3 py-1 text-xs font-medium bg-red-100 text-red-700 rounded-full">
            Rejected
          </span>
          {rejectionReason && (
            <p className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded-lg">
              Reason: {rejectionReason}
            </p>
          )}
        </div>
      );
    }
    return (
      <span className="px-3 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 rounded-full">
        Pending
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-200 rounded-lg transition"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {type === "status" ? "Document Status" : "Upload Documents"}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Application ID: <span className="font-mono">{applicationId}</span>
            </p>
          </div>
        </div>

        {uploadSuccess ? (
          <div className="bg-white rounded-2xl p-12 text-center border">
            <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Upload Successful!
            </h2>
            <p className="text-gray-600">Redirecting to interviews...</p>
          </div>
        ) : type === "status" ? (
          /* ==================== STATUS VIEW ==================== */
          <div className="bg-white rounded-2xl border p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6 text-gray-800">
              <FileText size={22} />
              <h2 className="text-lg font-semibold">
                Uploaded Documents Status
              </h2>
            </div>

            <div className="space-y-6">
              {uploadedDocs.length === 0 ? (
                <p className="text-gray-500 text-center py-12">
                  No documents uploaded yet.
                </p>
              ) : (
                uploadedDocs.map((doc) => {
                  const docType = documentTypes.find((d) => d.key === doc.type);
                  const label = docType?.label || doc.type;

                  return (
                    <div
                      key={doc.type}
                      className="border border-gray-200 rounded-xl p-6 hover:border-gray-300 transition-all"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{label}</p>
                          <p className="text-sm text-gray-500 mt-1 truncate">
                            {doc.fileName}
                          </p>
                        </div>

                        <div className="flex items-center gap-4">
                          {getStatusBadge(doc.status, doc.rejectionReason)}
                        </div>
                      </div>

                      {/* Re-upload section for rejected documents */}
                      {doc.status === "rejected" && (
                        <div className="mt-6 pt-6 border-t">
                          <p className="text-sm text-red-600 mb-3">
                            This document was rejected. Please re-upload a
                            corrected version.
                          </p>

                          <label className="block cursor-pointer">
                            <div className="border-2 border-dashed border-red-300 hover:border-red-400 rounded-xl p-6 text-center transition bg-red-50">
                              <RefreshCw
                                className="mx-auto text-red-500 mb-2"
                                size={28}
                              />
                              <p className="text-sm font-medium text-red-700">
                                Click to re-upload PDF
                              </p>
                            </div>
                            <input
                              type="file"
                              accept="application/pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) reUploadDocument(doc, file);
                              }}
                              className="hidden"
                              disabled={reUploading[doc.type]}
                            />
                          </label>

                          {reUploading[doc.type] && (
                            <p className="text-center text-xs text-red-600 mt-2 flex items-center justify-center gap-2">
                              <Loader2 className="animate-spin" size={16} />{" "}
                              Re-uploading...
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            <button
              onClick={() => router.push("/auth/profile?tab=interviews")}
              className="mt-8 w-full py-4 bg-gray-900 hover:bg-black text-white rounded-2xl font-semibold"
            >
              Back to My Interviews
            </button>
          </div>
        ) : (
          /* ==================== NORMAL UPLOAD VIEW ==================== */
          <div className="bg-white rounded-2xl border p-6 md:p-8 shadow-sm">
            <div className="flex items-center gap-2 mb-6 text-gray-800">
              <FileText size={22} />
              <h2 className="text-lg font-semibold">Required Documents</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {documentTypes.map((doc) => {
                const selectedFiles = files[doc.key] || [];

                return (
                  <div
                    key={doc.key}
                    className="border border-gray-200 rounded-xl p-5 hover:border-gray-300 transition-all bg-white"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="font-medium text-gray-900 text-sm md:text-base">
                          {doc.label}
                        </p>
                        {doc.multiple && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            Multiple PDFs allowed
                          </p>
                        )}
                      </div>
                      {selectedFiles.length > 0 && (
                        <span className="text-green-600 text-xs font-medium flex items-center gap-1">
                          <CheckCircle size={15} /> {selectedFiles.length}
                        </span>
                      )}
                    </div>

                    <label className="block cursor-pointer">
                      <div className="border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-xl p-6 text-center transition">
                        <Upload
                          className="mx-auto text-gray-400 mb-2"
                          size={28}
                        />
                        <p className="text-xs text-gray-600 font-medium">
                          Click to upload PDF
                        </p>
                        <p className="text-[10px] text-gray-500 mt-1">
                          Only PDF files supported
                        </p>
                      </div>
                      <input
                        type="file"
                        multiple={doc.multiple}
                        accept="application/pdf"
                        onChange={(e) =>
                          handleFileChange(doc.key, e.target.files)
                        }
                        className="hidden"
                      />
                    </label>

                    {selectedFiles.length > 0 && (
                      <div className="mt-4 space-y-2 max-h-40 overflow-y-auto pr-1">
                        {selectedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-lg text-xs"
                          >
                            <div className="flex items-center gap-2 truncate">
                              <FileText
                                size={16}
                                className="text-blue-600 flex-shrink-0"
                              />
                              <span className="truncate text-gray-700">
                                {file.name}
                              </span>
                            </div>
                            <button
                              onClick={() => removeFile(doc.key, index)}
                              className="text-red-500 hover:text-red-700 p-1"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Upload Button */}
            <div className="mt-10 pt-6 border-t">
              <button
                onClick={uploadDocuments}
                disabled={!hasAnyFiles || uploading}
                className={`w-full py-4 rounded-2xl font-semibold text-base transition flex items-center justify-center gap-3
                                    ${
                                      hasAnyFiles && !uploading
                                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                                        : "bg-gray-200 text-gray-500 cursor-not-allowed"
                                    }`}
              >
                {uploading ? (
                  <>
                    <Loader2 className="animate-spin" size={22} />
                    Uploading Documents...
                  </>
                ) : (
                  <>
                    <Upload size={22} />
                    Upload All Selected Documents
                  </>
                )}
              </button>

              {!hasAnyFiles && (
                <p className="text-center text-xs text-gray-500 mt-3">
                  Please select at least one PDF document
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentUploadPage;
