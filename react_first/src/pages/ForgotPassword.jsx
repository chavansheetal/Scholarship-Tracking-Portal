import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUserByEmail, getUserByAppId, updateUserPassword } from "../store";
import { sendOTPEmail } from "../emailService";
import "../styles/Auth.css";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep]               = useState(1);
  const [email, setEmail]             = useState("");
  const [enteredOtp, setEnteredOtp]   = useState("");
  const [newPwd, setNewPwd]           = useState("");
  const [confirmPwd, setConfirmPwd]   = useState("");
  const [showPwd, setShowPwd]         = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError]             = useState("");
  const [loading, setLoading]         = useState(false);
  const [sentOtp, setSentOtp]         = useState("");
  const [foundUser, setFoundUser]     = useState(null);

  /* ── STEP 1: send OTP to email ── */
  const handleSendOtp = async () => {
    setError("");
    const trimmed = email.trim();
    if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);

    try {
      // Try to find user by email
      const user = await getUserByEmail(trimmed);
      if (!user) {
        // Also try localStorage fallback for backward compatibility
        const savedEmail = localStorage.getItem("nsp_registered_email");
        const savedAppId = localStorage.getItem("nsp_app_id");
        if (savedEmail && savedEmail.toLowerCase() === trimmed.toLowerCase() && savedAppId) {
          const userByAppId = await getUserByAppId(savedAppId);
          if (userByAppId) {
            const code = String(Math.floor(100000 + Math.random() * 900000));
            setSentOtp(code);
            setFoundUser(userByAppId);

            // Send OTP via email
            const emailResult = await sendOTPEmail(trimmed, code);
            if (!emailResult.success) {
              setError("Failed to send OTP email. Please try again.");
              return;
            }

            setStep(2);
            return;
          }
        }
        setError(
          "No account found with this email address. " +
          "Please check your registered email or register a new account."
        );
        return;
      }
      const code = String(Math.floor(100000 + Math.random() * 900000));
      setSentOtp(code);
      setFoundUser(user);

      // Send OTP via email
      const emailResult = await sendOTPEmail(trimmed, code);
      if (!emailResult.success) {
        setError("Failed to send OTP email. Please try again.");
        return;
      }

      setStep(2);
    } catch (error) {
      console.error("Error sending OTP:", error);
      setError("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ── STEP 2: verify OTP ── */
  const handleVerifyOtp = () => {
    setError("");
    if (!enteredOtp.trim()) { setError("Please enter the OTP."); return; }
    if (enteredOtp.trim() !== sentOtp) {
      setError("Incorrect OTP. Please check your email and try again.");
      return;
    }
    setStep(3);
  };

  /* ── Resend OTP ── */
  const handleResendOtp = async () => {
    setError("");
    const trimmed = email.trim();
    if (!trimmed) {
      setError("Email address not found. Please restart the process.");
      return;
    }

    try {
      const code = String(Math.floor(100000 + Math.random() * 900000));
      setSentOtp(code);

      // Send OTP via email
      const emailResult = await sendOTPEmail(trimmed, code);
      if (!emailResult.success) {
        setError("Failed to resend OTP email. Please try again.");
        return;
      }

      setError("OTP resent successfully. Check your email.");
    } catch (error) {
      console.error("Error resending OTP:", error);
      setError("Failed to resend OTP. Please try again.");
    }
  };

  /* ── STEP 3: reset password ── */
  const handleResetPassword = async () => {
    setError("");
    if (!foundUser) {
      setError("Session expired. Please restart password reset.");
      setStep(1);
      return;
    }
    if (!newPwd.trim()) {
      setError("Please enter a new password.");
      return;
    }
    if (newPwd.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }
    if (newPwd !== confirmPwd) {
      setError("Passwords do not match.");
      return;
    }

    const ok = await updateUserPassword(foundUser.id || foundUser.appId, newPwd);
    if (!ok) { setError("Something went wrong. Please try again."); return; }
    alert("✅ Password reset successfully!\n\nYou can now login with your new password.");
    navigate("/login");
  };

  return (
    <div className="forgot-page">
      <div className="forgot-card">

        {/* ─── STEP 1: Enter Email ─── */}
        {step === 1 && (
          <>
            <span className="forgot-icon">🔑</span>
            <h2 className="forgot-title">Forgot Password</h2>
            <p className="forgot-sub">Enter your registered email</p>
            <div className="forgot-body">
              {error && <div className="forgot-error">⚠️ {error}</div>}
              <input
                type="email"
                className="forgot-input"
                placeholder="Enter your registered email address"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleSendOtp()}
                autoFocus
              />
              <button className="forgot-btn" onClick={handleSendOtp} disabled={loading}>
                {loading ? "Sending..." : "Send OTP"}
              </button>
              <Link to="/login" className="forgot-back">Back to Login</Link>
            </div>
          </>
        )}

        {/* ─── STEP 2: Enter OTP ─── */}
        {step === 2 && (
          <>
            <span className="forgot-icon">🔒</span>
            <h2 className="forgot-title">Forgot Password</h2>
            <p className="forgot-sub">Enter the OTP sent to your email</p>
            <div className="forgot-body">
              {error && <div className="forgot-error">⚠️ {error}</div>}
              <div className="forgot-otp-hint">
                📧 OTP sent to your email — check your inbox and enter it below.
              </div>
              <input
                type="text"
                className="forgot-input forgot-otp-input"
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                value={enteredOtp}
                onChange={e => setEnteredOtp(e.target.value.replace(/\D/, ""))}
                onKeyDown={e => e.key === "Enter" && handleVerifyOtp()}
                autoFocus
              />
              <button className="forgot-btn" onClick={handleVerifyOtp}>
                Verify OTP
              </button>
              <button
                className="forgot-resend"
                onClick={handleResendOtp}
              >
                Resend OTP
              </button>
              <Link to="/login" className="forgot-back">Back to Login</Link>
            </div>
          </>
        )}

        {/* ─── STEP 3: Set New Password ─── */}
        {step === 3 && (
          <>
            <span className="forgot-icon">🔑</span>
            <h2 className="forgot-title">Set New Password</h2>
            <p className="forgot-sub">Create a strong new password</p>
            <div className="forgot-body">
              {error && <div className="forgot-error">⚠️ {error}</div>}
              <div className="forgot-pwd-wrap">
                <input
                  type={showPwd ? "text" : "password"}
                  className="forgot-input"
                  placeholder="New Password (min 6 chars)"
                  value={newPwd}
                  onChange={e => setNewPwd(e.target.value)}
                  autoFocus
                />
                <button type="button" className="forgot-eye" onClick={() => setShowPwd(p => !p)}>
                  {showPwd ? "🙈" : "👁️"}
                </button>
              </div>
              <div className="forgot-pwd-wrap">
                <input
                  type={showConfirm ? "text" : "password"}
                  className="forgot-input"
                  placeholder="Confirm New Password"
                  value={confirmPwd}
                  onChange={e => setConfirmPwd(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleResetPassword()}
                />
                <button type="button" className="forgot-eye" onClick={() => setShowConfirm(p => !p)}>
                  {showConfirm ? "🙈" : "👁️"}
                </button>
              </div>
              <button className="forgot-btn" onClick={handleResetPassword}>
                Reset Password
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
