import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { StreamChat } from "stream-chat";
import { deleteConversation, getStreamToken } from "../lib/api";
import useAuthUser from "../hooks/useAuthUser";
import { MessageSquare, Loader2, Trash2 } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Avatar from "../components/Avatar";
import toast from "react-hot-toast";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatsPage = () => {
  const { authUser } = useAuthUser();
  const navigate = useNavigate();
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);

  const { data: tokenData } = useQuery({ queryKey: ["streamToken"], queryFn: getStreamToken, enabled: !!authUser });

  const { mutate: deleteConversationMutation, isPending: deleting } = useMutation({
    mutationFn: deleteConversation,
    onSuccess: (_, targetUserId) => {
      const channelId = [authUser._id, targetUserId].sort().join("-");
      setChannels((prev) => prev.filter((channel) => channel.id !== channelId));
      toast.success("Conversation deleted on your end");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to delete conversation"),
  });

  const handleDeleteConversation = (event, targetUserId, name) => {
    event.stopPropagation();
    if (deleting) return;
    if (window.confirm(`Delete conversation with ${name}? This only removes it on your end.`)) {
      deleteConversationMutation(targetUserId);
    }
  };

  useEffect(() => {
    const init = async () => {
      if (!tokenData?.token || !authUser) return;
      try {
        const client = StreamChat.getInstance(STREAM_API_KEY);
        if (!client.userID) {
          await client.connectUser({ id: authUser._id, name: authUser.fullName, image: authUser.profilePic }, tokenData.token);
        }
        const ch = await client.queryChannels(
          { type: "messaging", members: { $in: [authUser._id] } },
          { last_message_at: -1 },
          { watch: true, state: true }
        );
        const uniqueChannels = [];
        const seenUsers = new Set();

        for (const channel of ch) {
          const members = Object.values(channel.state.members || {});
          const otherMember = members.find(
            (m) => m.user?.id !== authUser._id
          );

          const otherUserId = otherMember?.user?.id;

          if (!otherUserId) continue;

          // skip duplicate users
          if (seenUsers.has(otherUserId)) continue;

          seenUsers.add(otherUserId);
          uniqueChannels.push(channel);
        }

        setChannels(uniqueChannels);
      } catch (err) {
        console.error("ChatPage stream error:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [tokenData, authUser]);

  return (
    <Sidebar>
      <div className="h-full overflow-auto px-4 py-6 lg:px-8">
        <div className="mb-6">
          <h1 className="font-display font-bold text-2xl" style={{ color: "var(--text-primary)" }}>Messages</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--text-secondary)" }}>Your recent conversations</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={28} className="animate-spin" style={{ color: "var(--text-muted)" }} />
          </div>
        ) : channels.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: "oklch(var(--b3))" }}>
              <MessageSquare size={28} style={{ color: "var(--text-muted)" }} />
            </div>
            <p className="font-semibold" style={{ color: "var(--text-secondary)" }}>No conversations yet</p>
            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
              Go to <button onClick={() => navigate("/")} className="underline" style={{ color: "oklch(var(--p))" }}>Home</button> to find friends and start chatting
            </p>
          </div>
        ) : (
          <div className="space-y-1">
            {channels.map((channel) => {
              const members = Object.values(channel.state.members || {});
              const otherMember = members.find(m => m.user?.id !== authUser._id);
              const otherUser = otherMember?.user;
              if (!otherUser) return null;

              const lastMsg = channel.state.messages?.at(-1);
              const unread = channel.countUnread?.() || 0;
              const isOnline = otherMember?.user?.online;

              return (
                <div
                  key={channel.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => navigate(`/chat/${otherUser.id}`)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      navigate(`/chat/${otherUser.id}`);
                    }
                  }}
                  className="group w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left transition-all duration-150"
                  style={{ background: "transparent" }}
                  onMouseEnter={e => e.currentTarget.style.background = "oklch(var(--b3))"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <div className="relative flex-shrink-0">
                    <Avatar src={otherUser.image} name={otherUser.name} size="md" showStatus isOnline={isOnline} />
                    {unread > 0 && (
                      <span className="badge" style={{ top: "-4px", right: "-4px", fontSize: "9px", height: "16px", minWidth: "16px" }}>
                        {unread > 9 ? "9+" : unread}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>{otherUser.name}</p>
                      {lastMsg?.created_at && (
                        <span className="text-xs ml-2 flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                          {new Date(lastMsg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      )}
                    </div>
                    <p className="text-xs truncate mt-0.5" style={{ color: unread > 0 ? "var(--text-secondary)" : "var(--text-muted)", fontWeight: unread > 0 ? "500" : "400" }}>
                      {lastMsg?.text || "No messages yet"}
                    </p>
                  </div>
                  <button
                    type="button"
                    title="Delete conversation"
                    onClick={(event) => handleDeleteConversation(event, otherUser.id, otherUser.name)}
                    className="btn-icon h-8 w-8 flex-shrink-0 opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                    style={{ color: "var(--text-muted)" }}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Sidebar>
  );
};
export default ChatsPage;
