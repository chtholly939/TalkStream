import Call from "../models/Call.js";

export const createCallLog = async (req, res) => {
  try {
    const {
      receiver,
      callType,
      status,
      duration,
    } = req.body;

    const newCall = await Call.create({
      caller: req.user._id,
      receiver,
      callType,
      status,
      duration,
    });

    res.status(201).json(newCall);
  } catch (error) {
    console.log("Error in createCallLog:", error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getCallLogs = async (req, res) => {
  try {
    const calls = await Call.find({
      $or: [
        { caller: req.user._id },
        { receiver: req.user._id },
      ],
    })
      .populate("caller", "fullName profilePic")
      .populate("receiver", "fullName profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json(calls);
  } catch (error) {
    console.log("Error in getCallLogs:", error);

    res.status(500).json({
      message: "Internal server error",
    });
  }
};