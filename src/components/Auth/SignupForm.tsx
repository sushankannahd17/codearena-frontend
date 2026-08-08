import { useNavigate } from "react-router-dom";
import { PasswordInput, SpinnerIcon } from "../ui";

interface SignupFormProps {
  fullName: string;
  onFullNameChange: (v: string) => void;
  email: string;
  onEmailChange: (v: string) => void;
  password: string;
  onPasswordChange: (v: string) => void;
  showPassword: boolean;
  onToggleShowPassword: () => void;
  error: string;
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export default function SignupForm({
  fullName,
  onFullNameChange,
  email,
  onEmailChange,
  password,
  onPasswordChange,
  showPassword,
  onToggleShowPassword,
  error,
  loading,
  onSubmit,
}: SignupFormProps) {
  const navigate = useNavigate();

  return (
    <div
      className="w-full max-w-[420px] rounded-2xl p-8 animate-fade-in-up"
      style={{
        backgroundColor: "var(--bg-card)",
        border: "1px solid var(--border-color)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <h1 className="text-[28px] font-bold mb-1" style={{ color: "var(--text-primary)" }}>
        Create Account
      </h1>
      <p className="text-[14px] mb-7" style={{ color: "var(--text-muted)" }}>
        Join Clash Coding today
      </p>

      <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
        {/* Full Name */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="signup-fullname"
            className="text-[13px] font-semibold"
            style={{ color: "var(--text-secondary)" }}
          >
            Full Name
          </label>
          <div className="relative">
            <span
              className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--text-muted)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </span>
            <input
              id="signup-fullname"
              type="text"
              value={fullName}
              onChange={(e) => onFullNameChange(e.target.value)}
              placeholder="Enter your full name"
              className="cc-input w-full pl-10 pr-4 py-3 text-[14px] rounded-xl outline-none border transition-all duration-200"
            />
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="signup-email"
            className="text-[13px] font-semibold"
            style={{ color: "var(--text-secondary)" }}
          >
            Email ID
          </label>
          <div className="relative">
            <span
              className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--text-muted)" }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </span>
            <input
              id="signup-email"
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="Enter your email address"
              className="cc-input w-full pl-10 pr-4 py-3 text-[14px] rounded-xl outline-none border transition-all duration-200"
            />
          </div>
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="signup-password"
            className="text-[13px] font-semibold"
            style={{ color: "var(--text-secondary)" }}
          >
            Password
          </label>
          <PasswordInput
            id="signup-password"
            value={password}
            onChange={onPasswordChange}
            placeholder="Create a password (min. 6 chars)"
            showPassword={showPassword}
            onToggleShow={onToggleShowPassword}
            toggleButtonId="signup-toggle-password"
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-[13px] text-red-500 -mt-2 animate-shake">{error}</p>
        )}

        {/* Submit */}
        <button
          id="signup-submit-btn"
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#2563eb] text-white text-[15px] font-semibold
            hover:bg-[#1d54d4] active:scale-[0.98] transition-all duration-200 shadow-md shadow-[#2563eb]/20
            disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer mt-1"
        >
          {loading ? (
            <SpinnerIcon />
          ) : (
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="22" y1="11" x2="16" y2="11" />
            </svg>
          )}
          {loading ? "Creating account…" : "Sign Up"}
        </button>
      </form>

      <p className="text-center text-[13px] mt-6" style={{ color: "var(--text-muted)" }}>
        Already have an account?{" "}
        <button
          id="signup-goto-login-btn"
          type="button"
          onClick={() => navigate("/login")}
          className="text-[#2563eb] font-semibold hover:underline cursor-pointer bg-transparent border-none p-0"
        >
          Login
        </button>
      </p>
    </div>
  );
}

