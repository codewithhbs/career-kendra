"use client";

import { API_URL } from "@/constant/api";
import { useEmployerAuthStore } from "@/store/employerAuth.store";
import axios from "axios";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import {
  Briefcase,
  Users,
  Calendar,
  UserCheck,
  Eye,
  Clock,
  MapPin,
  Link as LinkIcon,
  CheckCircle,
  Pencil,
  RefreshCw,
  Video,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  XCircle,
  Building2,
  Mail,
  CalendarDays,
  Phone,
  IndianRupee,
} from "lucide-react";
import { useRouter } from "next/navigation";

axios.defaults.baseURL = API_URL;

/* ============================================================
   TYPES
   ============================================================ */
type InterviewType = "online" | "offline" | "phone";
type InterviewStatus = "scheduled" | "completed" | "cancelled" | "rescheduled";
type InterviewResult = "pass" | "fail" | "";

interface ScheduleForm {
  round: number;
  interviewType: InterviewType;
  scheduledAt: string;
  meetingLink: string;
  location: string;
  meetingPerson: string;
}

interface UpdateForm {
  round: number;
  interviewType: InterviewType;
  scheduledAt: string;
  meetingLink: string;
  location: string;
  meetingPerson: string;
  notes: string;
  status: InterviewStatus | "";
  feedback: string;
  result: InterviewResult;
  cancelReason: string;
  rescheduleReason: string;
}

interface FinalDecisionForm {
  finalSalaryOffered: string;
  joiningDate: string;
  comment: string;
}

/* ============================================================
   STATUS CONFIG
   ============================================================ */
const statusConfig: Record<
  string,
  { label: string; color: string; icon: any }
> = {
  scheduled: {
    label: "Scheduled",
    color: "bg-blue-100 text-blue-700",
    icon: Clock,
  },
  completed: {
    label: "Completed",
    color: "bg-emerald-100 text-emerald-700",
    icon: CheckCircle,
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-700",
    icon: XCircle,
  },
  rescheduled: {
    label: "Rescheduled",
    color: "bg-amber-100 text-amber-700",
    icon: RefreshCw,
  },
  hold: {
    label: "On Hold",
    color: "bg-amber-100 text-amber-700",
    icon: Clock,
  },
};

const resultConfig: Record<string, { label: string; color: string }> = {
  pass: { label: "Passed", color: "text-emerald-700 bg-emerald-100" },
  fail: { label: "Failed", color: "text-red-700 bg-red-100" },
};

/* ============================================================
   MAIN COMPONENT
   ============================================================ */
const AllApplications = () => {
  const { token } = useEmployerAuthStore();
  const router = useRouter();
  const [jobs, setJobs] = useState<any[]>([]);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Modals
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showFinalDecisionModal, setShowFinalDecisionModal] = useState(false);
  const [selectedApplicationId, setSelectedApplicationId] = useState<
    string | null
  >(null);
  const [selectedAppForView, setSelectedAppForView] = useState<any>(null);
  const [selectedInterviewForUpdate, setSelectedInterviewForUpdate] =
    useState<any>(null);
  const [pendingFinalAppId, setPendingFinalAppId] = useState<string | null>(
    null,
  );

  const [showLeavingDateModal, setShowLeavingDateModal] = useState(false);
  const [leavingDateAppId, setLeavingDateAppId] = useState<string | null>(null);
  const [leavingDate, setLeavingDate] = useState("");

  // Forms
  const [scheduleForm, setScheduleForm] = useState<ScheduleForm>({
    round: 2,
    interviewType: "online",
    scheduledAt: "",
    meetingLink: "",
    location: "",
    meetingPerson: "",
  });

  const [updateForm, setUpdateForm] = useState<UpdateForm>({
    round: 1,
    interviewType: "online",
    scheduledAt: "",
    meetingLink: "",
    location: "",
    meetingPerson: "",
    notes: "",
    status: "",
    feedback: "",
    result: "",
    cancelReason: "",
    rescheduleReason: "",
    holdReason: "",
  });

  const [finalDecisionForm, setFinalDecisionForm] = useState<FinalDecisionForm>(
    {
      finalSalaryOffered: "",
      joiningDate: "",
      comment: "",
    },
  );

  /* ---- FETCH ---- */
  const fetchJobs = async () => {
    if (!token) return;
    try {
      const res = await axios.get("/jobs", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const jobsData = res.data?.data?.jobs || [];
      setJobs(jobsData);
      if (jobsData.length > 0 && !selectedJobId) {
        setSelectedJobId(jobsData[0].id);
      }
    } catch {
      Swal.fire("Error", "Failed to fetch jobs", "error");
    }
  };

  const fetchApplications = async () => {
    if (!selectedJobId || !token) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `/applications/get-all-applications-for-employer/${selectedJobId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      setApplications(res.data?.applications || []);
    } catch {
      Swal.fire("Error", "Failed to fetch applications", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateLeavingDate = async () => {
    if (!leavingDateAppId || !leavingDate) {
      Swal.fire("Warning", "Please select a leaving date", "warning");
      return;
    }
    try {
      await axios.put(
        `/applications/update-leave-date/${leavingDateAppId}`,
        { leavingDate },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      Swal.fire("Success", "Leaving date updated successfully!", "success");
      setShowLeavingDateModal(false);
      fetchApplications();
    } catch (error: any) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "Failed to update",
        "error",
      );
    }
  };

  const hasRound2 = (app: any) =>
    app.interviews?.some((i: any) => i.round === 2);

  /* ---- SCHEDULE ---- */
  const openScheduleModal = (applicationId: string) => {
    setSelectedApplicationId(applicationId);
    setScheduleForm({
      round: 2,
      interviewType: "online",
      scheduledAt: "",
      meetingLink: "",
      location: "",
      meetingPerson: "",
    });
    setShowScheduleModal(true);
  };

  const handleCreateInterview = async () => {
    if (!selectedApplicationId || !scheduleForm.scheduledAt) {
      Swal.fire("Warning", "Please select date & time", "warning");
      return;
    }

    try {
      await axios.post(
        `/applications/create-interview/${selectedApplicationId}`,
        {
          round: scheduleForm.round,
          interviewType: scheduleForm.interviewType,
          scheduledAt: scheduleForm.scheduledAt,
          meetingLink: scheduleForm.meetingLink || null,
          location: scheduleForm.location || null,
          meetingPerson: scheduleForm.meetingPerson || null,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      Swal.fire("Success", "Round 2 interview scheduled!", "success");
      setShowScheduleModal(false);
      fetchApplications();
    } catch (error: any) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "Failed to schedule",
        "error",
      );
    }
  };

  /* ---- UPDATE INTERVIEW ---- */
  const openUpdateModal = (interview: any) => {
    setSelectedInterviewForUpdate(interview);
    setUpdateForm({
      round: interview.round,
      interviewType: interview.interviewType,
      scheduledAt: interview.scheduledAt
        ? new Date(interview.scheduledAt).toISOString().slice(0, 16)
        : "",
      meetingLink: interview.meetingLink || "",
      location: interview.location || "",
      meetingPerson: interview.meetingPerson || "",
      notes: interview.notes || "",
      status: interview.status || "",
      feedback: interview.feedback || "",
      result: interview.result || "",
      cancelReason: "",
      rescheduleReason: "",
      holdReason: "",
    });
    setShowUpdateModal(true);
  };

  const handleUpdateInterview = async () => {
    if (!selectedInterviewForUpdate) return;

    if (updateForm.status === "cancelled" && !updateForm.cancelReason) {
      Swal.fire("Warning", "Cancel reason is required", "warning");
      return;
    }
    if (updateForm.status === "rescheduled" && !updateForm.scheduledAt) {
      Swal.fire(
        "Warning",
        "New date/time is required for rescheduling",
        "warning",
      );
      return;
    }
    if (updateForm.status === "rescheduled" && !updateForm.rescheduleReason) {
      Swal.fire("Warning", "Reschedule reason is required", "warning");
      return;
    }
    if (updateForm.status === "hold" && !updateForm.holdReason) {
      Swal.fire("Warning", "Hold reason is required", "warning");
      return;
    }

    try {
      const payload: any = {
        round: updateForm.round,
        interviewType: updateForm.interviewType,
        scheduledAt: updateForm.scheduledAt,
        meetingLink: updateForm.meetingLink || null,
        location: updateForm.location || null,
        meetingPerson: updateForm.meetingPerson || null,
        notes: updateForm.notes || null,
        status: updateForm.status || undefined,
        feedback: updateForm.feedback || null,
        result: updateForm.result || null,
      };

      if (updateForm.status === "cancelled")
        payload.cancelReason = updateForm.cancelReason;
      if (updateForm.status === "rescheduled")
        payload.rescheduleReason = updateForm.rescheduleReason;
      if (updateForm.status === "hold")
        payload.holdReason = updateForm.holdReason;

      await axios.put(
        `/applications/update-interview/${selectedInterviewForUpdate.id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      Swal.fire("Success", "Interview updated successfully!", "success");
      setShowUpdateModal(false);
      fetchApplications();
    } catch (error: any) {
      Swal.fire(
        "Error",
        error.response?.data?.message || "Failed to update",
        "error",
      );
    }
  };

  /* ---- VIEW ---- */
  const openViewInterviews = (app: any) => {
    setSelectedAppForView(app);
    setShowViewModal(true);
  };

  /* ---- FINAL DECISION ---- */
  const handleFinalDecision = (applicationId: string) => {
    setPendingFinalAppId(applicationId);
    setFinalDecisionForm({
      finalSalaryOffered: "",
      joiningDate: "",
      comment: "",
    });
    setShowFinalDecisionModal(true);
  };

  const handleConfirmFinalDecision = async () => {
    if (!pendingFinalAppId) return;
    setShowFinalDecisionModal(false);

    try {
      await axios.put(
        `/applications/final-decision/${pendingFinalAppId}`,
        {
          decision: "selected",
          finalSalaryOffered: finalDecisionForm.finalSalaryOffered
            ? Number(finalDecisionForm.finalSalaryOffered)
            : null,
          joiningDate: finalDecisionForm.joiningDate || null,
          comment: finalDecisionForm.comment || null,
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );

      Swal.fire("Success", "Candidate selected successfully!", "success");
      fetchApplications();
    } catch (error: any) {
      Swal.fire("Error", error.response?.data?.message || "Failed", "error");
    }
  };

  /* ---- EFFECTS ---- */
  useEffect(() => {
    fetchJobs();
  }, [token]);

  useEffect(() => {
    if (selectedJobId) fetchApplications();
  }, [selectedJobId]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 space-y-8">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <p className="text-sm font-medium text-gray-500 tracking-wide">
              HIRING PIPELINE
            </p>
            <h1 className="text-4xl font-bold text-gray-900 tracking-tight">
              Final Shortlisted{" "}
              <span className="text-indigo-600">Candidates</span>
            </h1>
            <p className="text-gray-600 mt-2">
              Manage interviews and make final hiring decisions
            </p>
          </div>

          {/* Job Selector */}
          <div className="w-full sm:w-80">
            <Select
              value={selectedJobId || ""}
              onValueChange={setSelectedJobId}
            >
              <SelectTrigger className="bg-white border-gray-200">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  <SelectValue placeholder="Select job position" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {jobs.map((job: any) => (
                  <SelectItem key={job.id} value={job.id}>
                    {job.jobTitle}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* STATS */}
        {!loading && applications.length > 0 && (
          <div className="flex flex-wrap gap-4">
            {[
              {
                label: "Total Candidates",
                value: applications.length,
                color: "text-indigo-600",
              },
              {
                label: "With Round 2",
                value: applications.filter((a) => hasRound2(a)).length,
                color: "text-emerald-600",
              },
              {
                label: "Pending Round 2",
                value: applications.filter((a) => !hasRound2(a)).length,
                color: "text-amber-600",
              },
            ].map((stat) => (
              <Card key={stat.label} className="flex-1 min-w-[180px]">
                <CardContent className="p-5 flex items-center gap-4">
                  <div
                    className={`w-3 h-3 rounded-full ${stat.color.replace("text", "bg")}`}
                  />
                  <div>
                    <p className="text-sm text-gray-500">{stat.label}</p>
                    <p className={`text-2xl font-semibold ${stat.color}`}>
                      {stat.value}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* APPLICATIONS GRID */}
        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="h-80 animate-pulse" />
            ))}
          </div>
        ) : applications.length === 0 ? (
          <Card className="py-24 text-center">
            <CardContent>
              <Users className="w-16 h-16 mx-auto text-gray-300 mb-6" />
              <h3 className="text-2xl font-semibold text-gray-700">
                No Candidates Yet
              </h3>
              <p className="text-gray-500 mt-3 max-w-md mx-auto">
                Candidates in the final shortlist for this position will appear
                here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {applications.map((app: any) => {
              const roundTwo = hasRound2(app);
              const totalInterviews = app.interviews?.length || 0;

              return (
                <Card
                  key={app.id}
                  className="hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200"
                >
                  <CardContent className="p-4 space-y-2">
                    {/* Candidate Info */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-xl">
                          {app.candidate?.userName?.charAt(0)?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-lg text-gray-900">
                            {app.candidate?.userName}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5" />{" "}
                            {app.candidate?.emailAddress}
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="secondary"
                        className="bg-indigo-100 text-indigo-700 font-medium"
                      >
                        {app.isSelected ? "Selected" : app?.status}
                      </Badge>
                    </div>

                    {/* Job Title */}
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Briefcase className="w-4 h-4" />
                      {app.job?.jobTitle}
                    </div>
                    {app.offerEmailSent && (
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <Mail className="w-4 h-4" />
                        Offer Email Sent
                        <p>
                          {app.offerEmailSentAt
                            ? new Date(app.offerEmailSentAt).toLocaleDateString(
                                "en-IN",
                                {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                },
                              )
                            : "—"}
                        </p>
                      </div>
                    )}

                    {app.joiningDate && (
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <Calendar className="w-4 h-4" />
                        Joining Date:{" "}
                        {new Date(app.joiningDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    )}

                    {app.leavingDate && (
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <Calendar className="w-4 h-4" />
                        Leaving Date:{" "}
                        {new Date(app.leavingDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                    )}

                    {/* Interview Summary */}
                    <div className="bg-gray-50 rounded-xl p-4 flex gap-6">
                      <div className="text-center">
                        <p className="text-3xl font-bold text-indigo-600">
                          {totalInterviews}
                        </p>
                        <p className="text-xs text-gray-500 tracking-widest">
                          ROUNDS
                        </p>
                      </div>
                      <div className="flex-1 flex flex-wrap gap-2 items-center">
                        {app.interviews?.slice(0, 3).map((iv: any) => {
                          const cfg =
                            statusConfig[iv.status] || statusConfig.scheduled;
                          return (
                            <Badge key={iv.id} className={cfg.color}>
                              R{iv.round}
                            </Badge>
                          );
                        })}
                        {!totalInterviews && (
                          <p className="text-sm text-gray-400">
                            No interviews scheduled
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3 pt-2">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => openViewInterviews(app)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Interview History
                      </Button>

                      {!roundTwo && (
                        <Button
                          className="w-full bg-indigo-600 hover:bg-indigo-700"
                          onClick={() => openScheduleModal(app.id)}
                        >
                          <CalendarDays className="w-4 h-4 mr-2" />
                          Schedule Round 2
                        </Button>
                      )}

                      {!app.isSelected && (
                        <Button
                          onClick={() => handleFinalDecision(app.id)}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                          <UserCheck className="w-4 h-4 mr-2" />
                          Final Select Candidate
                        </Button>
                      )}
                    </div>
                    {/* View Complete Details */}
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        router.push(
                          `/employer/profile?tab=view-applications&id=${app.id}`,
                        )
                      }
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View Complete Details
                    </Button>
                    {app.isSelected && (
                      <Button
                        variant="outline"
                        className="w-full border-orange-300 text-orange-600 hover:bg-orange-50"
                        onClick={() => {
                          setLeavingDateAppId(app.id);
                          setLeavingDate(
                            app.leavingDate
                              ? new Date(app.leavingDate)
                                  .toISOString()
                                  .split("T")[0]
                              : "",
                          );
                          setShowLeavingDateModal(true);
                        }}
                      >
                        <CalendarDays className="w-4 h-4 mr-2" />
                        {app.leavingDate
                          ? "Update Leaving Date"
                          : "Set Leaving Date"}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* SCHEDULE MODAL */}
      <Dialog open={showScheduleModal} onOpenChange={setShowScheduleModal}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Schedule Round 2 Interview</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div>
              <Label>Interview Mode</Label>
              <div className="flex gap-3 mt-2">
                {(["online", "offline", "phone"] as const).map((mode) => (
                  <Button
                    key={mode}
                    variant={
                      scheduleForm.interviewType === mode
                        ? "default"
                        : "outline"
                    }
                    className="flex-1"
                    onClick={() =>
                      setScheduleForm({ ...scheduleForm, interviewType: mode })
                    }
                  >
                    {mode === "online" ? (
                      <>
                        <Video className="w-4 h-4 mr-2" /> Online
                      </>
                    ) : mode === "offline" ? (
                      <>
                        <MapPin className="w-4 h-4 mr-2" /> Offline
                      </>
                    ) : (
                      <>
                        <Phone className="w-4 h-4 mr-2" /> Phone
                      </>
                    )}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label>Date & Time *</Label>
              <Input
                type="datetime-local"
                value={scheduleForm.scheduledAt}
                onChange={(e) =>
                  setScheduleForm({
                    ...scheduleForm,
                    scheduledAt: e.target.value,
                  })
                }
              />
            </div>

            {scheduleForm.interviewType === "online" && (
              <div>
                <Label>Meeting Link</Label>
                <Input
                  type="url"
                  placeholder="https://meet.google.com/..."
                  value={scheduleForm.meetingLink}
                  onChange={(e) =>
                    setScheduleForm({
                      ...scheduleForm,
                      meetingLink: e.target.value,
                    })
                  }
                />
              </div>
            )}

            {scheduleForm.interviewType === "offline" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Location</Label>
                  <Input
                    placeholder="Office / Floor"
                    value={scheduleForm.location}
                    onChange={(e) =>
                      setScheduleForm({
                        ...scheduleForm,
                        location: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Interviewer</Label>
                  <Input
                    placeholder="Name"
                    value={scheduleForm.meetingPerson}
                    onChange={(e) =>
                      setScheduleForm({
                        ...scheduleForm,
                        meetingPerson: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            )}

            {scheduleForm.interviewType === "phone" && (
              <div>
                <Label>Interviewer Name (optional)</Label>
                <Input
                  placeholder="Who will call?"
                  value={scheduleForm.meetingPerson}
                  onChange={(e) =>
                    setScheduleForm({
                      ...scheduleForm,
                      meetingPerson: e.target.value,
                    })
                  }
                />
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowScheduleModal(false)}
            >
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleCreateInterview}>
              Schedule Interview
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* VIEW INTERVIEW HISTORY MODAL */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white font-bold text-xl">
                {selectedAppForView?.candidate?.userName
                  ?.charAt(0)
                  ?.toUpperCase()}
              </div>
              <div>
                <DialogTitle className="text-xl">
                  {selectedAppForView?.candidate?.userName}
                </DialogTitle>
                <p className="text-sm text-gray-500">
                  {selectedAppForView?.candidate?.emailAddress}
                </p>
              </div>
            </div>
          </DialogHeader>

          <div className="py-6">
            <h3 className="font-medium text-gray-700 mb-4">
              Interview Timeline
            </h3>

            {selectedAppForView?.interviews?.length > 0 ? (
              selectedAppForView.interviews
                .sort((a: any, b: any) => a.round - b.round)
                .map((interview: any) => {
                  const cfg =
                    statusConfig[interview.status] || statusConfig.scheduled;
                  const StatusIcon = cfg.icon;

                  return (
                    <div
                      key={interview.id}
                      className="border-l-4 border-gray-200 pl-6 mb-8 relative"
                    >
                      <div className="absolute -left-2 top-2 w-4 h-4 rounded-full bg-white border-4 border-gray-300" />

                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-3">
                            <Badge className={cfg.color}>
                              Round {interview.round}
                            </Badge>
                            <span className="capitalize text-sm text-gray-500">
                              {interview.interviewType}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge className={cfg.color}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {cfg.label}
                          </Badge>
                          {interview.result && (
                            <Badge
                              className={resultConfig[interview.result]?.color}
                            >
                              {interview.result === "pass" ? (
                                <ThumbsUp className="w-3 h-3 mr-1" />
                              ) : (
                                <ThumbsDown className="w-3 h-3 mr-1" />
                              )}
                              {resultConfig[interview.result]?.label}
                            </Badge>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setShowViewModal(false);
                              openUpdateModal(interview);
                            }}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {new Date(interview.scheduledAt).toLocaleString()}
                        </div>

                        {interview.interviewType === "online" &&
                          interview.meetingLink && (
                            <a
                              href={interview.meetingLink}
                              target="_blank"
                              className="flex items-center gap-2 text-indigo-600 hover:underline"
                            >
                              <LinkIcon className="w-4 h-4" />
                              Join Meeting
                            </a>
                          )}

                        {interview.interviewType === "offline" &&
                          interview.location && (
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />{" "}
                              {interview.location}
                            </div>
                          )}

                        {interview.meetingPerson && (
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />{" "}
                            {interview.meetingPerson}
                          </div>
                        )}

                        {interview.status === "hold" && (
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />{" "}
                            {interview?.holdReason ||
                              "On hold - reason not specified"}
                          </div>
                        )}
                      </div>

                      {interview.feedback && (
                        <div className="mt-4 pt-4 border-t">
                          <p className="text-xs font-medium text-gray-500 mb-1">
                            FEEDBACK
                          </p>
                          <p className="text-gray-700">{interview.feedback}</p>
                        </div>
                      )}
                    </div>
                  );
                })
            ) : (
              <div className="text-center py-12 text-gray-400">
                <Calendar className="w-12 h-12 mx-auto mb-4" />
                <p>No interviews scheduled yet</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* UPDATE INTERVIEW MODAL */}
      <Dialog open={showUpdateModal} onOpenChange={setShowUpdateModal}>
        <DialogContent className="sm:max-w-xl max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Edit Round {selectedInterviewForUpdate?.round} Interview
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Mode */}
            <div>
              <Label>Interview Mode</Label>
              <div className="flex gap-3 mt-2">
                {(["online", "offline", "phone"] as const).map((mode) => (
                  <Button
                    key={mode}
                    variant={
                      updateForm.interviewType === mode ? "default" : "outline"
                    }
                    className="flex-1"
                    onClick={() =>
                      setUpdateForm({ ...updateForm, interviewType: mode })
                    }
                  >
                    {mode === "online" ? (
                      <Video className="w-4 h-4 mr-2" />
                    ) : mode === "offline" ? (
                      <MapPin className="w-4 h-4 mr-2" />
                    ) : (
                      <Phone className="w-4 h-4 mr-2" />
                    )}
                    {mode === "online"
                      ? "Online"
                      : mode === "offline"
                        ? "Offline"
                        : "Phone"}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label>Date & Time</Label>
              <Input
                type="datetime-local"
                value={updateForm.scheduledAt}
                onChange={(e) =>
                  setUpdateForm({ ...updateForm, scheduledAt: e.target.value })
                }
              />
            </div>

            {updateForm.interviewType === "online" && (
              <div>
                <Label>Meeting Link</Label>
                <Input
                  type="url"
                  placeholder="https://meet.google.com/..."
                  value={updateForm.meetingLink}
                  onChange={(e) =>
                    setUpdateForm({
                      ...updateForm,
                      meetingLink: e.target.value,
                    })
                  }
                />
              </div>
            )}

            {updateForm.interviewType === "offline" && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Location</Label>
                  <Input
                    value={updateForm.location}
                    onChange={(e) =>
                      setUpdateForm({ ...updateForm, location: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label>Interviewer</Label>
                  <Input
                    value={updateForm.meetingPerson}
                    onChange={(e) =>
                      setUpdateForm({
                        ...updateForm,
                        meetingPerson: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            )}

            {updateForm.interviewType === "phone" && (
              <div>
                <Label>Interviewer Name (optional)</Label>
                <Input
                  value={updateForm.meetingPerson}
                  onChange={(e) =>
                    setUpdateForm({
                      ...updateForm,
                      meetingPerson: e.target.value,
                    })
                  }
                />
              </div>
            )}

            {/* Status */}
            <div>
              <Label>Status</Label>
              <div className="grid grid-cols-2 gap-3 mt-2">
                {(
                  [
                    "scheduled",
                    "completed",
                    "cancelled",
                    "rescheduled",
                    "hold",
                  ] as const
                ).map((s) => {
                  const cfg = statusConfig[s];
                  const SIcon = cfg.icon;
                  return (
                    <Button
                      key={s}
                      variant={updateForm.status === s ? "default" : "outline"}
                      className="justify-start"
                      onClick={() =>
                        setUpdateForm({ ...updateForm, status: s })
                      }
                    >
                      <SIcon className="w-4 h-4 mr-2" />
                      {cfg.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {updateForm.status === "cancelled" && (
              <div>
                <Label className="text-red-600">Cancel Reason *</Label>
                <Textarea
                  placeholder="Reason for cancellation..."
                  value={updateForm.cancelReason}
                  onChange={(e) =>
                    setUpdateForm({
                      ...updateForm,
                      cancelReason: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>
            )}

            {updateForm.status === "rescheduled" && (
              <div>
                <Label className="text-amber-600">Reschedule Reason *</Label>
                <Textarea
                  placeholder="Why is it being rescheduled?"
                  value={updateForm.rescheduleReason}
                  onChange={(e) =>
                    setUpdateForm({
                      ...updateForm,
                      rescheduleReason: e.target.value,
                    })
                  }
                  rows={3}
                />
              </div>
            )}

            {updateForm.status === "hold" && (
              <div>
                <Label className="text-amber-600">Hold Reason *</Label>
                <Textarea
                  placeholder="Why is this interview being put on hold?"
                  value={updateForm.holdReason}
                  onChange={(e) =>
                    setUpdateForm({ ...updateForm, holdReason: e.target.value })
                  }
                  rows={3}
                />
              </div>
            )}

            {updateForm.status === "completed" && (
              <div>
                <Label>Result</Label>
                <div className="flex gap-3 mt-2">
                  {(["pass", "fail"] as const).map((r) => (
                    <Button
                      key={r}
                      variant={updateForm.result === r ? "default" : "outline"}
                      className={`flex-1 ${r === "pass" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}`}
                      onClick={() =>
                        setUpdateForm({ ...updateForm, result: r })
                      }
                    >
                      {r === "pass" ? (
                        <ThumbsUp className="w-4 h-4 mr-2" />
                      ) : (
                        <ThumbsDown className="w-4 h-4 mr-2" />
                      )}
                      {r === "pass" ? "Passed" : "Failed"}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label>Feedback / Notes</Label>
              <Textarea
                placeholder="Add feedback or internal notes..."
                value={updateForm.feedback}
                onChange={(e) =>
                  setUpdateForm({ ...updateForm, feedback: e.target.value })
                }
                rows={4}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-6">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowUpdateModal(false)}
            >
              Cancel
            </Button>
            <Button className="flex-1" onClick={handleUpdateInterview}>
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* FINAL DECISION MODAL */}
      <Dialog
        open={showFinalDecisionModal}
        onOpenChange={setShowFinalDecisionModal}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center">
                <UserCheck className="w-4 h-4 text-emerald-600" />
              </div>
              <DialogTitle>Final selection</DialogTitle>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-sm text-gray-500">
                Final salary offered
              </Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                <Input
                  type="number"
                  placeholder="e.g. 850000"
                  className="pl-8"
                  value={finalDecisionForm.finalSalaryOffered}
                  onChange={(e) =>
                    setFinalDecisionForm((p) => ({
                      ...p,
                      finalSalaryOffered: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm text-gray-500">Joining date</Label>
              <Input
                type="date"
                value={finalDecisionForm.joiningDate}
                onChange={(e) =>
                  setFinalDecisionForm((p) => ({
                    ...p,
                    joiningDate: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm text-gray-500">Comment / notes</Label>
              <Textarea
                placeholder="Any additional notes..."
                rows={3}
                value={finalDecisionForm.comment}
                onChange={(e) =>
                  setFinalDecisionForm((p) => ({
                    ...p,
                    comment: e.target.value,
                  }))
                }
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowFinalDecisionModal(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleConfirmFinalDecision}
            >
              <UserCheck className="w-4 h-4 mr-2" />
              Confirm selection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* LEAVING DATE MODAL */}
      <Dialog
        open={showLeavingDateModal}
        onOpenChange={setShowLeavingDateModal}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center">
                <CalendarDays className="w-4 h-4 text-orange-600" />
              </div>
              <DialogTitle>Set Leaving Date</DialogTitle>
            </div>
          </DialogHeader>

          <div className="py-4 space-y-1.5">
            <Label className="text-sm text-gray-500">
              Leaving / Last Working Date
            </Label>
            <Input
              type="date"
              value={leavingDate}
              onChange={(e) => setLeavingDate(e.target.value)}
            />
          </div>

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowLeavingDateModal(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              onClick={handleUpdateLeavingDate}
            >
              <CalendarDays className="w-4 h-4 mr-2" />
              Save Date
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AllApplications;
