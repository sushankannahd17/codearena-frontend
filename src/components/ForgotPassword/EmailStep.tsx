// Step 1: User enters their email to receive an OTP.
import { SpinnerIcon } from "../ui";

interface EmailStepProps {
  email: string;
  onEmailChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onNavigateLogin: () => void;
  loading: boolean;
  error: string;
}

export default function EmailStep({
  email,
  onEmailChange,
  onSubmit,
  onNavigateLogin,
  loading,
  error,
}: EmailStepProps) {
  return (
    <div>
      <h1 className="text-[28px] font-bold mb-1" style={{ color: "var(--text-primary)" }}>
        Reset Password
      </h1>
      <p className="text-[14px] mb-7" style={{ color: "var(--text-muted)" }}>
        Enter your email to receive a password reset OTP
      </p>

      <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
        {/* Email Input */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="reset-email"
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
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </span>
            <input
              id="reset-email"
              type="email"
              value={email}
              onChange={(e) => onEmailChange(e.target.value)}
              placeholder="Enter your email address"
              className="cc-input w-full pl-10 pr-4 py-3 text-[14px] rounded-xl outline-none border transition-all duration-200"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-[13px] text-red-500 -mt-2 animate-shake">{error}</p>
        )}

        {/* Submit */}
        <button
          id="reset-sendotp-btn"
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
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          )}
          {loading ? "Sending OTP…" : "Send OTP"}
        </button>
      </form>

      <p className="text-center text-[13px] mt-6" style={{ color: "var(--text-muted)" }}>
        Back to{" "}
        <button
          id="reset-back-to-login"
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

