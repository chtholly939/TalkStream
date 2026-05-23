import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Users, MessageSquare, Video, Search, UserPlus, Loader2, Globe, CheckCircle, MapPin, Map } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Avatar from "../components/Avatar";
import useAuthUser from "../hooks/useAuthUser";
import { getAllUsers, getUserFriends, getOutgoingFriendReqs, sendFriendRequest } from "../lib/api";
import toast from "react-hot-toast";

const HomePage = () => {
  const { authUser } = useAuthUser();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [outgoingRequestsIds, setOutgoingRequestsIds] = useState(new Set());

  const { data: friends = [], isLoading: loadingFriends } = useQuery({ queryKey: ["friends"], queryFn: getUserFriends });
  const { data: allUsers = [], isLoading: loadingUsers } = useQuery({ queryKey: ["allUsers"], queryFn: getAllUsers });
  const { data: outgoingFriendReqs } = useQuery({ queryKey: ["outgoingFriendReqs"], queryFn: getOutgoingFriendReqs });

  const { mutate: sendRequestMutation, isPending } = useMutation({
    mutationFn: sendFriendRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["outgoingFriendReqs"] });
      toast.success("Friend request sent!");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to send request"),
  });

  useEffect(() => {
    const ids = new Set();
    outgoingFriendReqs?.forEach((req) => { if (req.recipient?._id) ids.add(req.recipient._id); });
    setOutgoingRequestsIds(ids);
  }, [outgoingFriendReqs]);

  const isFriend = (userId) => friends.some(f => f._id === userId);

  const filteredFriends = friends.filter(u => u.fullName.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredUsers = allUsers
    .filter(u => !isFriend(u._id) && u._id !== authUser?._id)
    .filter(u => u.fullName.toLowerCase().includes(searchQuery.toLowerCase()));

  const startChat = (userId) => navigate(`/chat/${userId}`);

  return (
    <Sidebar>
      <div className="h-full overflow-auto px-4 py-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display font-bold text-2xl" style={{ color: "var(--text-primary)" }}>
            Hey, {authUser?.fullName?.split(" ")[0] || "there"} 👋
          </h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>
            {friends.length} friend{friends.length !== 1 ? "s" : ""} connected
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search users to connect..." className="input-field pl-10 pr-4" />
          </div>
        </div>

        {/* Stats cards — 2x2 grid on mobile, 4 cols on sm+ */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Friends",   value: friends.length,       icon: Users,        color: "oklch(var(--p))",  action: undefined },
            { label: "Explore",   value: filteredUsers.length, icon: Globe,        color: "#00e676",          action: undefined },
            { label: "Messages",  value: "→",                  icon: MessageSquare,color: "#9b59ff",          action: () => navigate("/chats") },
            { label: "View Map",  value: "→",                  icon: Map,          color: "#00bcd4",          action: () => navigate("/map") },
          ].map(({ label, value, icon: Icon, color, action }) => (
            <button
              key={label}
              onClick={action}
              className="glass-hover rounded-2xl p-5 text-left transition-all duration-200"
              style={{ cursor: action ? "pointer" : "default" }}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${color}18` }}>
                <Icon size={18} style={{ color }} />
              </div>
              <p className="font-display font-bold text-2xl" style={{ color: "var(--text-primary)" }}>{value}</p>
              <p className="text-xs mt-0.5" style={{ color: "var(--text-secondary)" }}>{label}</p>
            </button>
          ))}
        </div>

        {/* Friends */}
        <div className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display font-semibold text-base" style={{ color: "var(--text-primary)" }}>Your Friends</h2>
            <button onClick={() => navigate("/friends")} className="text-xs font-medium hover:opacity-80"
              style={{ color: "oklch(var(--p))" }}>Friend Requests →</button>
          </div>

          {loadingFriends ? (
            <div className="flex justify-center py-8">
              <Loader2 size={24} className="animate-spin" style={{ color: "var(--text-muted)" }} />
            </div>
          ) : filteredFriends.length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center">
              <Users size={32} className="mx-auto mb-3" style={{ color: "var(--text-muted)" }} />
              <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>No friends yet</p>
              <p className="mt-1 text-xs" style={{ color: "var(--text-muted)" }}>Search for users below to connect</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFriends.map(friend => (
                <div key={friend._id} className="glass-hover flex items-center gap-3 rounded-xl px-4 py-3">
                  <Avatar src={friend.profilePic} name={friend.fullName} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: "var(--text-primary)" }}>{friend.fullName}</p>
                    {friend.location && (
                      <p className="text-xs flex items-center gap-1 truncate" style={{ color: "var(--text-muted)" }}>
                        <MapPin size={10} />{friend.location}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startChat(friend._id)} className="btn-icon h-8 w-8" title="Chat">
                      <MessageSquare size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Explore People */}
        <section>
          <div className="mb-6">
            <h2 className="font-display font-semibold text-base" style={{ color: "var(--text-primary)" }}>Explore People</h2>
            <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>Connect with new people and start conversations instantly</p>
          </div>

          {loadingUsers ? (
            <div className="flex justify-center py-10">
              <Loader2 size={24} className="animate-spin" style={{ color: "var(--text-muted)" }} />
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="glass rounded-2xl p-8 text-center">
              <h3 className="font-semibold text-sm" style={{ color: "var(--text-secondary)" }}>No new users to show right now</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((user) => {
                if (!user?._id) return null;
                const hasRequestBeenSent = outgoingRequestsIds.has(user._id);
                return (
                  <div key={user._id} className="glass-hover rounded-2xl p-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <Avatar src={user.profilePic} name={user.fullName} size="lg" />
                      <div>
                        <h3 className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>{user.fullName}</h3>
                        {user.location && (
                          <div className="flex items-center text-xs mt-1 gap-1" style={{ color: "var(--text-muted)" }}>
                            <MapPin size={11} />{user.location}
                          </div>
                        )}
                      </div>
                    </div>
                    {user.bio && <p className="text-sm break-safe" style={{ color: "var(--text-secondary)" }}>{user.bio}</p>}
                    <button
                      className="btn-brand w-full flex items-center justify-center gap-2 text-sm py-2.5"
                      onClick={() => sendRequestMutation(user._id)}
                      disabled={hasRequestBeenSent || isPending}
                      style={hasRequestBeenSent ? { opacity: 0.6, pointerEvents: "none" } : {}}
                    >
                      {hasRequestBeenSent
                        ? <><CheckCircle size={15} />Request Sent</>
                        : <><UserPlus size={15} />Send Friend Request</>}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </Sidebar>
  );
};
export default HomePage;