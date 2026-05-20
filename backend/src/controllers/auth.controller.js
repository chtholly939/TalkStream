import { upsertStreamUser } from "../lib/stream.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import cloudinary from "../lib/cloudinary.js";
//import { sendOtpEmail } from "../lib/mail.js";
import bcrypt from "bcryptjs";

export async function signup(req, res) {
  const { email, password, fullName } = req.body;

  try {
    console.log("Signup API HIT");
    if (!email || !password || !fullName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists, please use a diffrent one" });
    }

    const idx = Math.floor(Math.random() * 100) + 1; // generate a num between 1-100
    const randomAvatar = `https://api.dicebear.com/7.x/initials/svg?seed=${fullName}`;

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = await User.create({
      email,
      fullName,
      password,
      profilePic: randomAvatar,

      // otp: otp,
      // otpExpires: Date.now() + 10 * 60 * 1000, // 10 mins
    });

    // try {
    //   console.log("About to send OTP:", email, otp);
    //   await sendOtpEmail(email, otp);
    // } catch (error) {
    //   console.error("Email failed but continuing signup:", error.message);
    // }
    try {
      await upsertStreamUser({
        id: newUser._id.toString(),
        name: newUser.fullName,
        image: newUser.profilePic || "",
      });
      console.log(`Stream user created for ${newUser.fullName}`);
    } catch (error) {
      console.log("Error creating Stream user:", error);
    }

    return res.status(201).json({
      success: true,
      message: "OTP generated successfully",
    });
    
  } catch (error) {
    console.log("Error in signup controller", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isPasswordCorrect = await user.matchPassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    // 🔐 generate JWT
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );

    // 🍪 set cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      secure: process.env.NODE_ENV === "production",
    });

    return res.status(200).json({
      success: true,
      user,
    });

  } catch (error) {
    console.log("Error in login controller", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export function logout(req, res) {
  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    secure: process.env.NODE_ENV === "production",
  });
  res.status(200).json({ success: true, message: "Logout successful" });
}

export async function onboard(req, res) {
  try {
    const userId = req.user._id;

    const { fullName, bio, location, profilePic, lat, lon } = req.body;

    if (!fullName || !bio || !location) {
      return res.status(400).json({
        message: "All fields are required",
        missingFields: [
          !fullName && "fullName",
          !bio && "bio",
          !location && "location",
        ].filter(Boolean),
      });
    }

    let imageUrl;

    if (profilePic) {
      const uploadRes = await cloudinary.uploader.upload(profilePic, {
        folder: "talkstream/profile_pics",
      });
      imageUrl = uploadRes.secure_url;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        fullName,
        bio,
        location,
        lat,
        lon,
        profilePic: imageUrl || profilePic,
        isOnboarded: true,
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    try {
      await upsertStreamUser({
        id: updatedUser._id.toString(),
        name: updatedUser.fullName,
        image: updatedUser.profilePic,
        location: updatedUser.location,
        lat: updatedUser.lat,
        lon: updatedUser.lon,
      });
    } catch (err) {
      console.log("Stream update error:", err.message);
    }

    res.status(200).json({ success: true, user: updatedUser });

  } catch (error) {
    console.error("Onboarding error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function sendOtp(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // generate OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // store OTP (temporary)
    global.otpStore = global.otpStore || {};
    global.otpStore[email] = otp;

    console.log("OTP for", email, ":", otp); // 👈 DEBUG

    await sendOtpEmail(email, otp);

    return res.status(200).json({
      message: "OTP sent successfully",
    });

  } catch (error) {
    console.error("Error in sendOtp:", error);
    return res.status(500).json({
      message: "Failed to send OTP",
    });
  }
}

export async function verifyOtp(req, res) {
  try {
    const { fullName, email, password, otp } = req.body;

    if (!fullName || !email || !password || !otp) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // check OTP
    if (!global.otpStore || global.otpStore[email] != otp) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    // check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // create user
    const newUser = await User.create({
      fullName,
      email,
      password,
    });

    // delete OTP after success
    delete global.otpStore[email];

    return res.status(201).json({
      success: true,
      message: "Account created successfully",
      user: newUser,
    });

  } catch (error) {
    console.error("Error in verifyOtp:", error);
    return res.status(500).json({
      message: "Server error",
    });
  }
}