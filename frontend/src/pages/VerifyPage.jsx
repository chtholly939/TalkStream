import { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import ThemeSelector from "../components/ThemeSelector";
import { verifyOtp, sendOtp } from "../lib/api";
import { useEffect } from "react";


const VerifyPage = () => {
  const [otp, setOtp] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  // 🔥 data from signup page
  const { fullName, email, password } = location.state || {};

  // 🚨 prevent direct access
  useEffect(() => {
    if (!email) {
      navigate("/signup");
    }
  }, [email, navigate]);

  // ✅ VERIFY OTP
  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await verifyOtp({
        fullName,
        email,
        password,
        otp,
      });

      if (res.success) {
        await queryClient.invalidateQueries({ queryKey: ["authUser"] });
        navigate("/");
      }
    } catch (error) {
      setErrorMsg(
        error?.response?.data?.message || "Invalid or expired OTP"
      );
    } finally {
      setLoading(false);
    }
  };

  // 🔁 RESEND OTP
  const handleResend = async () => {
    try {
      setResendLoading(true);
      await sendOtp ( email );
    } catch (error) {
      setErrorMsg(
        error?.response?.data?.message || "Failed to resend OTP"
      );
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-base-100 flex flex-col">

      {/* 🔥 Navbar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-base-300">
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/TSlogo.png"
            alt="TalkStream logo"
            className="h-7 w-7 rounded-lg object-contain"
          />
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
            TalkStream
          </span>
        </Link>

        <ThemeSelector />
      </div>

      {/* 🔥 Center */}
      <div className="flex flex-1 items-center justify-center px-4">
        <form
          onSubmit={handleVerify}
          className="bg-base-200 w-full max-w-md p-8 rounded-2xl shadow-xl space-y-5"
        >

          {/* Title */}
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold">Verify your email</h2>
            <p className="text-sm opacity-70">
              OTP sent to <span className="font-medium">{email}</span>
            </p>
          </div>

          {/* OTP Input */}
          <input
            type="text"
            placeholder="Enter OTP"
            className="input input-bordered w-full text-center tracking-widest text-lg"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            required
          />

          {/* Error */}
          {errorMsg && (
            <div className="alert alert-error text-sm">
              {errorMsg}
            </div>
          )}

          {/* Verify Button */}
          <button
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Verify & Continue"}
          </button>

          {/* Resend */}
          <div className="text-center text-sm">
            Didn’t receive code?{" "}
            <button
              type="button"
              onClick={handleResend}
              className="text-primary font-medium hover:underline"
              disabled={resendLoading}
            >
              {resendLoading ? "Sending..." : "Resend OTP"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerifyPage;
