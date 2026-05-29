import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Channel, Chat, MessageInput, MessageList, Thread, Window,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import {
  ArrowLeft, Users, UserPlus, LogOut, Search, Check, Loader2, X, Camera,
} from "lucide-react";
import toast from "react-hot-toast";
import { getStreamToken, getUserFriends, addMemberToGroup, updateGroupImage, leaveGroup } from "../lib/api";
import useAuthUser from "../hooks/useAuthUser";
import Avatar from "../components/Avatar";
import { compressImage } from "../lib/imageUtils";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

/* ── Add Member Panel ── */
const AddMemberPanel = ({ channelId, existingMemberIds, onClose }) => {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState(null);
  const queryClient = useQueryClient();

  const { data: friends = [] } = useQuery({ queryKey: ["friends"], queryFn: getUserFriends });

  const { mutate: addMember, isPending } = useMutation({
    mutationFn: () => addMemberToGroup({ channelId, userId: selectedId }),
    onSuccess: () => {
      toast.success("Member added!");
      queryClient.invalidateQueries({ queryKey: ["myGroups"] });
      onClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to add member"),
  });

  const eligible = friends.filter(
    (f) =>
      !existingMemberIds.includes(f._id) &&
      f.fullName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className="absolute right-0 top-14 z-40 w-72 rounded-2xl shadow-2xl animate-fade-in"
      style={{ background: "oklch(var(--b2))", border: "1px solid var(--border)" }}
    >
      <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
        <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>Add Member</p>
      </div>
      <div className="p-3">
        <div className="relative mb-2">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search friends…"
            className="input-field pl-9 py-2 text-xs"
          />
        </div>
        <div className="max-h-48 overflow-y-auto space-y-1">
          {eligible.length === 0 && (
            <p className="py-3 text-center text-xs" style={{ color: "var(--text-muted)" }}>No friends to add</p>
          )}
          {eligible.map((f) => (
            <button
              key={f._id}
              onClick={() => setSelectedId(f._id)}
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left transition-all"
              style={{
                background: selectedId === f._id ? "oklch(var(--p) / 0.1)" : "transparent",
                border: selectedId === f._id ? "1px solid oklch(var(--p)/0.3)" : "1px solid transparent",
              }}
            >
              <Avatar src={f.profilePic} name={f.fullName} size="xs" />
              <span className="flex-1 text-xs font-medium truncate" style={{ color: "var(--text-primary)" }}>
                {f.fullName}
              </span>
              {selectedId === f._id && <Check size={12} style={{ color: "oklch(var(--p))" }} />}
            </button>
          ))}
        </div>
      </div>
      <div className="flex gap-2 px-3 pb-3">
        <button onClick={onClose} className="btn-secondary flex-1 text-xs py-2">Cancel</button>
        <button
          onClick={() => addMember()}
          disabled={!selectedId || isPending}
          className="btn-brand flex-1 text-xs py-2 flex items-center justify-center gap-1"
        >
          {isPending ? <Loader2 size={12} className="animate-spin" /> : <UserPlus size={12} />}
          Add
        </button>
      </div>
    </div>
  );
};

/* ── Main Page ── */
const GroupChatPage = () => {
  const { channelId } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuthUser();
  const queryClient = useQueryClient();
  const imageInputRef = useRef(null);

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [currentGroupImage, setCurrentGroupImage] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showMembers, setShowMembers] = useState(false);

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  const { mutate: leaveGroupMutation, isPending: leaving } = useMutation({
    mutationFn: () => leaveGroup(channelId),
    onSuccess: () => {
      toast.success("Left group");
      queryClient.invalidateQueries({ queryKey: ["myGroups"] });
      navigate("/groups");
    },
    onError: () => toast.error("Failed to leave group"),
  });

  const { mutate: saveGroupImage, isPending: updatingImage } = useMutation({
    mutationFn: (image) => updateGroupImage({ channelId, image }),
    onMutate: () => toast.loading("Updating group photo...", { id: "group-img" }),
    onSuccess: async (data) => {
      setCurrentGroupImage(data.image);
      await channel?.watch();
      queryClient.invalidateQueries({ queryKey: ["myGroups"] });
      toast.success("Group photo updated", { id: "group-img" });
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to update group photo", { id: "group-img" }),
  });

  const handleGroupImageUpload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    try {
      toast.loading("Processing image...", { id: "group-img" });
      const compressed = await compressImage(file);
      saveGroupImage(compressed);
    } catch {
      toast.error("Failed to process image", { id: "group-img" });
    }
  };

  useEffect(() => {
    const initChat = async () => {
      if (!tokenData?.token || !authUser) return;
      try {
        const client = StreamChat.getInstance(STREAM_API_KEY);
        if (!client.userID) {
          await client.connectUser(
            { id: authUser._id, name: authUser.fullName, image: authUser.profilePic },
            tokenData.token
          );
        }
        const ch = client.channel("messaging", channelId);
        await ch.watch();
        setChatClient(client);
        setChannel(ch);
        setCurrentGroupImage(ch.data?.image || "");
      } catch (err) {
        console.error("GroupChatPage error:", err);
        toast.error("Failed to connect to group chat");
      } finally {
        setLoading(false);
      }
    };
    initChat();
  }, [tokenData, authUser, channelId]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center mesh-bg">
        <Loader2 size={32} className="animate-spin" style={{ color: "oklch(var(--p))" }} />
      </div>
    );
  }

  if (!chatClient || !channel) {
    return (
      <div className="h-screen flex items-center justify-center mesh-bg">
        <div className="glass rounded-2xl p-8 text-center max-w-sm">
          <p className="font-semibold" style={{ color: "var(--text-primary)" }}>
            Group not found
          </p>
          <button onClick={() => navigate("/groups")} className="btn-secondary mt-4">
            Go back
          </button>
        </div>
      </div>
    );
  }

  const groupName = channel.data?.name || "Group";
  const groupImage = currentGroupImage || channel.data?.image;
  const members = Object.values(channel.state.members || {});
  const existingMemberIds = members.map((m) => m.user?.id);

  return (
    <div className="h-screen flex flex-col" style={{ background: "oklch(var(--b1))" }}>
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <Window>
            {/* ── Custom Header ── */}
            <div
              className="flex items-center justify-between px-4 py-3 flex-shrink-0 relative"
              style={{ background: "oklch(var(--b2))", borderBottom: "1px solid var(--border)" }}
            >
              <div className="flex items-center gap-3">
                <button onClick={() => navigate("/groups")} className="btn-icon h-8 w-8 mr-1">
                  <ArrowLeft size={18} />
                </button>

                {/* Group avatar */}
                <div className="relative flex-shrink-0">
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="h-10 w-10 rounded-full overflow-hidden flex items-center justify-center"
                    style={{ background: "oklch(var(--p) / 0.15)" }}
                    title="Change group photo"
                    disabled={updatingImage}
                  >
                    {groupImage ? (
                      <img src={groupImage} alt={groupName} className="h-full w-full object-cover" />
                    ) : (
                      <Users size={18} style={{ color: "oklch(var(--p))" }} />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border"
                    style={{ background: "oklch(var(--p))", borderColor: "oklch(var(--b2))", color: "white" }}
                    title="Change group photo"
                    disabled={updatingImage}
                  >
                    {updatingImage ? <Loader2 size={10} className="animate-spin" /> : <Camera size={10} />}
                  </button>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleGroupImageUpload}
                  />
                </div>

                {/* Name + member count */}
                <button
                  type="button"
                  onClick={() => { setShowMembers(!showMembers); setShowAddMember(false); }}
                  className="min-w-0 text-left"
                  title="View group members"
                >
                  <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                    {groupName}
                  </p>
                  <span className="text-xs hover:underline" style={{ color: "var(--text-muted)" }}>
                    {members.length} member{members.length !== 1 ? "s" : ""}
                  </span>
                </button>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 relative">
                <button
                  onClick={() => { setShowAddMember(!showAddMember); setShowMembers(false); }}
                  className="btn-icon h-8 w-8"
                  title="Add member"
                >
                  <UserPlus size={16} />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm("Leave this group?")) leaveGroupMutation();
                  }}
                  className="btn-icon h-8 w-8"
                  title="Leave group"
                  style={{ color: leaving ? "var(--text-muted)" : "oklch(var(--er))" }}
                  disabled={leaving}
                >
                  <LogOut size={16} />
                </button>

                {/* Add member panel */}
                {showAddMember && (
                  <AddMemberPanel
                    channelId={channelId}
                    existingMemberIds={existingMemberIds}
                    onClose={() => setShowAddMember(false)}
                  />
                )}
              </div>
            </div>

            {/* Members drawer */}
            {showMembers && (
              <div
                className="flex-shrink-0 overflow-y-auto"
                style={{
                  background: "oklch(var(--b2))",
                  borderBottom: "1px solid var(--border)",
                  maxHeight: "180px",
                }}
              >
                <div className="flex items-center justify-between px-4 pt-3 pb-1">
                  <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                    Members
                  </p>
                  <button onClick={() => setShowMembers(false)} className="btn-icon h-6 w-6">
                    <X size={13} />
                  </button>
                </div>
                <div className="flex gap-4 overflow-x-auto px-4 pb-3 pt-1">
                  {members.map((m) => (
                    <div key={m.user?.id} className="flex flex-col items-center gap-1 flex-shrink-0">
                      <Avatar src={m.user?.image} name={m.user?.name} size="sm" showStatus isOnline={m.user?.online} />
                      <span className="text-xs max-w-[56px] truncate text-center" style={{ color: "var(--text-muted)" }}>
                        {m.user?.id === authUser._id ? "You" : m.user?.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-auto" style={{ background: "oklch(var(--b1))" }}>
              <MessageList />
            </div>

            {/* Input */}
            <div style={{ background: "oklch(var(--b2))", borderTop: "1px solid var(--border)" }}>
              <MessageInput focus />
            </div>
          </Window>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
};

export default GroupChatPage;
