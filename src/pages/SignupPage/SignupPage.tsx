import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../services/api";
import SignupForm from "../../components/Auth/SignupForm";

export default function SignupPage() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!fullName || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await authApi.signup({ name: fullName, email, password });
      alert(`Account created successfully for ${email}! Please log in.`);
      navigate("/login");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="flex-grow flex items-center justify-center px-4 py-16 transition-colors duration-300"
      style={{ backgroundColor: "var(--bg-subtle)" }}
    >
      <SignupForm
        fullName={fullName}
        onFullNameChange={setFullName}
        email={email}
        onEmailChange={setEmail}
        password={password}
        onPasswordChange={setPassword}
        showPassword={showPassword}
        onToggleShowPassword={() => setShowPassword((v) => !v)}
        error={error}
        loading={loading}
        onSubmit={handleSubmit}
      />
    </main>
  );
}
