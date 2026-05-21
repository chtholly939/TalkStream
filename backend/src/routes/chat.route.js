import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { deleteConversation, getStreamToken } from "../controllers/chat.controller.js";

const router = express.Router();

router.get("/token", protectRoute, getStreamToken);
router.delete("/conversations/:targetUserId", protectRoute, deleteConversation);

export default router;
