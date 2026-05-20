import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, UserCheck, UserX, Clock, MessageSquare, Check, Loader2,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import Avatar from "../components/Avatar";
import {
  getUserFriends,
  getFriendRequests,
  getOutgoingFriendReqs,
  acceptFriendRequest,
  removeFriend,
} from "../lib/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const TABS = ["Friends", "Requests", "Sent"];

const FriendsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState("Friends");

  const { data: friends = [], isLoading: loadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getUserFriends,
  });

  // getFriendRequests returns { incomingReqs, acceptedReqs }
  const { data: friendRequests, isLoading: loadingRequests } = useQuery({
    queryKey: ["friendRequests"],
    queryFn: getFriendRequests,
  });

  const { data: outgoingReqs = [], isLoading: loadingOutgoing } = useQuery({
    queryKey: ["outgoingFriendReqs"],
    queryFn: getOutgoingFriendReqs,
  });

  const incoming = friendRequests?.incomingReqs || [];

  const { mutate: acceptMutation, isPending: accepting } = useMutation({
    mutationFn: acceptFriendRequest,
    onSuccess: () => {
      toast.success("Friend request accepted! 🎉");
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
    onError: () => toast.error("Failed to accept request"),
  });

  const { mutate: removeFriendMutation, isPending: removing, variables: removingFriendId } = useMutation({
    mutationFn: removeFriend,
    onSuccess: () => {
      toast.success("Friend removed");
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["friendRequests"] });
      queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] });
    },
    onError: () => toast.error("Failed to remove friend"),
  });

  const loading = loadingFriends || loadingRequests || loadingOutgoing;

  const counts = {
    Friends: friends.length,
    Requests: incoming.length,
    Sent: outgoingReqs.length,
  };

  return (
    <Sidebar>
      <div className="h-full overflow-auto px-4 py-6 lg:px-8">
        <div className="mb-6">
          <h1 className="font-display font-bold text-2xl" style={{ color: "var(--text-primary)" }}>
            Friends
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            Manage your connections
          </p>
        </div>

        {/* Tabs */}
        <div
          className="mb-6 flex gap-1 rounded-xl p-1"
          style={{ background: "oklch(var(--b3))" }}
        >
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="relative flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200"
              style={{
                background: tab === t ? "oklch(var(--b2))" : "transparent",
                color: tab === t ? "var(--text-primary)" : "var(--text-muted)",
                boxShadow: tab === t ? "0 1px 3px rgba(0,0,0,0.2)" : "none",
              }}
            >
              {t}
              {counts[t] > 0 && (
                <span
                  className="ml-1.5 inline-flex items-center justify-center rounded-full font-bold text-white"
                  style={{
                    background: t === "Requests" ? "oklch(var(--er))" : "oklch(var(--p))",
                    fontSize: "9px",
                    height: "16px",
                    minWidth: "16px",
                    padding: "0 3px",
                  }}
                >
                  {counts[t]}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 size={28} className="animate-spin" style={{ color: "var(--text-muted)" }} />
          </div>
        ) : (
          <>
            {/* ── Friends tab ── */}
            {tab === "Friends" && (
              <div>
                {friends.length === 0 ? (
                  <div className="glass rounded-2xl p-12 text-center">
                    <Users size={40} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
                    <p className="font-semibold" style={{ color: "var(--text-secondary)" }}>
                      No friends yet
                    </p>
                    <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
                      Search for people on the{" "}
                      <button
                        onClick={() => navigate("/")}
                        className="underline"
                        style={{ color: "oklch(var(--p))" }}
                      >
                        Home page
                      </button>{" "}
                      to connect
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {friends.map((f) => (
                      <div key={f._id} className="glass-hover rounded-2xl p-4">
                        <div className="flex items-start gap-3 mb-4">
                          <Avatar
                            src={f.profilePic}
                            name={f.fullName}
                            size="md"
                          />
                          <div className="flex-1 min-w-0">
                            <p
                              className="font-semibold text-sm truncate"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {f.fullName}
                            </p>
                            {f.location && (
                              <p
                                className="text-xs truncate mt-0.5"
                                style={{ color: "var(--text-muted)" }}
                              >
                                📍 {f.location}
                              </p>
                            )}
                            {f.bio && (
                              <p
                                className="mt-1 text-xs truncate"
                                style={{ color: "var(--text-secondary)" }}
                              >
                                {f.bio}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => navigate(`/chat/${f._id}`)}
                            className="btn-secondary flex-1 text-xs py-2 flex items-center justify-center gap-1"
                          >
                            <MessageSquare size={12} /> Chat
                          </button>
                          <button
                            onClick={() => removeFriendMutation(f._id)}
                            disabled={removing}
                            className="btn-secondary flex-1 text-xs py-2 flex items-center justify-center gap-1"
                            style={{ color: "oklch(var(--er))" }}
                          >
                            {removing && removingFriendId === f._id ? (
                              <Loader2 size={12} className="animate-spin" />
                            ) : (
                              <UserX size={12} />
                            )}
                            Remove
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Requests (incoming) tab ── */}
            {tab === "Requests" && (
              <div className="space-y-3">
                {incoming.length === 0 ? (
                  <div className="glass rounded-2xl p-12 text-center">
                    <UserCheck
                      size={40}
                      className="mx-auto mb-3"
                      style={{ color: "var(--text-muted)" }}
                    />
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      No pending requests
                    </p>
                  </div>
                ) : (
                  incoming.map((r) => (
                    <div
                      key={r._id}
                      className="glass-hover flex items-center gap-4 rounded-xl p-4"
                    >
                      <Avatar
                        src={r.sender?.profilePic}
                        name={r.sender?.fullName}
                        size="md"
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className="font-semibold text-sm"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {r.sender?.fullName}
                        </p>
                        {r.sender?.location && (
                          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                            📍 {r.sender.location}
                          </p>
                        )}
                        {r.sender?.bio && (
                          <p
                            className="mt-0.5 text-xs truncate"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {r.sender.bio}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => acceptMutation(r._id)}
                          disabled={accepting}
                          className="btn-brand flex items-center gap-1.5 text-xs px-3 py-2"
                        >
                          <Check size={13} /> Accept
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* ── Sent (outgoing) tab ── */}
            {tab === "Sent" && (
              <div className="space-y-3">
                {outgoingReqs.length === 0 ? (
                  <div className="glass rounded-2xl p-12 text-center">
                    <Clock
                      size={40}
                      className="mx-auto mb-3"
                      style={{ color: "var(--text-muted)" }}
                    />
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                      No sent requests
                    </p>
                  </div>
                ) : (
                  outgoingReqs.map((r) => (
                    <div
                      key={r._id}
                      className="glass-hover flex items-center gap-4 rounded-xl p-4"
                    >
                      <Avatar
                        src={r.recipient?.profilePic}
                        name={r.recipient?.fullName}
                        size="md"
                      />
                      <div className="flex-1 min-w-0">
                        <p
                          className="font-semibold text-sm"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {r.recipient?.fullName}
                        </p>
                        {r.recipient?.location && (
                          <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                            📍 {r.recipient.location}
                          </p>
                        )}
                      </div>
                      <span className="tag">Pending</span>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </Sidebar>
  );
};

export default FriendsPage;
