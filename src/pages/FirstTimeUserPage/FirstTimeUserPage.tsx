import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../services/api";
import { PasswordInput, SpinnerIcon } from "../../components/ui";

type Step = "form" | "success";

export default function FirstTimeUserPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("form");

  const [email, setEmail]               = useState("");
  const [otp, setOtp]                   = useState("");
  const [password, setPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);

  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [countdown, setCountdown] = useState(5);

  // Auto-redirect to login after success
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (step === "success") {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate("/login");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => { if (timer) clearInterval(timer); };
  }, [step, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim())            { setError("Please enter your email address."); return; }
    if (!otp.trim())              { setError("Please enter the OTP from your invitation email."); return; }
    if (!password)                { setError("Please enter a password."); return; }
    if (password.length < 6)     { setError("Password must be at least 6 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }

    setLoading(true);
    try {
      await authApi.changePassword({ recipient: email.trim(), otp: otp.trim(), password });
      setStep("success");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to set password. Please check your OTP and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="flex-grow flex items-center justify-center px-4 py-16 transition-colors duration-300"
      style={{ backgroundColor: "var(--bg-subtle)" }}
    >
      <div
        className="w-full max-w-[440px] rounded-2xl p-8 animate-fade-in-up"
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        {step === "form" && (
          <div>
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)" }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white"
                  strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div>
                <h1 className="text-[22px] font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
                  Welcome to Clash Coding
                </h1>
                <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>
                  Set up your account to get started
                </p>
              </div>
            </div>

            {/* Info banner */}
            <div
              className="flex items-start gap-3 px-4 py-3 rounded-xl mb-6 text-[13px]"
              style={{
                background: "rgba(37,99,235,0.07)",
                border: "1px solid rgba(37,99,235,0.18)",
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb"
                strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span style={{ color: "var(--text-secondary)" }}>
                Enter your <strong>email</strong>, the <strong>OTP from your invitation email</strong>, and choose a new password.
              </span>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="ftu-email" className="text-[13px] font-semibold" style={{ color: "var(--text-secondary)" }}>
                  Email Address
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-muted)" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </span>
                  <input
                    id="ftu-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="cc-input w-full pl-10 pr-4 py-3 text-[14px] rounded-xl outline-none border transition-all duration-200"
                  />
                </div>
              </div>

              {/* OTP */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="ftu-otp" className="text-[13px] font-semibold" style={{ color: "var(--text-secondary)" }}>
                  One-Time Password (OTP)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-muted)" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                      strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
                    </svg>
                  </span>
                  <input
                    id="ftu-otp"
                    type="text"
                    pattern="[0-9]*"
                    inputMode="numeric"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="OTP from your invitation email"
                    className="cc-input w-full pl-10 pr-4 py-3 text-[14px] rounded-xl outline-none border transition-all duration-200"
                  />
                </div>
              </div>

              {/* New Password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="ftu-password" className="text-[13px] font-semibold" style={{ color: "var(--text-secondary)" }}>
                  New Password
                </label>
                <PasswordInput
                  id="ftu-password"
                  value={password}
                  onChange={setPassword}
                  placeholder="At least 6 characters"
                  showPassword={showPassword}
                  onToggleShow={() => setShowPassword((v) => !v)}
                  toggleButtonId="ftu-toggle-password"
                />
              </div>

              {/* Confirm Password */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="ftu-confirm-password" className="text-[13px] font-semibold" style={{ color: "var(--text-secondary)" }}>
                  Confirm Password
                </label>
                <PasswordInput
                  id="ftu-confirm-password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  placeholder="Re-enter your password"
                  showPassword={showConfirm}
                  onToggleShow={() => setShowConfirm((v) => !v)}
                  toggleButtonId="ftu-toggle-confirm-password"
                />
              </div>

              {/* Error */}
              {error && (
                <p className="text-[13px] text-red-500 -mt-2 animate-shake">{error}</p>
              )}

              {/* Submit */}
              <button
                id="ftu-submit-btn"
                type="submit"
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white text-[15px] font-semibold
                  active:scale-[0.98] transition-all duration-200 shadow-md
                  disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer mt-1"
                style={{
                  background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
                  boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
                }}
              >
                {loading ? <SpinnerIcon /> : (
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
                {loading ? "Setting up account…" : "Activate Account"}
              </button>
            </form>

            <p className="text-center text-[13px] mt-6" style={{ color: "var(--text-muted)" }}>
              Already have an account?{" "}
              <button
                id="ftu-login-link"
                type="button"
                onClick={() => navigate("/login")}
                className="text-[#2563eb] font-semibold hover:underline cursor-pointer bg-transparent border-none p-0"
              >
                Log in
              </button>
            </p>
          </div>
        )}

        {step === "success" && (
          <div className="text-center py-4 flex flex-col items-center">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-6 animate-fade-in"
              style={{
                background: "rgba(16,185,129,0.12)",
                border: "2px solid rgba(16,185,129,0.3)",
              }}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#10b981"
                strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>

            <h1 className="text-[26px] font-extrabold mb-3 tracking-tight" style={{ color: "var(--text-primary)" }}>
              Account Activated!
            </h1>
            <p className="text-[14px] mb-8 leading-relaxed" style={{ color: "var(--text-muted)" }}>
              Your password has been set successfully. You can now log in and start competing in coding contests.
            </p>

            <button
              id="ftu-go-to-login-btn"
              onClick={() => navigate("/login")}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-white text-[15px] font-semibold
                active:scale-[0.98] transition-all duration-200 cursor-pointer"
              style={{
                background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
                boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
              }}
            >
              Go to Login
            </button>

            <p className="text-[12px] mt-4" style={{ color: "var(--text-muted)" }}>
              Redirecting in{" "}
              <span className="font-semibold" style={{ color: "var(--text-primary)" }}>{countdown}s</span>…
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
