import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  getMyFriends,
  getOutgoingFriendReqs,
  getRecommendedUsers,
  updateProfile,
  getAllUsers,
  acceptFriendRequest,
  getFriendRequests,
  removeFriend,
  sendFriendRequest,
  getFriendsLocations,       // NEW
} from "../controllers/user.controller.js";

const router = express.Router();

// apply auth middleware to all routes
router.use(protectRoute);

router.get("/all", getAllUsers);
router.get("/chats", getMyFriends);
router.get("/friends/locations", getFriendsLocations);   // NEW – live map

router.post("/friend-request/:id", sendFriendRequest);
router.put("/friend-request/:id/accept", acceptFriendRequest);
router.delete("/friend/:id", removeFriend);

router.get("/friend-requests", getFriendRequests);
router.get("/outgoing-friend-requests", getOutgoingFriendReqs);

router.put("/profile", updateProfile);

export default router;