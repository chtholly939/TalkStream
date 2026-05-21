import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createGroup,
  getMyGroups,
  addMember,
  leaveGroup,
} from "../controllers/group.controller.js";

const router = express.Router();

router.post("/create", protectRoute, createGroup);
router.get("/", protectRoute, getMyGroups);
router.post("/:channelId/add-member", protectRoute, addMember);
router.delete("/:channelId/leave", protectRoute, leaveGroup);

export default router;