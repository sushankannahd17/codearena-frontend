import { useNavigate } from "react-router-dom";

// ─── Info Card ─────────────────────────────────────────────────────────────────
function InfoCard({
  icon,
  title,
  value,
  sub,
  accent,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  sub: string;
  accent: string;
  href?: string;
}) {
  const inner = (
    <>
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0"
        style={{ background: accent }}
      >
        {icon}
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
          {title}
        </p>
        <p className="text-[15px] font-bold truncate" style={{ color: "var(--text-primary)" }}>
          {value}
        </p>
        <p className="text-[12.5px]" style={{ color: "var(--text-muted)" }}>
          {sub}
        </p>
      </div>
    </>
  );

  const base = "flex items-center gap-5 p-5 rounded-2xl border transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5";
  const style = { backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" };

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={base} style={style}>
        {inner}
      </a>
    );
  }

  return (
    <div className={base} style={style}>
      {inner}
    </div>
  );
}

// ─── Contact Page ──────────────────────────────────────────────────────────────
export default function ContactPage() {
  const navigate = useNavigate();

  return (
    <main
      className="flex-grow min-h-[calc(100vh-68px)] px-6 py-20 animate-fade-in"
      style={{ backgroundColor: "var(--bg-base)" }}
    >
      <div className="max-w-2xl mx-auto flex flex-col gap-12">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="text-center flex flex-col gap-3 animate-fade-in-up">
          <p className="text-[12px] font-bold uppercase tracking-widest" style={{ color: "#2563eb" }}>
            Get In Touch
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Contact{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Us
            </span>
          </h1>
          <p className="text-[15px] max-w-md mx-auto leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Have a question or want to get in touch? Reach out through any of the channels below.
          </p>
        </div>

        {/* ── Info Cards ────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-4">
          {/* Developer */}
          <InfoCard
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
              </svg>
            }
            title="Developer"
            value="Sushan Kannah D"
            sub="Creator & Maintainer of Code Arena"
            accent="linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)"
          />

          {/* Email */}
          <InfoCard
            href="mailto:sushan.kd17@gmail.com"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            }
            title="Email"
            value="sushan.kd17@gmail.com"
            sub="Click to send an email"
            accent="linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)"
          />

          {/* LinkedIn */}
          <InfoCard
            href="https://linkedin.com/in/sushan-kannah-d"
            icon={
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            }
            title="LinkedIn"
            value="linkedin.com/in/sushan-kannah-d"
            sub="Connect on LinkedIn"
            accent="linear-gradient(135deg, #0891b2 0%, #06b6d4 100%)"
          />
        </div>

        {/* ── CTA ───────────────────────────────────────────────────────── */}
        <div
          className="rounded-2xl p-8 flex flex-col items-center gap-4 text-center relative overflow-hidden"
          style={{ background: "linear-gradient(135deg, #1e3a8a 0%, #4c1d95 100%)" }}
        >
          <div className="absolute right-0 top-0 w-48 h-48 rounded-full blur-3xl opacity-20" style={{ background: "#a855f7" }} />
          <h3 className="text-[18px] font-bold text-white relative z-10">New to Code Arena?</h3>
          <p className="text-[13.5px] text-blue-200 leading-relaxed max-w-xs relative z-10">
            Create a free account and start hosting contests for your institution today.
          </p>
          <button
            onClick={() => navigate("/signup")}
            className="mt-1 px-6 py-2.5 rounded-xl bg-white text-[#1e3a8a] text-[13.5px] font-bold hover:scale-[1.03] active:scale-[0.97] transition-all duration-150 cursor-pointer relative z-10"
          >
            Sign Up Free
          </button>
        </div>

      </div>
    </main>
  );
}
