import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";
import { createCallLog } from "../lib/api";
import { useSearchParams } from "react-router-dom";

import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";

import "@stream-io/video-react-sdk/dist/css/styles.css";
import toast from "react-hot-toast";
import PageLoader from "../components/PageLoader";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const CallPage = () => {
  const { id: callId } = useParams();
  const [client, setClient] = useState(null);
  const [callStartTime] = useState(Date.now());
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [videoClient, setVideoClient] = useState(null);
  const [searchParams] = useSearchParams();

  const isCaller =
    searchParams.get("caller") === "true";

  const { authUser, isLoading } = useAuthUser();

  const otherUserId = callId.split("-").find(
    (id) => id !== authUser?._id
  );

  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    const initCall = async () => {
      if (!tokenData.token || !authUser || !callId) return;

      try {
        console.log("Initializing Stream video client...");

        const user = {
          id: authUser._id,
          name: authUser.fullName,
          image: authUser?.profilePic || "",
        };

        const videoClient = new StreamVideoClient({
          apiKey: STREAM_API_KEY,
          user,
          token: tokenData.token,
        });

        const callInstance = videoClient.call("default", callId);

        await callInstance.join({ create: true });

        console.log("Joined call successfully");

        setClient(videoClient);
        setCall(callInstance);
      } catch (error) {
        console.error("Error joining call:", error);
        toast.error("Could not join the call. Please try again.");
      } finally {
        setIsConnecting(false);
      }
    };

    initCall();
    
  }, [tokenData, authUser, callId]);

  useEffect(() => {
    return () => {
      if (call) {
        call.leave();
      }

      if (client) {
        client.disconnectUser();
      }
    };
  }, [call, client]);

  if (isLoading || isConnecting) return <PageLoader />;

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className="relative">
        {client && call ? (
          <StreamVideo client={client}>
            <StreamCall call={call}>
              <CallContent
                callStartTime={callStartTime}
                otherUserId={otherUserId}
                isCaller={isCaller}
              />
            </StreamCall>
          </StreamVideo>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p>Could not initialize call. Please refresh or try again later.</p>
          </div>
        )}
      </div>
    </div>
  );
};

const CallContent = ({
  callStartTime,
  otherUserId,
  isCaller,
}) => {
  const { useCallCallingState, useParticipants } =
    useCallStateHooks();

  const callingState = useCallCallingState();
  const participants = useParticipants();

  const [wasAnswered, setWasAnswered] =
    useState(false);

  const currentUserId =
    participants.find((p) => p.isLocalParticipant)
      ?.userId;

  const navigate = useNavigate();

  useEffect(() => {
    const otherParticipants = participants.filter(
      (p) => p.userId !== currentUserId
    );

    if (otherParticipants.length > 0) {
      setWasAnswered(true);
    }
  }, [participants, currentUserId]);

  // Save call log when call ends
  useEffect(() => {
    const saveCallLog = async () => {
      if (callingState === CallingState.LEFT) {
        try {
          const durationInSeconds = Math.floor(
            (Date.now() - callStartTime) / 1000
          );

          const callStatus = wasAnswered
            ? "answered"
            : "missed";

          // ONLY caller creates log
          if (isCaller) {
            await createCallLog({
              receiver: otherUserId,
              callType: "video",
              status: callStatus,
              duration:
                callStatus === "missed"
                  ? 0
                  : durationInSeconds,
            });
          }
        } catch (error) {
          console.log(
            "Error saving call log:",
            error
          );
        }
      }
    };

    saveCallLog();
  }, [
    callingState,
    wasAnswered,
    callStartTime,
    otherUserId,
    isCaller,
  ]);

  // Redirect after leaving call
  useEffect(() => {
    if (callingState === CallingState.LEFT) {
      navigate("/");
    }
  }, [callingState, navigate]);

  return (
    <StreamTheme>
      <SpeakerLayout />
      <CallControls />
    </StreamTheme>
  );
};

export default CallPage;
