import express from "express";

import {
  createCallLog,
  getCallLogs,
} from "../controllers/call.controller.js";

import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, createCallLog);

router.get("/", protectRoute, getCallLogs);

export default router;