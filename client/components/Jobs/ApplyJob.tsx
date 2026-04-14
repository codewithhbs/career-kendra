"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import axios from "axios";
import { format } from "date-fns";
import { useAuthStore } from "@/store/auth.store";
import { API_URL, IMAGE_URL } from "@/constant/api";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MapPin, Upload, FileText, CheckCircle2, X, Eye } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import Confetti from "react-confetti";
import Link from "next/link";

axios.defaults.baseURL = API_URL;

interface ScreeningQuestion {
  id: string;
  question: string;
  type: "boolean" | "multiple-choice" | "text";
  options?: string[];
  required: boolean;
}

export default function ApplyJob() {
  const { id: slug } = useParams<{ id: string }>();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { profile, getProfile, token, isAuthenticated } = useAuthStore();

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedCvFile, setSelectedCvFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cvUploading, setCvUploading] = useState(false);
  const [applying, setApplying] = useState(false);
  const [showThankYou, setShowThankYou] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);

  const [answers, setAnswers] = useState({});
  const [showQuestionsPopup, setShowQuestionsPopup] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getProfile();
  }, [getProfile]);

  useEffect(() => {
    if (!isAuthenticated || !slug) return;

    const fetchJob = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/jobs/job-via/${slug}`);
        console.log("Fetched job details:", res.data.data);
        if (res.data?.success && res.data?.data) {
          setJob(res.data.data);
        } else {
          setError("Job not found");
        }
      } catch (err) {
        console.error("Failed to fetch job:", err);
        setError("Failed to load job details");
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [slug, isAuthenticated]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Only PDF files are allowed.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB.");
      return;
    }

    setSelectedCvFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (
      file &&
      file.type === "application/pdf" &&
      file.size <= 5 * 1024 * 1024
    ) {
      setSelectedCvFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      alert("Please drop a valid PDF file (max 5MB).");
    }
  };

  const uploadNewCv = async () => {
    if (!selectedCvFile || !token) return false;
    setCvUploading(true);

    const formData = new FormData();
    formData.append("cv", selectedCvFile);

    try {
      const res = await axios.put(`${API_URL}/auth/update-cv`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      if (res.data?.success) {
        alert("CV uploaded successfully!");
        getProfile(); // refresh profile
        setSelectedCvFile(null);
        setPreviewUrl(null);
        return true;
      }
      return false;
    } catch (err) {
      console.error("CV upload failed:", err);
      alert("Failed to upload CV. Please try again.");
      return false;
    } finally {
      setCvUploading(false);
    }
  };

  const handleApply = async () => {
    if (!token) {
      alert("Please login to apply.");
      return;
    }

    let cvReady = !!profile?.user?.uploadedCv;
    if (selectedCvFile) {
      cvReady = await uploadNewCv();
    }

    if (!cvReady) {
      alert("Please upload a CV before applying.");
      return;
    }

    if (job?.screeningQuestions?.length > 0) {
      setShowQuestionsPopup(true);
    } else {
      await submitApplication({});
    }
  };

  const submitApplication = async (screeningAnswers: Record<string, any>) => {
    try {
      setApplying(true);

      const res = await axios.post(
        `/applications/apply-job/${job?.id}`,
        { screeningAnswers },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      setShowQuestionsPopup(false);
      setConfettiActive(true);
      setShowThankYou(true);

      setTimeout(() => setConfettiActive(false), 5000);
      setTimeout(() => router.push("/jobs"), 4000);
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to submit application");
    } finally {
      setApplying(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const viewCurrentCv = () => {
    if (profile?.user?.uploadedCv) {
      const url = `${IMAGE_URL}${profile.user.uploadedCv}`;
      window.open(url, "_blank");
    }
  };

  const formatSalary = () => {
    if (!job) return "Not disclosed";
    if (job.hideSalary) return "Confidential";

    const min = job.salaryMin?.toLocaleString("en-IN") ?? "";
    const max = job.salaryMax?.toLocaleString("en-IN") ?? "";
    const range = min && max ? `${min} – ${max}` : min || max;
    const period = job.salaryType === "monthly" ? "/mo" : "/yr";

    return `${job.currency} ${range}${period}`;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-amber-50/50 flex items-center justify-center px-5 py-12">
        <div className="w-full max-w-md animate-fade-in">
          <div className="bg-white rounded-3xl shadow-xl border border-amber-100/60 overflow-hidden">
            {/* Top accent bar */}
            <div className="h-2 bg-gradient-to-r from-amber-500 to-amber-600" />

            <div className="p-8 lg:p-10 text-center">
              {/* Icon */}
              <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              {/* Title */}
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
                Login Required
              </h2>

              {/* Message */}
              <p className="text-gray-600 text-lg mb-8 leading-relaxed">
                You need to be signed in to apply for this job and let employers
                see your profile and CV.
              </p>

              {/* Main CTA */}
              <Button
                size="lg"
                className="w-full h-14 text-base font-semibold bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300 mb-6"
                asChild
              >
                <a
                  href={`/auth/login?returnTo=${encodeURIComponent(
                    pathname +
                      (searchParams.toString()
                        ? `?${searchParams.toString()}`
                        : ""),
                  )}`}
                >
                  Sign in to Apply
                </a>
              </Button>

              {/* Secondary action */}
              <p className="text-sm text-gray-500 mb-2">
                Don't have an account yet?
              </p>
              <Button
                variant="link"
                className="text-amber-700 hover:text-amber-800 font-medium"
                asChild
              >
                <a href="/auth/register">Create a free account →</a>
              </Button>

              {/* Browse link */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 hover:text-gray-900"
                  asChild
                >
                  <Link href="/jobs">← Continue browsing jobs</Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Optional subtle footer text */}
          <p className="text-center text-sm text-gray-500 mt-6">
            Your next dream job is just a login away
          </p>
        </div>

        {/* Optional: very subtle background pattern or animation */}
        <style jsx global>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .animate-fade-in {
            animation: fadeInUp 0.7s ease-out forwards;
          }
        `}</style>
      </div>
    );
  }
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-amber-600"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5 text-center">
        <div className="max-w-md">
          <h2 className="text-2xl font-bold mb-4">
            {error || "Job not found"}
          </h2>
          <Button className="bg-amber-600 hover:bg-amber-700" asChild>
            <a href="/jobs">Back to Jobs</a>
          </Button>
        </div>
      </div>
    );
  }

  const companyInitials = job.company.companyName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pb-24 md:pb-16">
      <div className="container max-w-7xl mx-auto px-5 sm:px-6 lg:px-10 pt-8 lg:pt-12">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Main Content */}
          <div className="lg:col-span-9">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-md overflow-hidden">
              {/* Job Header */}
              <div className="p-6 lg:p-9 border-b bg-gradient-to-r from-amber-50/40 to-white">
                <div className="flex flex-col sm:flex-row gap-6">
                  <Avatar className="h-20 w-20 lg:h-24 lg:w-24 rounded-xl border-2 border-amber-200">
                    <AvatarImage
                      src={`${IMAGE_URL}${job.company.companyLogo}`}
                      alt={job.company.companyName}
                    />
                    <AvatarFallback className="bg-amber-500 text-white text-2xl font-bold">
                      {companyInitials}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                      {job.jobTitle}
                    </h1>
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-gray-700 mb-4">
                      <span className="font-semibold text-amber-700 text-lg">
                        {job.company.companyName}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-5 w-5 text-gray-600" />
                        {job.locationText}
                      </div>
                      <div className="font-medium text-gray-800">
                        {formatSalary()}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Badge className="bg-amber-100 text-amber-800 px-4 py-1.5">
                        {job.jobType}
                      </Badge>
                      <Badge className="bg-amber-100 text-amber-800 px-4 py-1.5">
                        {job.experienceMin}-{job.experienceMax} years
                      </Badge>
                      <Badge className="bg-amber-100 text-amber-800 px-4 py-1.5">
                        {job.workMode}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* CV Upload / Management Section */}
              <div className="p-6 lg:p-10 border-b">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Your CV for Application
                </h2>

                <div className="space-y-6">
                  {/* Already uploaded CV from profile */}
                  {profile?.user?.uploadedCv && !selectedCvFile && (
                    <div className="bg-green-50/40 border border-green-200 rounded-2xl p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="flex items-center gap-5">
                          <FileText className="h-10 w-10 text-green-600" />
                          <div>
                            <p className="font-medium text-green-800 flex items-center gap-2">
                              <CheckCircle2 size={18} /> CV already uploaded
                            </p>
                            <button
                              onClick={viewCurrentCv}
                              className="text-amber-600 hover:text-amber-800 text-sm flex items-center gap-1.5 mt-1.5"
                            >
                              <Eye size={16} /> View current CV
                            </button>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          Replace CV
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* New selected file preview */}
                  {selectedCvFile && (
                    <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="flex items-center gap-5 min-w-0">
                          <FileText className="h-10 w-10 text-amber-600 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {selectedCvFile.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {(selectedCvFile.size / 1024 / 1024).toFixed(2)}{" "}
                              MB • PDF
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedCvFile(null);
                              setPreviewUrl(null);
                            }}
                          >
                            <X size={18} /> Remove
                          </Button>
                          <Button
                            size="sm"
                            className="bg-amber-600 hover:bg-amber-700"
                            onClick={uploadNewCv}
                            disabled={cvUploading}
                          >
                            {cvUploading ? "Uploading..." : "Upload"}
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Drag & Drop / Click area */}
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-10 lg:p-12 text-center cursor-pointer transition-all ${
                      selectedCvFile
                        ? "border-green-300 bg-green-50/30"
                        : "border-gray-300 hover:border-amber-400 hover:bg-amber-50/30"
                    }`}
                  >
                    <Upload className="mx-auto h-10 w-10 text-amber-600 mb-4" />
                    <p className="text-lg font-medium text-gray-800 mb-1">
                      {selectedCvFile
                        ? "Replace with new file"
                        : "Upload or drag your CV here"}
                    </p>
                    <p className="text-sm text-gray-500">
                      PDF format • maximum 5 MB
                    </p>
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Button Area */}
              <div className="p-6 lg:p-9 bg-gray-50 flex justify-end">
                <Button
                  onClick={handleApply}
                  disabled={
                    applying ||
                    cvUploading ||
                    (!profile?.user?.uploadedCv && !selectedCvFile)
                  }
                  size="lg"
                  className="px-12 py-7 text-lg font-semibold bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 shadow-md disabled:opacity-50"
                >
                  {applying ? (
                    <span className="flex items-center gap-2">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Applying...
                    </span>
                  ) : (
                    "Submit Application"
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Sidebar placeholder (you can add similar jobs later) */}
          <div className="lg:col-span-3 hidden lg:block">
            <div className="sticky top-10 bg-white rounded-2xl border p-6 shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Need help?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Make sure your CV is up-to-date and highlights relevant skills
                like React, Next.js, Node.js, etc.
              </p>
              <Button variant="outline" className="w-full">
                View Job Details Again
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile fixed apply bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-2xl p-4 md:hidden z-50">
        <Button
          onClick={handleApply}
          disabled={
            applying ||
            cvUploading ||
            (!profile?.user?.uploadedCv && !selectedCvFile)
          }
          className="w-full h-12 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800"
        >
          {applying ? "Submitting..." : "Submit Application"}
        </Button>
      </div>

      {/* ==================== SCREENING QUESTIONS DIALOG ==================== */}
      <Dialog open={showQuestionsPopup} onOpenChange={setShowQuestionsPopup}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Screening Questions</DialogTitle>
            <DialogDescription>
              Please answer the following questions to complete your
              application.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4 space-y-8 pr-2">
            {job?.screeningQuestions?.map((q: ScreeningQuestion) => (
              <div key={q.id} className="space-y-3">
                <Label className="text-base font-medium">
                  {q.question}
                  {q.required && <span className="text-red-500 ml-1">*</span>}
                </Label>

                {q.type === "text" ? (
                  <Textarea
                    placeholder="Type your answer here..."
                    value={answers[q.id] || ""}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    className="min-h-24"
                  />
                ) : (
                  <div className="space-y-2">
                    {q.options?.map((option, i) => (
                      <label
                        key={i}
                        className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition"
                      >
                        <input
                          type="radio"
                          name={`question-${q.id}`}
                          value={option}
                          checked={answers[q.id] === option}
                          onChange={() => handleAnswerChange(q.id, option)}
                          className="w-4 h-4 accent-amber-600"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <DialogFooter className="pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setShowQuestionsPopup(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                const allAnswered = job.screeningQuestions.every(
                  (q: ScreeningQuestion) =>
                    !q.required || answers[q.id]?.trim(),
                );

                if (!allAnswered) {
                  alert("Please answer all required questions.");
                  return;
                }

                submitApplication(answers);
              }}
              disabled={applying}
            >
              {applying ? "Submitting..." : "Submit Application"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success confetti + dialog */}
      {confettiActive && (
        <div className="fixed inset-0 pointer-events-none z-[9999]">
          <Confetti
            width={window.innerWidth}
            height={window.innerHeight}
            recycle={false}
          />
        </div>
      )}

      <Dialog
        open={showThankYou}
        onOpenChange={(open) => !open && router.push("/jobs")}
      >
        <DialogContent className="sm:max-w-md text-center">
          <CheckCircle2 className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <DialogTitle className="text-2xl font-bold">
            Application Submitted!
          </DialogTitle>
          <DialogDescription className="mt-3">
            Thank you for applying to <strong>{job.jobTitle}</strong> at{" "}
            <span className="font-medium">{job.company.companyName}</span>.
          </DialogDescription>
          <DialogFooter className="sm:justify-center mt-6 gap-4">
            <Button variant="outline" onClick={() => router.push("/jobs")}>
              Browse More Jobs
            </Button>
            <Button
              className="bg-amber-600 hover:bg-amber-700"
              onClick={() => router.push("/jobs")}
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
