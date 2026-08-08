import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { authApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import LoginForm from "../../components/Auth/LoginForm";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || "/home";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      await authApi.login({ email, password });
      login(email);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="flex-grow flex items-center justify-center px-4 py-16 transition-colors duration-300"
      style={{ backgroundColor: "var(--bg-subtle)" }}
    >
      <LoginForm
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
