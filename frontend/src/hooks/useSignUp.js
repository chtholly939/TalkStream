import { useState } from "react";
import { axiosInstance } from "../lib/axios"; // adjust path if needed

export const useSignUp = () => {
  const [loading, setLoading] = useState(false);

  const signup = async (formData) => {
    try {
      setLoading(true);

      const res = await axiosInstance.post("/auth/signup", formData);

      return res.data.success;
    } catch (error) {
      console.error("Signup error:", error.response?.data || error.message);
      alert(error.response?.data?.message || "Signup failed");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { signup, loading };
};