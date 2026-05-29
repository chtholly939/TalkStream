import { StreamChat } from "stream-chat";
import cloudinary from "../lib/cloudinary.js";

const streamClient = StreamChat.getInstance(
  process.env.STEAM_API_KEY,
  process.env.STEAM_API_SECRET
);

async function resolveGroupImage(image) {
  if (!image) return "";

  if (image.startsWith("data:image/")) {
    const uploadRes = await cloudinary.uploader.upload(image, {
      folder: "talkstream/group_pics",
    });
    return uploadRes.secure_url;
  }

  return image;
}

// POST /api/groups/create
export async function createGroup(req, res) {
  try {
    const { name, memberIds, image } = req.body;
    const creatorId = req.user._id.toString();

    if (!name || !memberIds || memberIds.length < 1) {
      return res
        .status(400)
        .json({ message: "Name and at least one member are required" });
    }

    // always include creator
    const allMemberIds = [...new Set([creatorId, ...memberIds.map(String)])];

    const channelId = `group-${Date.now()}-${creatorId.slice(-4)}`;
    const imageUrl = await resolveGroupImage(image);

    const channel = streamClient.channel("messaging", channelId, {
      name,
      image: imageUrl,
      members: allMemberIds,
      created_by_id: creatorId,
      isGroup: true,
    });

    await channel.create();

    res.status(201).json({ channelId, name });
  } catch (error) {
    console.error("Error creating group:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// GET /api/groups
export async function getMyGroups(req, res) {
  try {
    const userId = req.user._id.toString();

    const channels = await streamClient.queryChannels(
      { type: "messaging", members: { $in: [userId] }, isGroup: true },
      { last_message_at: -1 }
    );

    const groups = channels.map((ch) => ({
      id: ch.id,
      name: ch.data?.name,
      image: ch.data?.image,
      memberCount: Object.keys(ch.state?.members || {}).length,
      lastMessage: ch.state?.messages?.at(-1)?.text || "",
    }));

    res.status(200).json({ groups });
  } catch (error) {
    console.error("Error fetching groups:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// POST /api/groups/:channelId/add-member
export async function addMember(req, res) {
  try {
    const { channelId } = req.params;
    const { userId } = req.body;
    const requesterId = req.user._id.toString();

    const channel = streamClient.channel("messaging", channelId);
    await channel.watch();

    if (!channel.state.members[requesterId]) {
      return res.status(403).json({ message: "Not a member of this group" });
    }

    await channel.addMembers([userId.toString()]);
    res.status(200).json({ message: "Member added" });
  } catch (error) {
    console.error("Error adding member:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// PATCH /api/groups/:channelId/image
export async function updateGroupImage(req, res) {
  try {
    const { channelId } = req.params;
    const { image } = req.body;
    const requesterId = req.user._id.toString();

    if (!image) {
      return res.status(400).json({ message: "Group image is required" });
    }

    const channel = streamClient.channel("messaging", channelId);
    await channel.watch();

    if (!channel.state.members[requesterId]) {
      return res.status(403).json({ message: "Not a member of this group" });
    }

    const imageUrl = await resolveGroupImage(image);
    await channel.updatePartial({ set: { image: imageUrl } });

    res.status(200).json({ message: "Group photo updated", image: imageUrl });
  } catch (error) {
    console.error("Error updating group image:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// DELETE /api/groups/:channelId/leave
export async function leaveGroup(req, res) {
  try {
    const { channelId } = req.params;
    const userId = req.user._id.toString();

    const channel = streamClient.channel("messaging", channelId);
    await channel.removeMembers([userId]);

    res.status(200).json({ message: "Left group" });
  } catch (error) {
    console.error("Error leaving group:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
