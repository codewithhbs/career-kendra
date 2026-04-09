"use client";

import {
  Briefcase,
  MessageSquare,
  Bookmark,
  Clock,
  User,
  Trash2,
} from "lucide-react";

const notifications = [
  {
    id: 1,
    type: "application",
    title: "Application Viewed",
    message: "Google India viewed your application for Senior Frontend Engineer",
    timestamp: "1 hour ago",
    unread: true,
    icon: Briefcase,
  },
  {
    id: 2,
    type: "message",
    title: "New Message",
    message: "You have a new message from Microsoft regarding your application",
    timestamp: "3 hours ago",
    unread: true,
    icon: MessageSquare,
  },
  {
    id: 3,
    type: "job",
    title: "New Job Match",
    message: "5 new jobs match your profile",
    timestamp: "5 hours ago",
    unread: true,
    icon: Bookmark,
  },
  {
    id: 4,
    type: "interview",
    title: "Interview Reminder",
    message: "Your interview with Microsoft is scheduled for Feb 15, 2026",
    timestamp: "1 day ago",
    unread: false,
    icon: Clock,
  },
  {
    id: 5,
    type: "profile",
    title: "Complete Your Profile",
    message: "Add your skills to increase profile visibility by 20%",
    timestamp: "2 days ago",
    unread: false,
    icon: User,
  },
];

export default function NotificationsTab() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Notifications</h3>
        <p className="text-sm text-gray-600">
          Stay updated with your application progress
        </p>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {notifications.map((notification) => {
          const NotificationIcon = notification.icon;
          return (
            <div
              key={notification.id}
              className={`rounded-lg border shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition-shadow ${
                notification.unread
                  ? "bg-amber-50 border-amber-200"
                  : "bg-white border-gray-200"
              }`}
            >
              {/* Icon */}
              <div
                className={`p-3 rounded-lg flex-shrink-0 ${
                  notification.unread ? "bg-amber-100" : "bg-gray-100"
                }`}
              >
                <NotificationIcon
                  size={20}
                  className={
                    notification.unread ? "text-amber-600" : "text-gray-600"
                  }
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4
                    className={`font-semibold text-gray-900 ${
                      notification.unread ? "font-bold" : ""
                    }`}
                  >
                    {notification.title}
                  </h4>
                  {notification.unread && (
                    <div className="w-2 h-2 rounded-full bg-amber-600 flex-shrink-0"></div>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  {notification.message}
                </p>
                <p className="text-xs text-gray-500">{notification.timestamp}</p>
              </div>

              {/* Delete Button */}
              <button className="text-gray-400 hover:text-red-600 transition-colors flex-shrink-0 ml-2">
                <Trash2 size={18} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
