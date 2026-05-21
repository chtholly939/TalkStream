import { generateStreamToken } from "../lib/stream.js";
import { StreamChat } from "stream-chat";

const streamClient = StreamChat.getInstance(
  process.env.STEAM_API_KEY,
  process.env.STEAM_API_SECRET
);

export async function getStreamToken(req, res) {
  try {
    const token = generateStreamToken(req.user.id);

    res.status(200).json({ token });
  } catch (error) {
    console.log("Error in getStreamToken controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function deleteConversation(req, res) {
  try {
    const userId = req.user._id.toString();
    const { targetUserId } = req.params;

    if (!targetUserId || targetUserId === userId) {
      return res.status(400).json({ message: "Invalid conversation" });
    }

    const channelId = [userId, targetUserId].sort().join("-");
    const channel = streamClient.channel("messaging", channelId);
    await channel.query({ state: true });

    if (!channel.state.members[userId]) {
      return res.status(403).json({ message: "You are not a member of this conversation" });
    }

    await channel.hide(userId, true);

    res.status(200).json({ message: "Conversation deleted on your end" });
  } catch (error) {
    console.log("Error in deleteConversation controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
