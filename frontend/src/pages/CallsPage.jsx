import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getCallLogs } from "../lib/api";
import useAuthUser from "../hooks/useAuthUser";
import {
  Phone, PhoneIncoming, PhoneMissed, Video, Clock, Loader2, PhoneCall,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import Avatar from "../components/Avatar";

/* ── helpers ── */
const formatDuration = (seconds) => {
  if (!seconds) return "0s";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
};

const formatDate = (date) => {
  const d = new Date(date);
  const now = new Date();
  const days = Math.floor((now - d) / 86400000);
  if (days === 0) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  if (days === 1) return "Yesterday";
  if (days < 7) return d.toLocaleDateString([], { weekday: "short" });
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
};

const StatusIcon = ({ status, isInitiator }) => {
  if (status === "missed")   return <PhoneMissed   size={14} style={{ color: "#ff4757" }} />;
  if (isInitiator)           return <Phone         size={14} style={{ color: "oklch(var(--p))" }} />;
  return                            <PhoneIncoming size={14} style={{ color: "#00e676" }} />;
};

const TABS = [
  { key: "all",    label: "All"    },
  { key: "missed", label: "Missed" },
  { key: "video",  label: "Video"  },
  { key: "voice",  label: "Voice"  },
];

const CallsPage = () => {
  const navigate = useNavigate();
  const { authUser } = useAuthUser();
  const [activeTab, setActiveTab] = useState("all");

  const { data: calls = [], isLoading } = useQuery({
    queryKey: ["callLogs"],
    queryFn: getCallLogs,
  });

  const filteredCalls = calls.filter((call) => {
    if (activeTab === "all")    return true;
    if (activeTab === "missed") return call.status === "missed";
    if (activeTab === "video")  return call.callType === "video";
    if (activeTab === "voice")  return call.callType === "voice";
    return true;
  });

  return (
    <Sidebar>
      <div className="h-full overflow-auto px-4 py-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="font-display font-bold text-2xl" style={{ color: "var(--text-primary)" }}>
            Call History
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            Your recent calls
          </p>
        </div>

        {/* Filter tabs — pill style like CampusChat */}
        <div
          className="mb-6 flex gap-1 rounded-xl p-1"
          style={{ background: "oklch(var(--b3))" }}
        >
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className="flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200"
              style={{
                background: activeTab === key ? "oklch(var(--b2))" : "transparent",
                color:      activeTab === key ? "var(--text-primary)" : "var(--text-muted)",
                boxShadow:  activeTab === key ? "0 1px 3px rgba(0,0,0,0.2)" : "none",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-16">
            <Loader2 size={28} className="animate-spin" style={{ color: "var(--text-muted)" }} />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && calls.length === 0 && (
          <div className="glass rounded-2xl p-16 text-center">
            <div
              className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
              style={{ background: "oklch(var(--b3))" }}
            >
              <PhoneCall size={28} style={{ color: "var(--text-muted)" }} />
            </div>
            <p className="font-semibold" style={{ color: "var(--text-secondary)" }}>
              No calls yet
            </p>
            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
              Your recent voice and video calls will appear here.
            </p>
          </div>
        )}

        {/* Call list — CampusChat row style */}
        {!isLoading && filteredCalls.length > 0 && (
          <div className="space-y-2">
            {filteredCalls.map((call) => {
              const otherUser =
                call.caller?._id === authUser?._id ? call.receiver : call.caller;
              const isInitiator = call.caller?._id === authUser?._id;
              const isMissed    = call.status === "missed";
              const isVideo     = call.callType === "video";

              return (
                <div
                  key={call._id}
                  className="glass-hover flex items-center gap-4 rounded-xl px-5 py-4"
                >
                  {/* Avatar */}
                  <Avatar
                    src={otherUser?.profilePic}
                    name={otherUser?.fullName}
                    size="md"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <StatusIcon status={call.status} isInitiator={isInitiator} />
                      <p
                        className="text-sm font-semibold truncate"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {otherUser?.fullName || "Unknown"}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 flex-wrap">
                      {/* Type */}
                      <span
                        className="flex items-center gap-1 text-xs"
                        style={{ color: "var(--text-muted)" }}
                      >
                        {isVideo ? <Video size={11} /> : <Phone size={11} />}
                        {isVideo ? "Video" : "Voice"}
                      </span>

                      {/* Duration */}
                      {call.duration > 0 && (
                        <span
                          className="flex items-center gap-1 text-xs"
                          style={{ color: "var(--text-muted)" }}
                        >
                          <Clock size={11} />
                          {formatDuration(call.duration)}
                        </span>
                      )}

                      {/* Status label */}
                      <span
                        className="text-xs"
                        style={{ color: isMissed ? "#ff4757" : "var(--text-muted)" }}
                      >
                        {isMissed ? "Missed" : isInitiator ? "Outgoing" : "Incoming"}
                      </span>
                    </div>
                  </div>

                  {/* Right: date + quick-call button */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {formatDate(call.createdAt)}
                    </p>
                    <button
                      className="btn-icon h-9 w-9"
                      onClick={() => navigate(`/chat/${otherUser?._id}`)}
                      title={isVideo ? "Open chat" : "Open chat"}
                    >
                      {isVideo ? <Video size={17} /> : <Phone size={17} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty filtered state */}
        {!isLoading && calls.length > 0 && filteredCalls.length === 0 && (
          <div className="glass rounded-2xl p-10 text-center">
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              No {activeTab === "all" ? "" : activeTab} calls found
            </p>
          </div>
        )}
      </div>
    </Sidebar>
  );
};

export default CallsPage;