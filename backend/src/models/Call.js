import mongoose from "mongoose";

const callSchema = new mongoose.Schema(
  {
    caller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    callType: {
      type: String,
      enum: ["voice", "video"],
      default: "video",
    },

    status: {
      type: String,
      enum: ["missed", "answered", "declined"],
      default: "answered",
    },

    duration: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Call = mongoose.model("Call", callSchema);

export default Call;