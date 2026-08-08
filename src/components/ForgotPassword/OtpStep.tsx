// Step 2: User enters the OTP and sets a new password.
import { PasswordInput, SpinnerIcon } from "../ui";

interface OtpStepProps {
  email: string;
  otp: string;
  onOtpChange: (val: string) => void;
  password: string;
  onPasswordChange: (val: string) => void;
  showPassword: boolean;
  onToggleShowPassword: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChangeEmail: () => void;
  onNavigateLogin: () => void;
  loading: boolean;
  error: string;
  message: string;
}

export default function OtpStep({
  email,
  otp,
  onOtpChange,
  password,
  onPasswordChange,
  showPassword,
  onToggleShowPassword,
  onSubmit,
  onChangeEmail,
  onNavigateLogin,
  loading,
  error,
  message,
}: OtpStepProps) {
  return (
    <div>
      <h1 className="text-[28px] font-bold mb-1" style={{ color: "var(--text-primary)" }}>
        Verify OTP
      </h1>
      <p className="text-[14px] mb-5" style={{ color: "var(--text-muted)" }}>
        We sent a verification code to{" "}
        <span className="font-semibold text-neutral-800 dark:text-neutral-200">{email}</span>.
        <button
          type="button"
          onClick={onChangeEmail}
          className="text-[#2563eb] hover:underline ml-1 font-medium bg-transparent border-none cursor-pointer p-0"
        >
          Change
        </button>
      </p>

      {/* Success message banner */}
      {message && (
        <div className="bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 p-3 rounded-xl text-[13px] border border-emerald-100 dark:border-emerald-900/35 mb-5 flex gap-2 items-start">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mt-0.5 shrink-0"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
          <span>{message}</span>
        </div>
      )}

      <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
        {/* OTP Input */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="reset-otp"
            className="text-[13px] font-semibold"
            style={{ color: "var(--text-secondary)" }}
          >
            Verification Code (OTP)
          </label>
          <div className="relative">
            <span
              className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--text-muted)" }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
              </svg>
            </span>
            <input
              id="reset-otp"
              type="text"
              pattern="[0-9]*"
              inputMode="numeric"
              value={otp}
              onChange={(e) => onOtpChange(e.target.value)}
              placeholder="Enter the OTP received"
              className="cc-input w-full pl-10 pr-4 py-3 text-[14px] rounded-xl outline-none border transition-all duration-200"
            />
          </div>
        </div>

        {/* New Password Input */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="reset-password"
            className="text-[13px] font-semibold"
            style={{ color: "var(--text-secondary)" }}
          >
            New Password
          </label>
          <PasswordInput
            id="reset-password"
            value={password}
            onChange={onPasswordChange}
            placeholder="Enter a new secure password"
            showPassword={showPassword}
            onToggleShow={onToggleShowPassword}
            toggleButtonId="reset-toggle-password"
          />
        </div>

        {/* Error */}
        {error && (
          <p className="text-[13px] text-red-500 -mt-2 animate-shake">{error}</p>
        )}

        {/* Submit */}
        <button
          id="reset-submit-btn"
          type="submit"
          disabled={loading}
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#2563eb] text-white text-[15px] font-semibold
            hover:bg-[#1d54d4] active:scale-[0.98] transition-all duration-200 shadow-md shadow-[#2563eb]/20
            disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer mt-1"
        >
          {loading ? (
            <SpinnerIcon />
          ) : (
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="8.5" cy="7" r="4" />
              <polyline points="17 11 19 13 23 9" />
            </svg>
          )}
          {loading ? "Updating Password…" : "Update Password"}
        </button>
      </form>

      <p className="text-center text-[13px] mt-6" style={{ color: "var(--text-muted)" }}>
        Back to{" "}
        <button
          id="reset-back-to-login-2"
          type="button"
          onClick={onNavigateLogin}
          className="text-[#2563eb] font-semibold hover:underline cursor-pointer bg-transparent border-none p-0"
        >
          Login
        </button>
      </p>
    </div>
  );
}

