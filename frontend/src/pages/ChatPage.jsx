import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useMutation, useQuery } from "@tanstack/react-query";
import { deleteConversation, getStreamToken } from "../lib/api";
import { getDistanceKm } from "../lib/utils";
import { Channel, Chat, MessageInput, MessageList, Thread, Window } from "stream-chat-react";
import { StreamChat } from "stream-chat";
import { Video, MapPin, ArrowLeft, Loader2, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import CallButton from "../components/CallButton";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatPage = () => {
  const { id: targetUserId } = useParams();
  const navigate = useNavigate();
  const { authUser } = useAuthUser();

  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [incomingCall, setIncomingCall] = useState(null);

  const { data: tokenData } = useQuery({ queryKey: ["streamToken"], queryFn: getStreamToken, enabled: !!authUser });

  const { mutate: deleteConversationMutation, isPending: deleting } = useMutation({
    mutationFn: deleteConversation,
    onSuccess: () => {
      toast.success("Conversation deleted on your end");
      navigate("/chats");
    },
    onError: (err) => toast.error(err.response?.data?.message || "Failed to delete conversation"),
  });

  useEffect(() => {
    const initChat = async () => {
      if (!tokenData?.token || !authUser) return;
      const client = StreamChat.getInstance(STREAM_API_KEY);
      try {
        if (!client.userID) {
          await client.connectUser(
            {
              id: authUser._id,
              name: authUser.fullName,
              image: authUser.profilePic,
              location: authUser.location,
              lat: authUser.lat,
              lon: authUser.lon,
              status: authUser.status,
            },
            tokenData.token
          );
          await client.upsertUser({
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic,
            location: authUser.location,
            lat: authUser.lat,
            lon: authUser.lon,
          });
        }

        const channelId = [authUser._id, targetUserId].sort().join("-");
        const currChannel = client.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        });
        await currChannel.watch();

        currChannel.on("message.new", (event) => {
          const message = event.message;
          if (message.customType === "incoming-call" && message.user.id !== authUser._id) {
            setIncomingCall({ callId: message.callId, senderName: message.senderName });
          }
        });

        setChatClient(client);
        setChannel(currChannel);
      } catch (err) {
        console.error("Error initializing chat:", err);
        toast.error("Failed to connect to chat");
      } finally {
        setLoading(false);
      }
    };
    initChat();
  }, [tokenData, authUser, targetUserId]);

  const handleVideoCall = () => {
    if (!channel) return;
    const uniqueCallId = `${channel.id}-${Date.now()}`;
    channel.sendMessage({
      text: "📞 Incoming Video Call",
      customType: "incoming-call",
      callId: uniqueCallId,
      senderName: authUser.fullName,
    });
    navigate(`/call/${uniqueCallId}?caller=true`);
    toast.success("Video call started!");
  };

  const handleDeleteConversation = () => {
    if (deleting) return;
    if (window.confirm("Delete this conversation? This only removes it on your end.")) {
      deleteConversationMutation(targetUserId);
    }
  };

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
          <p className="font-semibold" style={{ color: "var(--text-primary)" }}>Chat unavailable</p>
          <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>Could not connect to the chat service.</p>
          <button onClick={() => navigate(-1)} className="btn-secondary mt-4">Go back</button>
        </div>
      </div>
    );
  }

  // Get other user info from channel
  const otherUser = Object.values(channel.state.members).find(m => m.user.id !== authUser._id)?.user;
  const otherLat = otherUser?.lat || otherUser?.extraData?.lat;
  const otherLon = otherUser?.lon || otherUser?.extraData?.lon;
  let distance = null;
  if (authUser?.lat && otherLat) {
    distance = getDistanceKm(authUser.lat, authUser.lon, otherLat, otherLon);
  }

  return (
    <div className="h-screen flex flex-col" style={{ background: "oklch(var(--b1))" }}>
      <Chat client={chatClient}>
        <Channel channel={channel} typingEvents={true}>
          <Window>
            {/* Custom header */}
            <div className="flex items-center justify-between px-4 py-3 flex-shrink-0"
              style={{ background: "oklch(var(--b2))", borderBottom: "1px solid var(--border)" }}>
              <div className="flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="btn-icon h-8 w-8 mr-1">
                  <ArrowLeft size={18} />
                </button>
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="h-10 w-10 rounded-full overflow-hidden" style={{ background: "oklch(var(--b3))" }}>
                    {otherUser?.image
                      ? <img src={otherUser.image} alt="" className="h-full w-full object-cover" />
                      : <span className="flex h-full w-full items-center justify-center text-sm font-bold" style={{ color: "var(--text-secondary)" }}>
                          {otherUser?.name?.[0]?.toUpperCase() || "?"}
                        </span>
                    }
                  </div>
                  {otherUser?.online && (
                    <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2"
                      style={{ background: "#00e676", borderColor: "oklch(var(--b2))" }} />
                  )}
                </div>
                {/* Name + location */}
                <div>
                  <p className="font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                    {otherUser?.name || "User"}
                  </p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {otherUser?.location && (
                      <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-muted)" }}>
                        <MapPin size={11} />{otherUser.location}
                      </span>
                    )}
                    {distance !== null && (
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                        • {distance.toFixed(1)} km away
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleDeleteConversation}
                  disabled={deleting}
                  className="btn-icon h-9 w-9"
                  title="Delete conversation"
                >
                  {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                </button>
                <button onClick={handleVideoCall}
                  className="btn-brand flex items-center gap-2 text-sm px-4 py-2">
                  <Video size={15} />
                  <span className="hidden sm:inline">Call</span>
                </button>
              </div>
            </div>

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

      {/* Incoming call modal */}
      {incomingCall && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="glass rounded-2xl p-8 w-[90%] max-w-sm text-center animate-fade-in"
            style={{ border: "1px solid var(--border)" }}>
            <div className="flex h-16 w-16 items-center justify-center rounded-full mx-auto mb-4 animate-pulse"
              style={{ background: "oklch(var(--p) / 0.2)" }}>
              <Video size={28} style={{ color: "oklch(var(--p))" }} />
            </div>
            <h2 className="font-display font-bold text-xl mb-1" style={{ color: "var(--text-primary)" }}>Incoming Video Call</h2>
            <p className="text-sm mb-6" style={{ color: "var(--text-secondary)" }}>
              {incomingCall.senderName} is calling you
            </p>
            <div className="flex gap-3">
              <button className="btn-secondary flex-1" onClick={() => setIncomingCall(null)}>Decline</button>
              <button className="btn-brand flex-1" onClick={() => { navigate(`/call/${incomingCall.callId}`); setIncomingCall(null); }}>
                Accept
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ChatPage;
