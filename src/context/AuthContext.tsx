import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";
import { authApi, contestsApi } from "../services/api";

export interface UserProfile {
  id: number;
  name: string;
  email: string;
}

interface AuthContextType {
  isLoggedIn: boolean;
  isChecking: boolean;
  userEmail: string;
  userProfile: UserProfile | null;
  login: (email: string) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(true);
  const [userEmail, setUserEmail] = useState<string>("");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const fetchProfile = async () => {
    try {
      const res = await authApi.getProfile();
      if (res.status === "success" && res.message) {
        const { id, name, email } = res.message as any;
        setUserProfile({ id, name, email });
        setUserEmail(email ?? "");
      }
    } catch {
      // profile fetch failed silently — session is still valid
    }
  };

  useEffect(() => {
    // The JWT cookie is HttpOnly — JS cannot read it via document.cookie.
    // The browser automatically attaches it to every credentialed request.
    // We call an authenticated endpoint: if the server accepts it → logged in.
    // If the server returns 401 → not logged in (cookie missing or expired).
    contestsApi
      .getAvailable()
      .then(async () => {
        setIsLoggedIn(true);
        await fetchProfile();
      })
      .catch(() => {
        setIsLoggedIn(false);
      })
      .finally(() => {
        setIsChecking(false);
      });
  }, []);

  const login = (email: string) => {
    setIsLoggedIn(true);
    setUserEmail(email);
    // Fetch full profile after login
    fetchProfile();
  };

  const navigate = useNavigate();

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // Even if the server call fails, clear the client session
    } finally {
      setIsLoggedIn(false);
      setUserEmail("");
      setUserProfile(null);
      navigate("/login");
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isChecking, userEmail, userProfile, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
