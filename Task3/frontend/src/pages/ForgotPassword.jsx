import axios from "axios";
import React, { useState } from "react";
import { ClipLoader } from "react-spinners";
import { serverUrl } from "../App.jsx";

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  // STEP 1 — SEND OTP
  const handleStep1 = async () => {
    if (!email) return alert("Email is required");

    setLoading(true);
    setErr("");

    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/sendOtp`,
        { email },
        { withCredentials: true }
      );
      console.log("OTP Sent:", result.data);
      setStep(2);
    } catch (error) {
      setErr(error.response?.data?.message || "Invalid email");
    } finally {
      setLoading(false);
    }
  };

  // STEP 2 — VERIFY OTP
  const handleStep2 = async () => {
    if (!otp) return alert("OTP is required");

    setLoading(true);
    setErr("");

    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/verifyOtp`,
        { email, otp },
        { withCredentials: true }
      );
      console.log("OTP Verified:", result.data);
      setStep(3);
    } catch (error) {
      setErr(error.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  // STEP 3 — RESET PASSWORD
  const handleStep3 = async () => {
    if (!newPassword || !confirmNewPassword)
      return alert("All fields are required");

    if (newPassword !== confirmNewPassword)
      return alert("Passwords do not match");

    setLoading(true);
    setErr("");

    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/resetPassword`,
        { email, password: newPassword },
        { withCredentials: true }
      );
      console.log("Password Reset Success:", result.data);

      alert("Password reset successful");

      // Reset state
      setStep(1);
      setEmail("");
      setOtp("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (error) {
      setErr(error.response?.data?.message || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-screen bg-linear-to-b from-black to-gray-900 flex justify-center items-center">

      {/* STEP 1 */}
      {step === 1 && (
        <div className="w-[90%] max-w-125 h-125 bg-white rounded-2xl flex flex-col items-center justify-center">
          <h2 className="text-[30px] font-semibold">Forgot Password</h2>

          <input
            type="email"
            placeholder="Enter Email"
            className="w-[90%] h-12.5 border-2 border-black rounded-2xl px-5 mt-7.5"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {err && <p className="text-red-500 mt-2">{err}</p>}

          <button
            className="w-[70%] h-12.5 mt-7.5 bg-black text-white rounded-2xl"
            onClick={handleStep1}
            disabled={loading}
          >
            {loading ? <ClipLoader size={30} color="white" /> : "Send OTP"}
          </button>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="w-[90%] max-w-125 h-125 bg-white rounded-2xl flex flex-col items-center justify-center">
          <h2 className="text-[30px] font-semibold">Verify OTP</h2>

          <input
            type="text"
            placeholder="Enter OTP"
            className="w-[90%] h-12.5 border-2 border-black rounded-2xl px-5 mt-7.5"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />

          {err && <p className="text-red-500 mt-2">{err}</p>}

          <button
            className="w-[70%] h-12.5 mt-7.5 bg-black text-white rounded-2xl"
            onClick={handleStep2}
            disabled={loading}
          >
            {loading ? <ClipLoader size={30} color="white" /> : "Verify OTP"}
          </button>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="w-[90%] max-w-125 h-125 bg-white rounded-2xl flex flex-col items-center justify-center">
          <h2 className="text-[30px] font-semibold">Reset Password</h2>

          <input
            type="password"
            placeholder="New Password"
            className="w-[90%] h-12.5 border-2 border-black rounded-2xl px-5 mt-7.5"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <input
            type="password"
            placeholder="Confirm Password"
            className="w-[90%] h-12.5 border-2 border-black rounded-2xl px-5 mt-5"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
          />

          {err && <p className="text-red-500 mt-2">{err}</p>}

          <button
            className="w-[70%] h-12.5 mt-7.5 bg-black text-white rounded-2xl"
            onClick={handleStep3}
            disabled={loading}
          >
            {loading ? <ClipLoader size={30} color="white" /> : "Reset Password"}
          </button>
        </div>
      )}
    </div>
  );
};

export default ForgotPassword;
