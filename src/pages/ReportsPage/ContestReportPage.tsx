import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface Submission {
  id: number;
  language: string;
  verdict: string;
  passedTC: number;
  totalTC: number;
  code: string;
  question: { id: number; title: string };
}

interface ContestOver {
  id: number;
  contestname: string;
  startDate: string;
  endDate: string;
  minutes: number;
  maxResumeCount: number | null;
  resumeCount: number | null;
  userStartDate: string | null;
  userEndDate: string | null;
  submitCount: number;
  questions: { id: number; title: string }[];
  submissions: Submission[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatDateTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function verdictColor(verdict: string) {
  switch (verdict?.toLowerCase()) {
    case "accepted": return { bg: "rgba(16,185,129,0.1)", color: "#10b981" };
    case "wrong answer": return { bg: "rgba(239,68,68,0.1)", color: "#ef4444" };
    case "time limit exceeded": return { bg: "rgba(245,158,11,0.1)", color: "#f59e0b" };
    default: return { bg: "rgba(107,114,128,0.1)", color: "#6b7280" };
  }
}

// ─── Meta Tile ────────────────────────────────────────────────────────────────

function MetaTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl p-4" style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)" }}>
      <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--text-muted)" }}>{label}</p>
      <p className="text-[14px] font-semibold" style={{ color: "var(--text-primary)" }}>{value}</p>
    </div>
  );
}

// ─── Contest Report Page ───────────────────────────────────────────────────────

export default function ContestReportPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const contest = location.state?.contest as ContestOver | undefined;
  const [expandedCode, setExpandedCode] = useState<number | null>(null);

  if (!contest) {
    return (
      <main className="max-w-3xl mx-auto px-6 py-16 flex flex-col items-center gap-4">
        <p className="text-[15px] font-semibold" style={{ color: "var(--text-primary)" }}>
          No report data found.
        </p>
        <button
          onClick={() => navigate("/reports")}
          className="text-[13px] font-bold px-4 py-2 rounded-xl cursor-pointer transition-all duration-150"
          style={{ background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)", color: "white" }}
        >
          Back to Reports
        </button>
      </main>
    );
  }

  const submissionMap = new Map<number, Submission>();
  (contest.submissions ?? []).forEach((s) => submissionMap.set(s.question.id, s));

  const attempted = (contest.submissions ?? []).length;
  const total = (contest.questions ?? []).length;

  return (
    <main className="max-w-3xl mx-auto px-6 py-10 w-full">

      {/* Back button + title */}
      <div className="flex items-center gap-3 mb-8">
        <button
          id="report-back-btn"
          onClick={() => navigate("/reports")}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer shrink-0 hover:scale-105"
          style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", color: "var(--text-muted)" }}
          aria-label="Back to reports"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div className="min-w-0">
          <h1 className="text-[22px] font-extrabold tracking-tight truncate" style={{ color: "var(--text-primary)" }}>
            {contest.contestname}
          </h1>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-[12px]" style={{ color: "var(--text-muted)" }}>
              {formatDate(contest.startDate)} &mdash; {formatDate(contest.endDate)}
            </span>
            <span
              className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "rgba(16,185,129,0.1)", color: "#10b981" }}
            >
              Completed
            </span>
          </div>
        </div>
      </div>

      {/* Overview */}
      <section className="mb-6">
        <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
          Overview
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <MetaTile label="Duration" value={`${contest.minutes} min`} />
          <MetaTile label="Questions" value={total} />
          <MetaTile label="Solved" value={`${attempted} / ${total}`} />
          <MetaTile label="Submissions" value={contest.submitCount ?? attempted} />
          {contest.maxResumeCount != null && (
            <MetaTile label="Resume Used" value={`${contest.resumeCount ?? 0} / ${contest.maxResumeCount}`} />
          )}
        </div>
      </section>

      {/* Your Attempt */}
      {(contest.userStartDate || contest.userEndDate) && (
        <section className="mb-6">
          <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
            Your Attempt
          </p>
          <div className="grid grid-cols-2 gap-3">
            <MetaTile label="Started At" value={formatDateTime(contest.userStartDate)} />
            <MetaTile label="Ended At" value={formatDateTime(contest.userEndDate)} />
          </div>
        </section>
      )}

      {/* Problem-wise Results */}
      {contest.questions && contest.questions.length > 0 && (
        <section>
          <p className="text-[11px] font-bold uppercase tracking-wider mb-3" style={{ color: "var(--text-muted)" }}>
            Problem-wise Results
          </p>
          <div className="flex flex-col gap-3">
            {contest.questions.map((q, i) => {
              const sub = submissionMap.get(q.id);
              const vc = sub ? verdictColor(sub.verdict) : null;
              const isExpanded = expandedCode === (sub?.id ?? -1);

              return (
                <div
                  key={q.id}
                  className="rounded-2xl overflow-hidden"
                  style={{ border: "1px solid var(--border-color)", backgroundColor: "var(--bg-card)" }}
                >
                  {/* Problem row */}
                  <div className="flex items-center gap-3 px-4 py-3">
                    <span
                      className="text-[11px] font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: "rgba(37,99,235,0.12)", color: "#2563eb" }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-[14px] font-semibold flex-1 min-w-0 truncate" style={{ color: "var(--text-primary)" }}>
                      {q.title}
                    </span>

                    {sub ? (
                      <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                        <span className="text-[12px] font-semibold" style={{ color: "var(--text-muted)" }}>
                          {sub.passedTC}/{sub.totalTC} TC
                        </span>
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded"
                          style={{ backgroundColor: "rgba(37,99,235,0.08)", color: "#2563eb" }}
                        >
                          {sub.language?.toUpperCase()}
                        </span>
                        <span
                          className="text-[11px] font-bold px-2.5 py-0.5 rounded-full"
                          style={vc ? { backgroundColor: vc.bg, color: vc.color } : {}}
                        >
                          {sub.verdict}
                        </span>
                        <button
                          id={`code-toggle-${sub.id}`}
                          onClick={() => setExpandedCode(isExpanded ? null : sub.id)}
                          className="text-[11px] font-bold px-2.5 py-1 rounded-lg cursor-pointer transition-colors duration-150"
                          style={{ backgroundColor: "rgba(37,99,235,0.08)", color: "#2563eb", border: "1px solid rgba(37,99,235,0.2)" }}
                        >
                          {isExpanded ? "Hide Code" : "View Code"}
                        </button>
                      </div>
                    ) : (
                      <span
                        className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full shrink-0"
                        style={{ backgroundColor: "rgba(107,114,128,0.08)", color: "#6b7280" }}
                      >
                        Not attempted
                      </span>
                    )}
                  </div>

                  {/* Expandable Code */}
                  {sub && isExpanded && (
                    <div style={{ borderTop: "1px solid var(--border-color)" }}>
                      <div
                        className="flex items-center justify-between px-4 py-2"
                        style={{ backgroundColor: "rgba(37,99,235,0.04)" }}
                      >
                        <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                          {sub.language} &bull; {sub.verdict} &bull; {sub.passedTC}/{sub.totalTC} test cases
                        </span>
                      </div>
                      <pre
                        className="text-[12px] px-4 py-3 overflow-x-auto leading-relaxed"
                        style={{
                          color: "var(--text-primary)",
                          fontFamily: "'Fira Code', 'Cascadia Code', monospace",
                          maxHeight: "300px",
                          overflowY: "auto",
                          backgroundColor: "var(--bg-base)",
                        }}
                      >
                        {sub.code}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
