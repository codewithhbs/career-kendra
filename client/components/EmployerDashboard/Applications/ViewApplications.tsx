import React, { useEffect, useState, useRef } from "react";

import Swal from "sweetalert2";
import {
  Calendar,
  Mail,
  Phone,
  MapPin,
  Clock,
  UserCheck,
  Send,
  X,
  Edit3,
  CheckCircle,
  Eye,
  ThumbsUp,
  ThumbsDown,
  FileText,
  Users,
  LinkIcon,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import axios from "axios";
import { API_URL } from "@/constant/api";
axios.defaults.baseURL = API_URL;

import JoditEditor from "jodit-react";

const ViewApplications = () => {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") || "overview";

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [sendingEmail, setSendingEmail] = useState(false);
  const [offerEmailsSent, setOfferEmailsSent] = useState(0);

  // Document Verification States
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [verifyingDocId, setVerifyingDocId] = useState(null);

  const editor = useRef(null);
  const fileInputRef = useRef(null);

  const parsedAnswers = (() => {
    try {
      if (!application?.screeningAnswers) return null;

      return typeof application.screeningAnswers === "string"
        ? JSON.parse(application.screeningAnswers)
        : application.screeningAnswers;
    } catch {
      return null;
    }
  })();

  const joditConfig = {
    readonly: false,
    height: 420,
    toolbarAdaptive: false,
    toolbarSticky: false,
    buttons: [
      "bold",
      "italic",
      "underline",
      "strikethrough",
      "|",
      "ul",
      "ol",
      "|",
      "font",
      "fontsize",
      "brush",
      "paragraph",
      "|",
      "align",
      "undo",
      "redo",
      "|",
      "link",
      "image",
      "|",
      "hr",
      "table",
      "source",
    ],
    style: { fontSize: "15px", lineHeight: "1.6" },
  };

  const fetchApplication = async () => {
    try {
      const res = await axios.get(`/applications/get-one/${id}`);
      const appData = res.data.data;
      setApplication(appData);
      setOfferEmailsSent(appData.offerEmailsSent || 0);

      const defaultSubject = `Congratulations! You have been selected for ${appData.job.jobTitle}`;
      setEmailSubject(defaultSubject);
      setEmailBody("");
    } catch (error) {
      Swal.fire({
        title: "Error",
        text: "Failed to fetch application details",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchApplication();
  }, [id]);

  // ===================== DOCUMENT VERIFICATION =====================

  const handleVerifyDocument = async (docId, type, status, reason = null) => {
    if (status === "rejected" && !reason) {
      Swal.fire("Error", "Please provide a rejection reason", "error");
      return;
    }

    setVerifyingDocId(docId);

    try {
      await axios.put(`/applications/verify-document/${docId}`, {
        type: type || selectedDocument.type,
        status,
        rejectionReason: reason,
      });

      Swal.fire({
        title: status === "approved" ? "Approved!" : "Rejected",
        text: `Document has been ${status}`,
        icon: status === "approved" ? "success" : "warning",
      });

      // Refresh application data
      fetchApplication();
    } catch (error) {
      Swal.fire("Error", "Failed to update document status", "error");
    } finally {
      setVerifyingDocId(null);
      setShowRejectModal(false);
      setRejectionReason("");
      setSelectedDocument(null);
    }
  };

  const openRejectModal = (doc) => {
    setSelectedDocument(doc);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  const handleSendEmail = async () => {
    if (!application || !application.isSelected) return;
    if (!emailSubject.trim() || !emailBody.trim()) {
      Swal.fire("Error", "Please fill subject and body", "error");
      return;
    }

    setSendingEmail(true);
    try {
      await axios.post(`/applications/send-offer-email/${id}`, {
        subject: emailSubject,
        body: emailBody,
      });

      Swal.fire(
        "Success!",
        `Offer email sent to ${application.candidate.emailAddress}`,
        "success",
      );
      setOfferEmailsSent((prev) => prev + 1);
      setShowOfferModal(false);
      fetchApplication();
    } catch (error) {
      Swal.fire("Error", "Failed to send email", "error");
    } finally {
      setSendingEmail(false);
    }
  };

  const openOfferModal = () => setShowOfferModal(true);
  const closeOfferModal = () => setShowOfferModal(false);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">
            Loading application details...
          </p>
        </div>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-500 text-xl">Application not found</p>
      </div>
    );
  }

  const isSelected =
    application.status === "selected" || application.isSelected;
  const documents = application.applicationDocuments?.documents || [];

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
              Application Details
            </h1>
            <p className="text-gray-500 mt-2 flex items-center gap-2">
              Application ID:{" "}
              <span className="font-mono font-medium">#{application.id}</span>
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div
              className={`px-6 py-3 rounded-2xl text-lg font-semibold flex items-center gap-2 ${
                isSelected
                  ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                  : "bg-amber-100 text-amber-700 border border-amber-200"
              }`}
            >
              {isSelected && <CheckCircle className="w-5 h-5" />}
              {application.status.toUpperCase()}
            </div>

            {isSelected && (
              <button
                onClick={openOfferModal}
                className="flex items-center gap-3 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3.5 rounded-2xl font-semibold transition-all active:scale-[0.97]"
              >
                <Send className="w-5 h-5" />
                Send Offer Email
                {offerEmailsSent > 0 && (
                  <span className="ml-1 bg-indigo-500 text-xs px-2 py-0.5 rounded-full">
                    {offerEmailsSent}
                  </span>
                )}
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Candidate Info */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 sticky top-8">
              <div className="flex items-center gap-5 mb-8">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white">
                  <UserCheck className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900">
                    {application.candidate.userName}
                  </h3>
                  <p className="text-gray-600 mt-1">
                    {application.candidate.emailAddress}
                  </p>
                </div>
              </div>

              {application.candidate.contactNumber && (
                <div className="flex items-center gap-3 text-gray-600 py-4 border-t border-gray-100">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span className="font-medium">
                    {application.candidate.contactNumber}
                  </span>
                </div>
              )}

              <div className="pt-6 border-t border-gray-100 mt-4">
                <p className="text-sm text-gray-500 mb-1">Applied On</p>
                <p className="font-medium text-gray-800">
                  {new Date(application.appliedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <div className="pt-6 border-t border-gray-100 mt-4">
                <p className="text-sm text-gray-500 mb-1">Last Updated</p>
                <p className="font-medium text-gray-800">
                  {new Date(application.updatedAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              {/* Upload Offer Letter Button */}

              {isSelected && !application?.coverLetter ? (
                <div className="mt-8">
                  <button
                    onClick={() => fileInputRef.current.click()}
                    className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl text-sm font-medium transition"
                  >
                    <Edit3 size={18} /> Upload Offer Letter
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      console.log("Selected file for upload:", application);
                      const formData = new FormData();
                      formData.append("offer-letter", file);

                      axios
                        .post(
                          `/applications/upload-cover-letter/${application?.id}`,
                          formData,
                          {
                            headers: {
                              "Content-Type": "multipart/form-data",
                            },
                          },
                        )
                        .then(() => {
                          Swal.fire(
                            "Success",
                            "Offer letter uploaded successfully",
                            "success",
                          );
                          fetchApplication();
                        })
                        .catch((err) => {
                          console.error(err);
                          Swal.fire(
                            "Error",
                            "Failed to upload offer letter",
                            "error",
                          );
                        })
                        .finally(() => {
                          e.target.value = "";
                        });
                    }}
                  />
                </div>
              ) : isSelected && application?.coverLetter ? (
                <div className="mt-8">
                  <p className="text-gray-600 mb-4">Offer Letter:</p>
                  <a
                    href={`https://api.careerkendra.com${application.coverLetter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline"
                  >
                    View Offer Letter
                  </a>
                </div>
              ) : null}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-8 space-y-8">
            {/* Job Details */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                Job Position
              </h2>
              <h3 className="text-3xl font-bold text-gray-800 mb-6">
                {application.job.jobTitle}
              </h3>
              {application.job.jobDescription && (
                <div className="prose prose-gray max-w-none text-gray-600 leading-relaxed">
                  {application.job.jobDescription}
                </div>
              )}
            </div>

            {parsedAnswers && Object.keys(parsedAnswers).length > 0 && (
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                  Screening Answers
                </h2>

                <div className="space-y-4">
                  {Object.entries(parsedAnswers).map(
                    ([question, answer], index) => (
                      <div
                        key={index}
                        className="border rounded-xl p-4 bg-gray-50"
                      >
                        <p className="font-medium text-gray-800">{question}</p>
                        <p className="text-amber-600 font-semibold mt-1">
                          {answer}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}

            {/* Uploaded Documents Section - NEW */}
            {/* <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
                  <FileText className="w-7 h-7" />
                  Uploaded Documents
                </h2>
                <span className="text-sm text-gray-500">
                  {documents.length} documents
                </span>
              </div>

              {documents.length === 0 ? (
                <p className="text-center py-12 text-gray-500">
                  No documents uploaded yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {documents.map((doc) => {
                    const isPending = doc.status === "pending";
                    const isApproved = doc.status === "approved";
                    const isRejected = doc.status === "rejected";

                    return (
                      <div
                        key={doc.type}
                        className="border border-gray-200 rounded-2xl p-6 hover:border-gray-300 transition-all"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <p className="font-medium text-gray-900 capitalize">
                              {doc.type.replace(/_/g, " ")}
                            </p>
                            <p className="text-sm text-gray-500 mt-1 truncate">
                              {doc.fileName}
                            </p>
                          </div>

                          <div
                            className={`px-4 py-1 text-xs font-medium rounded-full ${
                              isApproved
                                ? "bg-emerald-100 text-emerald-700"
                                : isRejected
                                  ? "bg-red-100 text-red-700"
                                  : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {doc.status.toUpperCase()}
                          </div>
                        </div>

                        {isRejected && doc.rejectionReason && (
                          <p className="text-red-600 text-sm bg-red-50 p-3 rounded-xl mb-4">
                            <strong>Reason:</strong> {doc.rejectionReason}
                          </p>
                        )}

                        <div className="flex gap-3">
                          <a
                            href={`https://api.careerkendra.com/${doc.filePath}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white py-3 rounded-xl text-sm font-medium transition"
                          >
                            <Eye size={18} /> View PDF
                          </a>

                          {isPending && (
                            <>
                              <button
                                onClick={() =>
                                  handleVerifyDocument(
                                    application?.applicationDocuments?.id,
                                    doc.type,
                                    "approved",
                                  )
                                }
                                disabled={
                                  verifyingDocId === (doc.id || doc.type)
                                }
                                className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white py-3 rounded-xl text-sm font-medium transition"
                              >
                                <ThumbsUp size={18} /> Approve
                              </button>

                              <button
                                onClick={() => openRejectModal(doc)}
                                className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white py-3 rounded-xl text-sm font-medium transition"
                              >
                                <ThumbsDown size={18} /> Reject
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div> */}

            {/* Final Offer Details */}
            {isSelected && (
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-3xl p-10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-10 h-10 bg-emerald-100 rounded-2xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-emerald-600" />
                  </div>
                  <h2 className="text-3xl font-semibold text-emerald-800">
                    Final Offer Details
                  </h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div>
                    <p className="text-emerald-700 text-sm font-medium tracking-widest">
                      FINAL SALARY
                    </p>
                    <p className="text-4xl font-bold text-emerald-700 mt-3">
                      ₹
                      {application.finalSalaryOffered?.toLocaleString() ||
                        "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-emerald-700 text-sm font-medium tracking-widest">
                      JOINING DATE
                    </p>
                    <p className="text-2xl font-semibold text-gray-800 mt-3">
                      {application.joiningDate
                        ? new Date(application.joiningDate).toLocaleDateString(
                            "en-IN",
                            { day: "numeric", month: "long", year: "numeric" },
                          )
                        : "Not Specified"}
                    </p>
                  </div>
                  {/* {console.log("application",application)} */}
                  {application.leavingDate && (
                    <div>
                      <p className="text-emerald-700 text-sm font-medium tracking-widest">
                        LEAVING DATE
                      </p>
                      <p className="text-2xl font-semibold text-gray-800 mt-3">
                        {application.leavingDate
                          ? new Date(
                              application.leavingDate,
                            ).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })
                          : "Not Specified"}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-emerald-700 text-sm font-medium tracking-widest">
                      DECIDED BY
                    </p>
                    <p className="text-2xl font-semibold text-gray-800 mt-3">
                      {application.decidedByEmployer?.employerName || "Admin"}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Interview History */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-8">
                Interview History
              </h2>

              {application.interviews && application.interviews.length > 0 ? (
                <div className="space-y-0">
                  {application.interviews
                    .sort((a, b) => a.round - b.round)
                    .map((interview, index) => {
                      const isLast =
                        index === application.interviews.length - 1;

                      const statusConfig = {
                        scheduled: {
                          label: "Scheduled",
                          cls: "bg-blue-100 text-blue-800",
                        },
                        completed: {
                          label: "Completed",
                          cls: "bg-emerald-100 text-emerald-800",
                        },
                        in_progress: {
                          label: "In Progress",
                          cls: "bg-indigo-100 text-indigo-800",
                        },
                        cancelled: {
                          label: "Cancelled",
                          cls: "bg-red-100 text-red-800",
                        },
                        rescheduled: {
                          label: "Rescheduled",
                          cls: "bg-amber-100 text-amber-800",
                        },
                        hold: {
                          label: "On Hold",
                          cls: "bg-amber-100 text-amber-800",
                        },
                        no_show: {
                          label: "No Show",
                          cls: "bg-gray-100 text-gray-700",
                        },
                      };

                      const resultConfig = {
                        pass: {
                          label: "Passed",
                          cls: "bg-emerald-100 text-emerald-800",
                        },
                        fail: {
                          label: "Failed",
                          cls: "bg-red-100 text-red-800",
                        },
                        next_round: {
                          label: "Next Round",
                          cls: "bg-indigo-100 text-indigo-800",
                        },
                      };

                      const st =
                        statusConfig[interview.status] ??
                        statusConfig.scheduled;
                      const rs = interview.result
                        ? resultConfig[interview.result]
                        : null;

                      return (
                        <div
                          key={interview.id}
                          className={`relative pl-10 pb-10 ${!isLast ? "border-l-2 border-indigo-200" : ""}`}
                        >
                          {/* Timeline dot */}
                          <div className="absolute -left-[7px] top-2 w-5 h-5 bg-white border-4 border-indigo-500 rounded-full" />

                          {/* Header Row */}
                          <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                            <div>
                              <span className="inline-flex items-center bg-indigo-100 text-indigo-700 px-4 py-1 rounded-full text-sm font-semibold">
                                Round {interview.round}
                              </span>
                              <p className="text-xl font-medium text-gray-900 mt-3">
                                {interview.interviewType?.toUpperCase()}{" "}
                                Interview
                              </p>
                            </div>

                            {/* Badges */}
                            <div className="flex flex-wrap gap-2 items-center">
                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${st.cls}`}
                              >
                                {st.label}
                              </span>
                              {rs && (
                                <span
                                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${rs.cls}`}
                                >
                                  {rs.label}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Meta info */}
                          <div className="mt-4 space-y-2 text-sm text-gray-500">
                            {/* Date */}
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 shrink-0" />
                              {new Date(interview.scheduledAt).toLocaleString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                },
                              )}
                            </div>

                            {/* Completed at */}
                            {interview.completedAt && (
                              <div className="flex items-center gap-2 text-emerald-600">
                                <CheckCircle className="w-4 h-4 shrink-0" />
                                Completed on{" "}
                                {new Date(interview.completedAt).toLocaleString(
                                  "en-IN",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </div>
                            )}

                            {/* Online — meeting link */}
                            {interview.interviewType === "online" &&
                              interview.meetingLink && (
                                <div className="flex items-center gap-2">
                                  <LinkIcon className="w-4 h-4 shrink-0" />
                                  <a
                                    href={interview.meetingLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-indigo-600 hover:underline truncate"
                                  >
                                    {interview.meetingLink}
                                  </a>
                                </div>
                              )}

                            {/* Offline — location */}
                            {interview.interviewType === "offline" &&
                              interview.location && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4 shrink-0" />
                                  {interview.location}
                                </div>
                              )}

                            {/* Interviewer name */}
                            {interview.meetingPerson && (
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 shrink-0" />
                                Interviewer: {interview.meetingPerson}
                              </div>
                            )}
                          </div>

                          {/* ---- Reason boxes ---- */}

                          {/* Hold reason */}
                          {interview.status === "hold" &&
                            interview.holdReason && (
                              <div className="mt-5 bg-amber-50 border border-amber-200 rounded-2xl p-5">
                                <p className="text-xs font-semibold tracking-widest text-amber-700 mb-2">
                                  HOLD REASON
                                </p>
                                <p className="text-sm text-amber-900">
                                  {interview.holdReason}
                                </p>
                              </div>
                            )}

                          {/* Cancel reason */}
                          {interview.status === "cancelled" &&
                            interview.cancelReason && (
                              <div className="mt-5 bg-red-50 border border-red-200 rounded-2xl p-5">
                                <p className="text-xs font-semibold tracking-widest text-red-700 mb-2">
                                  CANCELLATION REASON
                                </p>
                                <p className="text-sm text-red-900">
                                  {interview.cancelReason}
                                </p>
                              </div>
                            )}

                          {/* Reschedule reason */}
                          {interview.status === "rescheduled" &&
                            interview.rescheduleReason && (
                              <div className="mt-5 bg-amber-50 border border-amber-200 rounded-2xl p-5">
                                <p className="text-xs font-semibold tracking-widest text-amber-700 mb-2">
                                  RESCHEDULE REASON
                                </p>
                                <p className="text-sm text-amber-900">
                                  {interview.rescheduleReason}
                                </p>
                              </div>
                            )}

                          {/* Feedback */}
                          {interview.feedback && (
                            <div className="mt-5 bg-gray-50 border border-gray-100 rounded-2xl p-5">
                              <p className="text-xs font-semibold tracking-widest text-gray-500 mb-2">
                                FEEDBACK
                              </p>
                              <p className="text-sm text-gray-700">
                                {interview.feedback}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                </div>
              ) : (
                <p className="text-center py-20 text-gray-400">
                  No interviews conducted yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ==================== REJECT DOCUMENT MODAL ==================== */}
      {showRejectModal && selectedDocument && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[110] p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md">
            <div className="p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">
                Reject Document
              </h3>
              <p className="text-gray-600 mb-6">
                {selectedDocument.type.replace(/_/g, " ")}
              </p>

              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                className="w-full h-40 border border-gray-300 rounded-2xl p-5 focus:outline-none focus:ring-2 focus:ring-red-500 resize-y"
              />

              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 py-4 border border-gray-300 rounded-2xl font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() =>
                    handleVerifyDocument(
                      application?.applicationDocuments?.id,
                      selectedDocument.type,
                      "rejected",
                      rejectionReason,
                    )
                  }
                  disabled={!rejectionReason.trim()}
                  className="flex-1 py-4 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium rounded-2xl transition"
                >
                  Reject Document
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Offer Email Modal with Jodit Editor */}
      {showOfferModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-8 border-b">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center">
                  <Mail className="w-7 h-7 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-3xl font-semibold text-gray-900">
                    Send Offer Letter
                  </h2>
                  <p className="text-gray-500 mt-1">
                    To:{" "}
                    <span className="font-medium">
                      {application.candidate.emailAddress}
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={closeOfferModal}
                className="text-gray-400 hover:text-gray-600 p-2 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X className="w-8 h-8" />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 p-8 overflow-auto">
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Email Subject
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full px-6 py-4 text-lg border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Congratulations! You have been selected..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Email Body (Rich Text)
                  </label>
                  <div className="border border-gray-300 rounded-3xl overflow-hidden">
                    <JoditEditor
                      ref={editor}
                      value={emailBody}
                      config={joditConfig}
                      onBlur={(newContent) => setEmailBody(newContent)}
                      onChange={(newContent) => {}}
                    />
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-sm">
                  <strong className="text-amber-800">Note:</strong> The
                  candidate is expected to reply with the following documents:
                  <ul className="list-disc list-inside mt-3 space-y-1 text-amber-700">
                    <li>Signed Offer Letter</li>
                    <li>Latest Salary Slips (last 3 months)</li>
                    <li>Educational & Experience Certificates</li>
                    <li>ID Proof & Bank Details</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t p-8 flex gap-4">
              <button
                onClick={closeOfferModal}
                className="flex-1 py-4 text-gray-700 font-semibold border border-gray-300 rounded-2xl hover:bg-gray-50 transition-colors"
                disabled={sendingEmail}
              >
                Cancel
              </button>
              <button
                onClick={handleSendEmail}
                disabled={
                  sendingEmail || !emailSubject.trim() || !emailBody.trim()
                }
                className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white font-semibold rounded-2xl transition-all flex items-center justify-center gap-3 text-lg"
              >
                {sendingEmail ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent animate-spin rounded-full" />
                    Sending Email...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    Send Offer Email
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewApplications;
