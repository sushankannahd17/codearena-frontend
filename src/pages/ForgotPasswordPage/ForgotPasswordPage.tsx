import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../services/api";
import EmailStep from "../../components/ForgotPassword/EmailStep";
import OtpStep from "../../components/ForgotPassword/OtpStep";
import SuccessStep from "../../components/ForgotPassword/SuccessStep";

type Step = "email" | "otp" | "success";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const handleNavigateLogin = () => {
    navigate("/login");
  };

  // Automatically redirect to login page when resetting password succeeds
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (step === "success") {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleNavigateLogin();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [step]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.sendOtp({ recipient: email });
      setMessage(response.message || `Mail sent successfully to ${email}`);
      setStep("otp");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to send OTP. Please check your email and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!otp || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const response = await authApi.changePassword({ recipient: email, otp, password });
      setMessage(response.message || "Password changed successfully.");
      setStep("success");
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to change password. Please verify the OTP and try again."
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
        className="w-full max-w-[420px] rounded-2xl p-8 animate-fade-in-up"
        style={{
          backgroundColor: "var(--bg-card)",
          border: "1px solid var(--border-color)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        {step === "email" && (
          <EmailStep
            email={email}
            onEmailChange={setEmail}
            onSubmit={handleSendOtp}
            onNavigateLogin={handleNavigateLogin}
            loading={loading}
            error={error}
          />
        )}

        {step === "otp" && (
          <OtpStep
            email={email}
            otp={otp}
            onOtpChange={setOtp}
            password={password}
            onPasswordChange={setPassword}
            showPassword={showPassword}
            onToggleShowPassword={() => setShowPassword((v) => !v)}
            onSubmit={handleChangePassword}
            onChangeEmail={() => { setStep("email"); setError(""); }}
            onNavigateLogin={handleNavigateLogin}
            loading={loading}
            error={error}
            message={message}
          />
        )}

        {step === "success" && (
          <SuccessStep
            message={message}
            countdown={countdown}
            onNavigateLogin={handleNavigateLogin}
          />
        )}
      </div>
    </main>
  );
}
