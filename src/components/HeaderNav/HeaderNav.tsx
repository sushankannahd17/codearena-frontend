import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import logoDark from "../../assets/logo-dark.png";
import logoLight from "../../assets/logo-light.png";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

type Tab = "Home" | "Login" | "Signup" | "Contact Us" | "Reports";

const navItems: { label: Tab; icon: React.ReactNode }[] = [
  {
    label: "Home",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: "Login",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
        <polyline points="10 17 15 12 10 7" />
        <line x1="15" y1="12" x2="3" y2="12" />
      </svg>
    ),
  },
  {
    label: "Signup",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
        <line x1="19" y1="8" x2="19" y2="14" />
        <line x1="22" y1="11" x2="16" y2="11" />
      </svg>
    ),
  },
  {
    label: "Contact Us",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
    ),
  },
  {
    label: "Reports",
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
];

// Sun icon for light mode
function SunIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

// Moon icon for dark mode
function MoonIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function HeaderNav() {
  const { isLoggedIn, userEmail, userProfile, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const location = useLocation();
  const navigate = useNavigate();

  const [showProfileCard, setShowProfileCard] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close the profile card when clicking outside
  useEffect(() => {
    if (!showProfileCard) return;
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setShowProfileCard(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showProfileCard]);

  const getPathFromLabel = (label: Tab) => {
    switch (label) {
      case "Home":
        return isLoggedIn ? "/home" : "/";
      case "Login":
        return "/login";
      case "Signup":
        return "/signup";
      case "Contact Us":
        return "/contact";
      case "Reports":
        return "/reports";
    }
  };

  const isItemActive = (label: Tab) => {
    const path = getPathFromLabel(label);
    if (label === "Home") {
      return (
        location.pathname === "/" ||
        location.pathname === "/home" ||
        location.pathname === "/questions" ||
        location.pathname === "/manage-contests"
      );
    }
    return location.pathname === path;
  };


  const handleNavClick = (label: Tab) => {
    navigate(getPathFromLabel(label));
  };

  const visibleNavItems = navItems.filter((item) => {
    if (isLoggedIn) {
      return item.label !== "Login" && item.label !== "Signup";
    }
    // Hide Reports tab for guests
    return item.label !== "Reports";
  });

  const displayName = userProfile?.name || (userEmail ? userEmail.split("@")[0] : "");
  const avatarLetter = (userProfile?.name || userEmail || "U").charAt(0).toUpperCase();

  return (
    <header
      style={{
        backgroundColor: "var(--bg-card)",
        borderBottomColor: "var(--border-color)",
      }}
      className="w-full border-b sticky top-0 z-50 transition-colors duration-300"
    >
      <div className="w-full px-6 h-[68px] flex items-center justify-between">

        {/* Logo */}
        <button
          onClick={() => navigate(isLoggedIn ? "/home" : "/")}
          className="flex items-center gap-3 cursor-pointer hover:opacity-85 transition-opacity duration-200 group"
          id="nav-logo-btn"
          aria-label="Go to Home"
        >
          <div className="relative">
            {/* Glow ring behind the logo */}
            <div className="absolute inset-0 rounded-full bg-[#2563eb]/20 blur-xl scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <img
              key={isDark ? "dark" : "light"}
              src={isDark ? logoDark : logoLight}
              alt="Code Arena Logo"
              className="relative h-12 w-12 object-contain transition-opacity duration-300"
              draggable={false}
            />
          </div>
          <span
            className="text-[17px] font-bold tracking-tight hidden sm:block"
            style={{ color: "var(--text-primary)" }}
          >
            Code{" "}
            <span className="text-[#2563eb]">Arena</span>
          </span>
        </button>

        {/* Nav Items */}
        <nav className="flex items-center gap-1">
          {visibleNavItems.map(({ label, icon }) => {
            const isActive = isItemActive(label);
            return (
              <button
                key={label}
                id={`nav-${label.toLowerCase().replace(" ", "-")}-btn`}
                onClick={() => handleNavClick(label)}
                style={{
                  color: isActive
                    ? "#2563eb"
                    : "var(--text-secondary)",
                  backgroundColor: isActive ? "rgba(37,99,235,0.08)" : "transparent",
                }}
                className={`
                  relative flex items-center gap-1.5 px-4 py-2 rounded-lg text-[14px] font-medium
                  transition-all duration-200 cursor-pointer
                  ${!isActive ? "hover:bg-[var(--nav-hover-bg)]" : ""}
                `}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    (e.currentTarget as HTMLElement).style.color = "var(--text-secondary)";
                  }
                }}
              >
                {icon}
                {label}
                {isActive && (
                  <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#2563eb] rounded-full animate-scale-x" />
                )}
              </button>
            );
          })}

          {/* User Profile / Logout */}
          {isLoggedIn && (
            <div
              ref={profileRef}
              className="relative flex items-center gap-2 ml-2 pl-3 border-l"
              style={{ borderColor: "var(--border-color)" }}
            >
              {/* Clickable avatar + name trigger */}
              <button
                id="nav-profile-btn"
                onClick={() => setShowProfileCard((p) => !p)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-xl transition-all duration-200 cursor-pointer hover:bg-[var(--nav-hover-bg)] group"
              >
                {/* Avatar circle */}
                <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/35 flex items-center justify-center font-bold text-[13px] text-[#2563eb] shrink-0 ring-2 ring-transparent group-hover:ring-[#2563eb]/30 transition-all duration-200">
                  {avatarLetter}
                </div>
                {/* Name label */}
                <span
                  className="text-[13px] font-semibold hidden md:inline-block max-w-[110px] truncate"
                  style={{ color: "var(--text-primary)" }}
                >
                  {displayName}
                </span>
                {/* Chevron */}
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`hidden md:block shrink-0 transition-transform duration-200 ${showProfileCard ? "rotate-180" : ""}`}
                  style={{ color: "var(--text-muted)" }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Profile Dropdown Card */}
              {showProfileCard && (
                <div
                  className="absolute top-[calc(100%+10px)] right-0 w-64 rounded-2xl border cc-border shadow-2xl overflow-hidden z-50"
                  style={{ backgroundColor: "var(--bg-card)" }}
                >
                  {/* Card header with avatar + name + email */}
                  <div
                    className="px-5 py-4 flex flex-col gap-1 border-b cc-border"
                    style={{
                      background: "linear-gradient(135deg, rgba(37,99,235,0.07) 0%, transparent 100%)",
                    }}
                  >
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-11 h-11 rounded-full bg-blue-100 dark:bg-blue-900/35 flex items-center justify-center font-extrabold text-[18px] text-[#2563eb] shrink-0 shadow-inner">
                        {avatarLetter}
                      </div>
                      <div className="min-w-0">
                        <p className="text-[14px] font-bold truncate" style={{ color: "var(--text-primary)" }}>
                          {userProfile?.name || "—"}
                        </p>
                        <p className="text-[11.5px] truncate" style={{ color: "var(--text-muted)" }}>
                          {userProfile?.email || userEmail}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Profile detail rows */}
                  <div className="px-5 py-3 flex flex-col gap-2.5">
                    {/* Name row */}
                    <div className="flex items-center gap-3">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: "rgba(37,99,235,0.08)", color: "#2563eb" }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Name</p>
                        <p className="text-[13px] font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                          {userProfile?.name || "—"}
                        </p>
                      </div>
                    </div>

                    {/* Email row */}
                    <div className="flex items-center gap-3">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: "rgba(37,99,235,0.08)", color: "#2563eb" }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Email</p>
                        <p className="text-[13px] font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                          {userProfile?.email || userEmail || "—"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Logout button */}
                  <div className="px-4 pb-4">
                    <button
                      id="nav-logout-btn"
                      onClick={() => { setShowProfileCard(false); logout(); }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/40 text-[13px] font-bold transition-all duration-150 cursor-pointer border border-red-100 dark:border-red-900/30"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}

              {/* Logout Button (still accessible directly too) */}
            </div>
          )}

          {/* Theme Toggle */}
          <button
            id="nav-theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
            style={{
              borderColor: "var(--border-color)",
              color: isDark ? "#fbbf24" : "#6b7280",
              backgroundColor: "transparent",
            }}
            className="ml-2 w-9 h-9 rounded-full border flex items-center justify-center
              hover:scale-110 active:scale-95 transition-all duration-200 cursor-pointer"
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "var(--nav-hover-bg)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
            }}
          >
            <span
              style={{
                display: "inline-flex",
                transition: "transform 0.4s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s ease",
              }}
            >
              {isDark ? <SunIcon /> : <MoonIcon />}
            </span>
          </button>
        </nav>
      </div>
    </header>
  );
}
