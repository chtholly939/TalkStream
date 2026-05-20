import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useAuthStore = create((set) => ({
  isSigningUp: false,

  sendOtp: async (email) => {
    try {
      set({ isSigningUp: true });

      const res = await axiosInstance.post("/auth/send-otp", { email });

      toast.success(res.data.message);
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to send OTP");
      return false;
    } finally {
      set({ isSigningUp: false });
    }
  },

  verifyOtp: async (data) => {
    try {
      set({ isSigningUp: true });

      const res = await axiosInstance.post("/auth/verify-otp", data);

      toast.success("Account created successfully");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Invalid OTP");
      return false;
    } finally {
      set({ isSigningUp: false });
    }
  },
}));