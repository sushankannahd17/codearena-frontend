import { useNavigate } from "react-router-dom";
import { PasswordInput, SpinnerIcon } from "../ui";

interface LoginFormProps {
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

export default function LoginForm({
  email,
  onEmailChange,
  password,
  onPasswordChange,
  showPassword,
  onToggleShowPassword,
  error,
  loading,
  onSubmit,
}: LoginFormProps) {
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
      {/* Heading */}
      <h1 className="text-[28px] font-bold mb-1" style={{ color: "var(--text-primary)" }}>
        Welcome Back
      </h1>
      <p className="text-[14px] mb-7" style={{ color: "var(--text-muted)" }}>
        Login to your Clash Coding account
      </p>

      <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
        {/* Email */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="login-email"
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
              id="login-email"
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
            htmlFor="login-password"
            className="text-[13px] font-semibold"
            style={{ color: "var(--text-secondary)" }}
          >
            Password
          </label>
          <PasswordInput
            id="login-password"
            value={password}
            onChange={onPasswordChange}
            placeholder="Enter your password"
            showPassword={showPassword}
            onToggleShow={onToggleShowPassword}
            toggleButtonId="login-toggle-password"
          />

          <div className="flex justify-end mt-0.5">
            <button
              type="button"
              id="login-forgot-password-btn"
              onClick={() => navigate("/forgot-password")}
              className="text-[13px] text-[#2563eb] font-medium hover:underline cursor-pointer transition-colors duration-150"
            >
              Forgot Password?
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-[13px] text-red-500 -mt-2 animate-shake">{error}</p>
        )}

        {/* Submit */}
        <button
          id="login-submit-btn"
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
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
              <polyline points="10 17 15 12 10 7" />
              <line x1="15" y1="12" x2="3" y2="12" />
            </svg>
          )}
          {loading ? "Logging in…" : "Login"}
        </button>
      </form>

      <p className="text-center text-[13px] mt-6" style={{ color: "var(--text-muted)" }}>
        Don&apos;t have an account?{" "}
        <button
          type="button"
          id="login-goto-signup-link"
          onClick={() => navigate("/signup")}
          className="text-[#2563eb] font-semibold hover:underline cursor-pointer bg-transparent border-none p-0"
        >
          Sign Up
        </button>
      </p>
    </div>
  );
}

