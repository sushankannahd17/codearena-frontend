import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import HeaderNav from "../components/HeaderNav";
import LandingPage from "../pages/LandingPage";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";
import ForgotPasswordPage from "../pages/ForgotPasswordPage";
import FirstTimeUserPage from "../pages/FirstTimeUserPage";
import HomePage from "../pages/HomePage";
import ContactPage from "../pages/ContactPage";
import ManageContestsPage from "../pages/ManageContestsPage";
import ContestDetailPage from "../pages/ContestDetailPage";
import ContestArenaPage from "../pages/ContestArenaPage";
import ReportsPage from "../pages/ReportsPage";
import ContestReportPage from "../pages/ReportsPage/ContestReportPage";
import LeaderboardPage from "../pages/LeaderboardPage";


// ─── Route Guards ─────────────────────────────────────────────────────────────

function ProtectedRoute({ children }: { children: React.JSX.Element }) {
  const { isLoggedIn, isChecking } = useAuth();
  const location = useLocation();

  if (isChecking) return null; // Wait for session check

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function PublicRoute({ children }: { children: React.JSX.Element }) {
  const { isLoggedIn, isChecking } = useAuth();

  if (isChecking) return null; // Wait for session check

  if (isLoggedIn) {
    return <Navigate to="/home" replace />;
  }

  return children;
}

// ─── Layout Wrapper (with HeaderNav) ─────────────────────────────────────────

function Layout() {
  const { isLoggedIn } = useAuth();
  return (
    <div className="cc-bg-base min-h-screen w-full flex flex-col font-sans transition-colors duration-300">
      <HeaderNav />

      <div className="flex-grow flex flex-col animate-fade-in">
        <Routes>
          {/* Guest Only Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <SignupPage />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPasswordPage />
              </PublicRoute>
            }
          />
          <Route
            path="/first-time-user"
            element={
              <PublicRoute>
                <FirstTimeUserPage />
              </PublicRoute>
            }
          />

          {/* Landing page — public, but if logged in go straight to dashboard */}
          <Route
            path="/"
            element={
              isLoggedIn ? <Navigate to="/home" replace /> : <LandingPage />
            }
          />

          {/* Protected dashboard */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/questions"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/manage-contests"
            element={
              <ProtectedRoute>
                <ManageContestsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/contesthome"
            element={
              <ProtectedRoute>
                <ContestDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/contact"
            element={<ContactPage />}
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute>
                <ReportsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/detail"
            element={
              <ProtectedRoute>
                <ContestReportPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/leaderboard"
            element={
              <ProtectedRoute>
                <LeaderboardPage />
              </ProtectedRoute>
            }
          />

          {/* Catch-all Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

// ─── Root Routes (full-screen arena lives outside Layout) ────────────────────

export default function AppRoutes() {
  return (
    <Routes>
      {/* Full-screen contest arena — no HeaderNav */}
      <Route
        path="/contestarena"
        element={
          <ProtectedRoute>
            <div className="cc-bg-base min-h-screen w-full flex flex-col font-sans transition-colors duration-300">
              <ContestArenaPage />
            </div>
          </ProtectedRoute>
        }
      />

      {/* All other routes go through the standard Layout with HeaderNav */}
      <Route path="/*" element={<Layout />} />
    </Routes>
  );
}
