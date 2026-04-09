"use client";

import { useState, useEffect } from "react";
import { Search, Archive, Trash2 } from "lucide-react";
import { API_URL } from "@/constant/api";
import axios from "axios";
import { useEmployerAuthStore } from "@/store/employerAuth.store";

axios.defaults.baseURL = API_URL;

export default function Messages() {
  const { token, isAuthenticated } = useEmployerAuthStore();

  const [messageList, setMessageList] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch messages
  const fetchMessages = async () => {
    try {
      setLoading(true);

      const res = await axios.get("/auth/message-for-me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data?.success) {
        const formatted = res.data.data.map((msg) => {
          const jobTitle = msg.application?.job?.jobTitle || "Job";
          const companyName = msg.application?.job?.company?.companyName || "Company";

          return {
            id: msg.id,
            sender: msg.sender?.userName || "System",
            subject: jobTitle,
            anyLink: msg.anyLink || null,
            company: companyName,
            preview: msg.content,
            timestamp: new Date(msg.sentAt).toLocaleString(),
            unread: !msg.isRead,
          };
        });

        setMessageList(formatted);
      }
    } catch (error) {
      console.error("Failed to fetch messages", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchMessages();
    }
  }, [isAuthenticated]);

  // Mark message as read
  const markAsRead = async (msgId) => {
    try {
      await axios.put(
        `/auth/mark-message-read/${msgId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      fetchMessages();
      // Update UI instantly
      setMessageList((prev) =>
        prev.map((m) =>
          m.id === msgId ? { ...m, unread: false } : m
        )
      );
    } catch (error) {
      console.error("Failed to mark message read", error);
    }
  };

  // Search filter
  const messages = messageList.filter((msg) =>
    msg.preview.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">
            <Archive size={18} />
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-10 text-gray-500">
          Loading messages...
        </div>
      )}

      {/* Messages */}
  <div className="space-y-4">
  {messages.map((msg) => (
    <div
      key={msg.id}
      onClick={() => markAsRead(msg.id)}
      className={`group flex items-start gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer
      ${
        msg.unread
          ? "bg-blue-50 border-blue-200"
          : "bg-white border-gray-200"
      }
      hover:shadow-md hover:border-blue-300`}
    >
      
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-orange-200 to-amber-300 flex items-center justify-center font-semibold text-orange-800">
          {msg.sender
            .split(" ")
            .map((n) => n[0])
            .join("")}
        </div>

        {msg.unread && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"></span>
        )}
      </div>

      {/* Message Content */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-semibold text-gray-900 text-sm">
            {msg.sender}
          </h3>

          <span className="text-xs text-gray-400 whitespace-nowrap">
            {msg.timestamp}
          </span>
        </div>

        <p className="text-sm font-medium text-gray-800 truncate">
          {msg.subject}
        </p>

        <p className="text-xs text-gray-500 line-clamp-2 mt-1">
          {msg.preview}
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition">
        {msg.anyLink && (
          <a
            href={msg.anyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700 text-sm font-medium"
          >
            View
          </a>
        )}
{/* 
        <button className="text-gray-400 hover:text-red-600 transition">
          <Trash2 size={18} />
        </button> */}
      </div>
    </div>
  ))}
</div>
    </div>
  );
}