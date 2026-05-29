import express from "express";
import "dotenv/config";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import chatRoutes from "./routes/chat.route.js";

import callRoutes from "./routes/call.route.js";
import groupRoutes from "./routes/group.route.js"; 

import { connectDB } from "./lib/db.js";

const app = express();
const PORT = process.env.PORT;

// const __dirname = path.resolve();

const allowedOrigins = [
  "http://localhost:5173",
  "https://talk-stream-eight.vercel.app",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/calls", callRoutes);
app.use("/api/groups", groupRoutes); 

// if (process.env.NODE_ENV === "production") {
//   app.use(express.static(path.join(__dirname, "../frontend/dist")));

//   app.get("*", (req, res) => {
//     res.sendFile(path.join(__dirname, "../frontend", "dist", "index.html"));
//   });
// }

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});
