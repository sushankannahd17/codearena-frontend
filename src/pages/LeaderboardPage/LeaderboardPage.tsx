import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { reportsApi } from "../../services/api";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface LeaderboardUser {
  id: number;
  name: string;
  email: string;
}

interface LeaderboardQuestion {
  id: number;
  title: string;
}

interface LeaderboardEntry {
  id: number;
  user: LeaderboardUser;
  status: string;
  sessionStart: string;
  sessionEnd: string;
  submitCount: number;
  resumeCount: number;
  questions: LeaderboardQuestion[];
  contest: {
    id: number;
    contestname: string;
    minutes: number;
    startDate: string;
    endDate: string;
    questions: LeaderboardQuestion[];
    user: LeaderboardUser;
    attenders: LeaderboardUser[];
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDuration(startIso: string, endIso: string): string {
  const diffMs = new Date(endIso).getTime() - new Date(startIso).getTime();
  if (diffMs <= 0) return "—";
  const totalMin = Math.floor(diffMs / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function rankEntries(entries: LeaderboardEntry[], totalQuestions: number): LeaderboardEntry[] {
  return [...entries].sort((a, b) => {
    // More solved = fewer remaining questions = better rank
    const aRemaining = (a.questions ?? []).length;
    const bRemaining = (b.questions ?? []).length;
    if (aRemaining !== bRemaining) return aRemaining - bRemaining; // fewer remaining = higher rank
    if (a.submitCount !== b.submitCount) return a.submitCount - b.submitCount; // fewer submits = better
    const aDur = new Date(a.sessionEnd).getTime() - new Date(a.sessionStart).getTime();
    const bDur = new Date(b.sessionEnd).getTime() - new Date(b.sessionStart).getTime();
    return aDur - bDur; // shorter duration = better
  });
}

// ─── Rank styling ──────────────────────────────────────────────────────────────

const RANK_STYLES: Record<number, { bg: string; color: string; border: string }> = {
  1: { bg: "rgba(250,204,21,0.13)", color: "#b45309", border: "rgba(250,204,21,0.45)" },
  2: { bg: "rgba(148,163,184,0.13)", color: "#475569", border: "rgba(148,163,184,0.45)" },
  3: { bg: "rgba(180,113,78,0.13)",  color: "#92400e", border: "rgba(180,113,78,0.45)" },
};

function getRankStyle(rank: number) {
  return (
    RANK_STYLES[rank] ?? {
      bg: "var(--bg-subtle)",
      color: "var(--text-muted)",
      border: "var(--border-color)",
    }
  );
}

function statusStyle(status: string) {
  switch (status) {
    case "Completed":     return { bg: "rgba(37,99,235,0.10)",  color: "#2563eb", dot: "#2563eb" };
    case "Not Completed": return { bg: "rgba(245,158,11,0.10)", color: "#d97706", dot: "#d97706" };
    default:              return { bg: "rgba(107,114,128,0.08)", color: "#6b7280", dot: "#6b7280" };
  }
}

// Derive status from the questions array:
// empty  → user has no remaining questions → Completed
// non-empty → user still has unsolved questions → Not Completed
function deriveStatus(questions: { id: number }[]): string {
  return (questions ?? []).length === 0 ? "Completed" : "Not Completed";
}

// ─── Sub-components ────────────────────────────────────────────────────────────


function Chip({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "6px 12px",
        borderRadius: 12,
        background: `${color}18`,
        border: `1px solid ${color}35`,
      }}
    >
      <span style={{ fontSize: 11, fontWeight: 600, color }}>{label}</span>
      <span style={{ fontSize: 14, fontWeight: 800, color }}>{value}</span>
    </div>
  );
}

function SkeletonRow() {
  const s: React.CSSProperties = {
    background: "linear-gradient(90deg, var(--bg-subtle) 25%, var(--border-color) 50%, var(--bg-subtle) 75%)",
    backgroundSize: "200% 100%",
    animation: "lb-shimmer 1.4s ease-in-out infinite",
    borderRadius: 8,
  };
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 20px",
        borderBottom: "1px solid var(--border-color)",
        backgroundColor: "var(--bg-card)",
      }}
    >
      <div style={{ ...s, width: 34, height: 34, borderRadius: 10, flexShrink: 0 }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
        <div style={{ ...s, height: 13, width: "38%" }} />
        <div style={{ ...s, height: 10, width: "22%" }} />
      </div>
      <div style={{ ...s, width: 42, height: 20 }} />
      <div style={{ ...s, width: 55, height: 20 }} />
      <div style={{ ...s, width: 65, height: 24, borderRadius: 999 }} />
    </div>
  );
}

function TrophyIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="8 21 12 17 16 21" />
      <line x1="12" y1="17" x2="12" y2="11" />
      <path d="M7 4h10l1 7a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5Z" />
      <path d="M5 4H3v3a3 3 0 0 0 3 3" />
      <path d="M19 4h2v3a3 3 0 0 1-3 3" />
    </svg>
  );
}

// ─── Leaderboard Row ──────────────────────────────────────────────────────────

function LeaderboardRow({
  entry, rank, totalQuestions, animDelay,
}: {
  entry: LeaderboardEntry;
  rank: number;
  totalQuestions: number;
  animDelay: number;
}) {
  const [hovered, setHovered] = useState(false);
  const rs = getRankStyle(rank);
  const status = deriveStatus(entry.questions);
  const ss = statusStyle(status);
  const remaining = (entry.questions ?? []).length;
  const solved = Math.max(0, totalQuestions - remaining);
  const isCompleted = status === "Completed";
  const duration = formatDuration(entry.sessionStart, entry.sessionEnd);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "grid",
        gridTemplateColumns: "48px 1fr 80px 80px 110px 110px 80px 110px 70px",
        alignItems: "center",
        padding: "13px 20px",
        borderBottom: "1px solid var(--border-color)",
        backgroundColor: hovered ? "var(--bg-subtle)" : "var(--bg-card)",
        animation: `lb-row-in 0.38s ease both`,
        animationDelay: `${animDelay}ms`,
        transition: "background-color 0.18s",
        cursor: "default",
      }}
    >
      {/* Rank badge */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span
          style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 800,
            background: rs.bg,
            color: rs.color,
            border: `1.5px solid ${rs.border}`,
            flexShrink: 0,
          }}
        >
          {rank}
        </span>
      </div>

      {/* Participant name + email */}
      <div style={{ minWidth: 0, paddingRight: 12 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", marginBottom: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {entry.user.name}
        </p>
        <p style={{ fontSize: 11, color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {entry.user.email}
        </p>
      </div>

      {/* Solved */}
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 18, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>{solved}</p>
        <p style={{ fontSize: 10, color: "var(--text-muted)" }}>/ {totalQuestions}</p>
      </div>

      {/* Submit count */}
      <div style={{ textAlign: "center" }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{entry.submitCount}</span>
      </div>

      {/* Start time */}
      <div style={{ textAlign: "center" }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-muted)" }}>
          {new Date(entry.sessionStart).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: true })}
        </span>
      </div>

      {/* End time */}
      <div style={{ textAlign: "center" }}>
        <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-muted)" }}>
          {new Date(entry.sessionEnd).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: true })}
        </span>
      </div>

      {/* Duration */}
      <div style={{ textAlign: "center" }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>{duration}</span>
      </div>

      {/* Status badge */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            padding: "4px 10px",
            borderRadius: 999,
            backgroundColor: ss.bg,
            color: ss.color,
            border: `1px solid ${ss.dot}30`,
            display: "flex",
            alignItems: "center",
            gap: 5,
            whiteSpace: "nowrap",
          }}
        >
          {isCompleted && (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
          )}
          {status}
        </span>
      </div>

      {/* Resume count */}
      <div style={{ textAlign: "center" }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-muted)" }}>{entry.resumeCount}</span>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LeaderboardPage() {
  const location = useLocation();
  const navigate = useNavigate();

  const contestId   = location.state?.contestId   as number | undefined;
  const contestName = location.state?.contestName as string | undefined;

  const [entries,     setEntries]     = useState<LeaderboardEntry[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [contestMeta, setContestMeta] = useState<LeaderboardEntry["contest"] | null>(null);
  const [downloading, setDownloading] = useState(false);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const resolvedId = contestId ?? contestMeta?.id;

  const fetchLeaderboard = useCallback(
    async (showLoading = false) => {
      if (!resolvedId) return;
      if (showLoading) setLoading(true);
      setError(null);
      try {
        const res = await reportsApi.getLeaderboard(resolvedId);
        if (res.status === "success" && Array.isArray(res.message)) {
          const data: LeaderboardEntry[] = res.message;
          setEntries(data);
          if (data.length > 0) setContestMeta(data[0].contest);
        } else {
          setError("Unexpected response from the server.");
        }
      } catch (err: any) {
        setError(err.message ?? "Failed to load leaderboard.");
      } finally {
        setLoading(false);
      }
    },
    [resolvedId]
  );

  useEffect(() => {
    if (!resolvedId) return;
    fetchLeaderboard(true);

    // Silent background refresh every 5 minutes — no UI indicator
    pollRef.current = setInterval(() => fetchLeaderboard(false), 5 * 60 * 1000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [resolvedId]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleDownload = async () => {
    if (!resolvedId || downloading) return;
    setDownloading(true);
    try {
      await reportsApi.downloadLeaderboardReport(resolvedId);
    } catch (e: any) {
      alert(e.message ?? "Failed to download report.");
    } finally {
      setDownloading(false);
    }
  };

  const totalQuestions    = contestMeta?.questions?.length ?? 0;
  const ranked            = rankEntries(entries, totalQuestions);
  const completedCount    = entries.filter((e) => deriveStatus(e.questions) === "Completed").length;
  const notCompletedCount = entries.filter((e) => deriveStatus(e.questions) === "Not Completed").length;
  const displayName       = contestMeta?.contestname ?? contestName ?? "Contest";

  if (!resolvedId) {
    return (
      <main style={{ maxWidth: 600, margin: "0 auto", padding: "64px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
        <p style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>No contest selected.</p>
        <button
          onClick={() => navigate("/manage-contests")}
          style={{ background: "linear-gradient(135deg,#2563eb 0%,#7c3aed 100%)", color: "#fff", border: "none", borderRadius: 12, padding: "8px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
        >
          Go to Manage Contests
        </button>
      </main>
    );
  }

  return (
    <>
      <style>{`
        @keyframes lb-row-in {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes lb-shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
        @keyframes lb-fade-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>

      <main
        style={{
          maxWidth: 1000,
          margin: "0 auto",
          padding: "32px 20px 48px",
          width: "100%",
          animation: "lb-fade-in 0.4s ease both",
        }}
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>

          {/* Left: back + title */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              id="leaderboard-back-btn"
              onClick={() => navigate(-1)}
              aria-label="Go back"
              style={{
                width: 38, height: 38, borderRadius: 12,
                display: "flex", alignItems: "center", justifyContent: "center",
                backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)",
                color: "var(--text-muted)", cursor: "pointer", flexShrink: 0,
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1.08)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.4px", margin: 0 }}>
                  Leaderboard
                </h1>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 3, maxWidth: 380, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {displayName}
              </p>
            </div>
          </div>

          {/* Right: Download Report button */}
          {resolvedId && (
            <button
              id="leaderboard-download-btn"
              onClick={handleDownload}
              disabled={downloading}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                padding: "9px 18px", borderRadius: 12,
                background: downloading ? "var(--bg-subtle)" : "linear-gradient(135deg,#2563eb 0%,#7c3aed 100%)",
                color: downloading ? "var(--text-muted)" : "#fff",
                border: "none", fontWeight: 700, fontSize: 13,
                cursor: downloading ? "not-allowed" : "pointer",
                transition: "opacity 0.2s, transform 0.15s",
                opacity: downloading ? 0.7 : 1,
                flexShrink: 0,
              }}
              onMouseEnter={(e) => { if (!downloading) (e.currentTarget as HTMLElement).style.transform = "scale(1.03)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
            >
              {downloading ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ animation: "spin 1s linear infinite" }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Downloading…
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  Download Report
                </>
              )}
            </button>
          )}
        </div>

        {/* ── Summary chips ────────────────────────────────────────────────── */}
        {!loading && !error && entries.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
            <Chip label="Participants"   value={entries.length}      color="#7c3aed" />
            <Chip label="Completed"      value={completedCount}      color="#2563eb" />
            <Chip label="Not Completed"  value={notCompletedCount}   color="#d97706" />
            <Chip label="Questions"      value={totalQuestions}      color="#f59e0b" />
          </div>
        )}

        {/* ── Loading skeleton ──────────────────────────────────────────────── */}
        {loading && (
          <div style={{ borderRadius: 18, overflow: "hidden", border: "1px solid var(--border-color)" }}>
            {[...Array(4)].map((_, i) => <SkeletonRow key={i} />)}
          </div>
        )}

        {/* ── Error ────────────────────────────────────────────────────────── */}
        {!loading && error && (
          <div
            style={{
              borderRadius: 18, padding: "40px 24px", textAlign: "center",
              backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
            }}
          >
            <div style={{ width: 48, height: 48, borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(239,68,68,0.08)" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>{error}</p>
            <button
              id="leaderboard-retry-btn"
              onClick={() => fetchLeaderboard(true)}
              style={{ background: "linear-gradient(135deg,#2563eb 0%,#7c3aed 100%)", color: "#fff", border: "none", borderRadius: 12, padding: "8px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer" }}
            >
              Retry
            </button>
          </div>
        )}

        {/* ── Empty state ───────────────────────────────────────────────────── */}
        {!loading && !error && entries.length === 0 && (
          <div
            style={{
              borderRadius: 18, padding: "64px 24px", textAlign: "center",
              backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
            }}
          >
            <div style={{ width: 56, height: 56, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,rgba(37,99,235,0.1),rgba(124,58,237,0.1))" }}>
              <TrophyIcon />
            </div>
            <p style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>No participants yet</p>
            <p style={{ fontSize: 13, color: "var(--text-muted)" }}>The leaderboard will populate once participants enter the contest.</p>
          </div>
        )}

        {/* ── Table ────────────────────────────────────────────────────────── */}
        {!loading && !error && ranked.length > 0 && (
          <div style={{ borderRadius: 18, overflow: "hidden", border: "1px solid var(--border-color)" }}>

            {/* Table header */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "48px 1fr 80px 80px 110px 110px 80px 110px 70px",
                alignItems: "center",
                padding: "11px 20px",
                backgroundColor: "var(--bg-subtle)",
                borderBottom: "1px solid var(--border-color)",
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                color: "var(--text-muted)",
              }}
            >
              <span>#</span>
              <span>Participant</span>
              <span style={{ textAlign: "center" }}>Solved</span>
              <span style={{ textAlign: "center" }}>Submits</span>
              <span style={{ textAlign: "center" }}>Start Time</span>
              <span style={{ textAlign: "center" }}>End Time</span>
              <span style={{ textAlign: "center" }}>Duration</span>
              <span style={{ textAlign: "center" }}>Status</span>
              <span style={{ textAlign: "center" }}>Resumes</span>
            </div>

            {/* Rows */}
            {ranked.map((entry, idx) => (
              <LeaderboardRow
                key={entry.id}
                entry={entry}
                rank={idx + 1}
                totalQuestions={totalQuestions}
                animDelay={idx * 45}
              />
            ))}
          </div>
        )}

        {/* ── Legend ───────────────────────────────────────────────────────── */}
        {!loading && !error && ranked.length > 0 && (
          <p style={{ textAlign: "center", fontSize: 11, color: "var(--text-muted)", marginTop: 14 }}>
            Ranked by: most questions solved &nbsp;·&nbsp; fewest submissions &nbsp;·&nbsp; shortest session time
          </p>
        )}
      </main>
    </>
  );
}
