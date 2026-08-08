// Step 3: Success confirmation with auto-redirect countdown.

interface SuccessStepProps {
  message: string;
  countdown: number;
  onNavigateLogin: () => void;
}

export default function SuccessStep({
  message,
  countdown,
  onNavigateLogin,
}: SuccessStepProps) {
  return (
    <div className="text-center py-4 flex flex-col items-center">
      <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-6 animate-fade-in">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h1 className="text-[28px] font-bold mb-3" style={{ color: "var(--text-primary)" }}>
        Success!
      </h1>
      <p className="text-[14px] mb-8" style={{ color: "var(--text-muted)" }}>
        {message ||
          "Your password has been changed successfully. You can now use your new password to log in."}
      </p>

      <button
        id="reset-success-login-btn"
        onClick={onNavigateLogin}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#2563eb] text-white text-[15px] font-semibold
          hover:bg-[#1d54d4] active:scale-[0.98] transition-all duration-200 shadow-md shadow-[#2563eb]/20 cursor-pointer"
      >
        Go to Login
      </button>

      <p className="text-[12px] mt-4" style={{ color: "var(--text-muted)" }}>
        Redirecting to login page in{" "}
        <span className="font-semibold text-neutral-800 dark:text-neutral-200">
          {countdown}s
        </span>
        ...
      </p>
    </div>
  );
}

