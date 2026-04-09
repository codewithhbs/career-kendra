"use client";

import { Star, MapPin, DollarSign, Zap } from "lucide-react";

const recommendedJobs = [
  {
    id: 1,
    title: "Senior React Developer",
    company: "Paytm",
    match: 92,
    salary: "₹22-38 LPA",
    location: "Noida",
    type: "Full-time",
    skills: ["React", "TypeScript", "Next.js"],
    posted: "2 days ago",
  },
  {
    id: 2,
    title: "Full Stack Engineer",
    company: "Flipkart",
    match: 87,
    salary: "₹18-32 LPA",
    location: "Bangalore",
    type: "Full-time",
    skills: ["Node.js", "React", "MongoDB"],
    posted: "1 day ago",
  },
  {
    id: 3,
    title: "Lead Frontend Developer",
    company: "PhonePe",
    match: 89,
    salary: "₹28-45 LPA",
    location: "Bangalore",
    type: "Full-time",
    skills: ["React", "Redux", "JavaScript"],
    posted: "4 days ago",
  },
  {
    id: 4,
    title: "Software Development Engineer II",
    company: "Uber India",
    match: 85,
    salary: "₹30-50 LPA",
    location: "Hyderabad",
    type: "Full-time",
    skills: ["React", "Node.js", "AWS"],
    posted: "3 days ago",
  },
];

export default function RecommendationsTab() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          Recommended For You
        </h3>
        <p className="text-sm text-gray-600">
          Jobs personalized based on your profile and preferences
        </p>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {recommendedJobs.map((job) => (
          <div
            key={job.id}
            className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h4 className="font-bold text-gray-900 mb-1">{job.title}</h4>
                <p className="text-sm text-gray-600">{job.company}</p>
              </div>
              <div className="flex items-center gap-1 px-3 py-1 bg-amber-100 rounded-full flex-shrink-0 ml-2">
                <Star size={14} className="text-amber-600" fill="currentColor" />
                <span className="text-sm font-bold text-amber-600">
                  {job.match}%
                </span>
              </div>
            </div>

            {/* Match Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-600">Profile Match</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-600"
                  style={{ width: `${job.match}%` }}
                />
              </div>
            </div>

            {/* Job Details */}
            <div className="space-y-2 mb-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                {/* <DollarSign size={16} className="text-gray-400" /> */}
                {job.salary}
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin size={16} className="text-gray-400" />
                {job.location}
              </div>
            </div>

            {/* Skills */}
            <div className="mb-4">
              <p className="text-xs text-gray-600 mb-2">Required Skills</p>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <span
                    key={skill}
                    className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <span className="text-xs text-gray-500">Posted {job.posted}</span>
              <button className="flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors font-medium text-sm">
                <Zap size={16} />
                Apply Now
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
