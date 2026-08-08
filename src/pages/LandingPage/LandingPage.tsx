import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import logoDark from "../../assets/logo-dark.png";
import logoLight from "../../assets/logo-light.png";

// ─── Feature Card ─────────────────────────────────────────────────────────────
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  accent: string;
}

function FeatureCard({ icon, title, description, accent }: FeatureCardProps) {
  return (
    <div
      className="flex flex-col gap-4 p-6 rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-xl group"
      style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl shrink-0 transition-transform duration-300 group-hover:scale-110"
        style={{ background: accent }}
      >
        {icon}
      </div>
      <div className="flex flex-col gap-1.5">
        <h3 className="text-[16px] font-bold" style={{ color: "var(--text-primary)" }}>
          {title}
        </h3>
        <p className="text-[13.5px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
          {description}
        </p>
      </div>
    </div>
  );
}

// ─── Landing Page ─────────────────────────────────────────────────────────────
export default function LandingPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className="min-h-screen flex flex-col overflow-x-hidden"
      style={{ backgroundColor: "var(--bg-base)" }}
    >
      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center px-6 py-28 text-center overflow-hidden">
        {/* Background blobs */}
        <div
          className="absolute top-[-120px] left-[-100px] w-[480px] h-[480px] rounded-full blur-[120px] opacity-25 pointer-events-none"
          style={{ background: "radial-gradient(circle, #2563eb 0%, transparent 70%)" }}
        />
        <div
          className="absolute bottom-[-80px] right-[-80px] w-[380px] h-[380px] rounded-full blur-[100px] opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle, #7c3aed 0%, transparent 70%)" }}
        />

        {/* Floating logo */}
        <div className="animate-float mb-8 relative">
          <div
            className="absolute inset-0 rounded-full blur-3xl opacity-30 scale-150"
            style={{ background: "radial-gradient(circle, #2563eb 0%, transparent 70%)" }}
          />
          <img
            src={isDark ? logoDark : logoLight}
            alt="Code Arena Logo"
            className="relative h-24 w-24 object-contain drop-shadow-xl"
            draggable={false}
          />
        </div>

        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[12px] font-semibold mb-6"
          style={{
            backgroundColor: "rgba(37,99,235,0.08)",
            borderColor: "rgba(37,99,235,0.25)",
            color: "#2563eb",
          }}
        >
          <span className="inline-block w-2 h-2 rounded-full bg-[#2563eb] animate-pulse" />
          Competitive Coding Platform
        </div>

        {/* Headline */}
        <h1
          className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] mb-5 max-w-4xl"
          style={{ color: "var(--text-primary)" }}
        >
          Code Smarter.
          <br />
          <span
            style={{
              background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Compete Harder.
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className="text-[17px] leading-relaxed max-w-xl mb-10"
          style={{ color: "var(--text-secondary)" }}
        >
          Code Arena brings real-time contest experience to your institution. Solve algorithmic challenges, compete with peers, and track your progress — all in one place.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <button
            id="landing-get-started-btn"
            onClick={() => navigate("/signup")}
            className="px-8 py-3.5 rounded-xl text-white text-[15px] font-bold transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] shadow-lg cursor-pointer"
            style={{ background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)", boxShadow: "0 4px 24px rgba(37,99,235,0.35)" }}
          >
            Get Started Free
          </button>
          <button
            id="landing-login-btn"
            onClick={() => navigate("/login")}
            className="px-8 py-3.5 rounded-xl text-[15px] font-bold border transition-all duration-200 hover:scale-[1.03] active:scale-[0.97] cursor-pointer"
            style={{
              borderColor: "var(--border-color)",
              color: "var(--text-primary)",
              backgroundColor: "var(--bg-card)",
            }}
          >
            Sign In
          </button>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <p className="text-[12px] font-bold uppercase tracking-widest mb-3" style={{ color: "#2563eb" }}>
              Why Code Arena?
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
              Everything you need to run a contest
            </h2>
            <p className="mt-4 text-[15px] max-w-xl mx-auto" style={{ color: "var(--text-secondary)" }}>
              From problem creation to live leaderboards, we handle it all so your students can focus on what matters — writing great code.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <FeatureCard
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
                </svg>
              }
              title="Real-Time Code Execution"
              description="Submit code in multiple languages and get instant verdicts with detailed test case results."
              accent="linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)"
            />
            <FeatureCard
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              }
              title="Flexible Contest Management"
              description="Create timed contests, invite participants, and manage questions with a powerful admin dashboard."
              accent="linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)"
            />
            <FeatureCard
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              }
              title="Live Leaderboards"
              description="Track rankings in real time as scores update. Download reports as CSV for post-contest analysis."
              accent="linear-gradient(135deg, #059669 0%, #10b981 100%)"
            />
            <FeatureCard
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="9" y1="9" x2="15" y2="9" /><line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="13" y2="17" />
                </svg>
              }
              title="Rich Problem Bank"
              description="Build a library of problems with sample I/O, hidden test cases, and custom run-time limits."
              accent="linear-gradient(135deg, #d97706 0%, #f59e0b 100%)"
            />
            <FeatureCard
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
              }
              title="Timed Contests"
              description="Set precise start and end times. Students see a live countdown and get locked out gracefully when time's up."
              accent="linear-gradient(135deg, #dc2626 0%, #f87171 100%)"
            />
            <FeatureCard
              icon={
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              }
              title="Secure & Proctored"
              description="Session management, resume-count controls, and secure code submission ensure contest integrity."
              accent="linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)"
            />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section
        className="py-24 px-6"
        style={{ backgroundColor: "var(--bg-subtle)" }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-[12px] font-bold uppercase tracking-widest mb-3" style={{ color: "#2563eb" }}>
            How It Works
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-14" style={{ color: "var(--text-primary)" }}>
            Up and running in minutes
          </h2>

          <div className="grid sm:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Create an account",
                desc: "Sign up with your institutional email. Admins can bulk-import students via Excel.",
              },
              {
                step: "02",
                title: "Build your contest",
                desc: "Add problems, set the time limit, invite participants, and schedule your contest.",
              },
              {
                step: "03",
                title: "Compete & Analyse",
                desc: "Students code in real time. Review the leaderboard and download full reports instantly.",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col items-center gap-4 text-center">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-[20px] font-black text-white shrink-0"
                  style={{ background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)" }}
                >
                  {step}
                </div>
                <h3 className="text-[17px] font-bold" style={{ color: "var(--text-primary)" }}>{title}</h3>
                <p className="text-[13.5px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div
          className="max-w-3xl mx-auto rounded-3xl p-12 text-center relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #4c1d95 100%)" }}
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxjaXJjbGUgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjA0KSIgY3g9IjIwIiBjeT0iMjAiIHI9IjEiLz48L2c+PC9zdmc+')] opacity-60" />
          <div className="relative z-10 flex flex-col items-center gap-6">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
              Ready to run your first contest?
            </h2>
            <p className="text-[15px] text-blue-200 max-w-md leading-relaxed">
              Join Code Arena today and give your students a world-class competitive programming experience.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                id="landing-cta-signup-btn"
                onClick={() => navigate("/signup")}
                className="px-8 py-3.5 rounded-xl bg-white text-[#1e3a8a] text-[15px] font-bold transition-all duration-200 hover:scale-[1.04] active:scale-[0.97] cursor-pointer shadow-lg"
              >
                Create Free Account
              </button>
              <button
                id="landing-cta-contact-btn"
                onClick={() => navigate("/contact")}
                className="px-8 py-3.5 rounded-xl border border-white/30 text-white text-[15px] font-bold transition-all duration-200 hover:bg-white/10 hover:scale-[1.03] cursor-pointer"
              >
                Contact Us
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────── */}
      <footer
        className="py-8 px-6 border-t text-center"
        style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-subtle)" }}
      >
        <div className="flex flex-col sm:flex-row items-center justify-between max-w-5xl mx-auto gap-4">
          <div className="flex items-center gap-2">
            <img
              src={isDark ? logoDark : logoLight}
              alt="Code Arena"
              className="h-7 w-7 object-contain"
              draggable={false}
            />
            <span className="text-[14px] font-bold" style={{ color: "var(--text-primary)" }}>
              Code <span style={{ color: "#2563eb" }}>Arena</span>
            </span>
          </div>
          <p className="text-[12.5px]" style={{ color: "var(--text-muted)" }}>
            © {new Date().getFullYear()} Code Arena. Built for competitive coders.
          </p>
          <div className="flex items-center gap-4 text-[13px] font-medium" style={{ color: "var(--text-secondary)" }}>
            <button onClick={() => navigate("/contact")} className="hover:text-[#2563eb] transition-colors cursor-pointer">Contact</button>
            <button onClick={() => navigate("/login")} className="hover:text-[#2563eb] transition-colors cursor-pointer">Login</button>
            <button onClick={() => navigate("/signup")} className="hover:text-[#2563eb] transition-colors cursor-pointer">Sign Up</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
