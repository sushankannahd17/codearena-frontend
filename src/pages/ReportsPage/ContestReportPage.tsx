import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { reportsApi } from "../../services/api";

// ─── Types ───────────────────────────────────────────────────────────────────

interface Example {
  id: number;
  input: string;
  output: string;
  description?: string;
}

interface ContestQuestion {
  id: number;
  title: string;
  description?: string;
  examples?: Example[];
}

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
  questions: ContestQuestion[];
  submissions: Submission[];
  contestOver?: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatDateTime(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true });
}

function verdictColor(verdict: string) {
  switch (verdict?.toLowerCase()) {
    case "accepted":            return { bg: "rgba(16,185,129,0.12)",  color: "#10b981", border: "rgba(16,185,129,0.3)" };
    case "wrong answer":        return { bg: "rgba(239,68,68,0.12)",   color: "#ef4444", border: "rgba(239,68,68,0.3)" };
    case "time limit exceeded": return { bg: "rgba(245,158,11,0.12)", color: "#f59e0b", border: "rgba(245,158,11,0.3)" };
    default:                    return { bg: "rgba(107,114,128,0.1)",  color: "#6b7280", border: "rgba(107,114,128,0.3)" };
  }
}

// ─── Contest Report Page ─────────────────────────────────────────────────────

export default function ContestReportPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const contest = location.state?.contest as ContestOver | undefined;

  const [selectedQId, setSelectedQId] = useState<number | null>(null);
  const [expandedCode, setExpandedCode] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExport = async () => {
    if (!contest) return;
    setIsExporting(true);
    setExportError(null);
    try {
      await reportsApi.exportContestReport(contest.id, contest.contestname);
    } catch (err: any) {
      setExportError(err.message ?? "Export failed.");
    } finally {
      setIsExporting(false);
    }
  };

  if (!contest) {
    return (
      <main className="w-full px-6 py-16 flex flex-col items-center gap-4">
        <p className="text-[15px] font-semibold" style={{ color: "var(--text-primary)" }}>No report data found.</p>
        <button
          onClick={() => navigate("/reports")}
          className="text-[13px] font-bold px-4 py-2 rounded-xl cursor-pointer"
          style={{ background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)", color: "white" }}
        >
          Back to Reports
        </button>
      </main>
    );
  }

  if (contest.contestOver === false) {
    return (
      <main className="w-full px-6 py-16 flex flex-col items-center">
        <div className="self-start mb-10">
          <button id="report-back-btn" onClick={() => navigate("/reports")}
            className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer hover:scale-105"
            style={{ backgroundColor: "var(--bg-card)", border: "1px solid var(--border-color)", color: "var(--text-muted)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
          </button>
        </div>
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
          style={{ background: "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(251,191,36,0.08))", border: "2px solid rgba(245,158,11,0.35)" }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <h1 className="text-[22px] font-extrabold tracking-tight mb-2 text-center" style={{ color: "var(--text-primary)" }}>{contest.contestname}</h1>
        <p className="text-[15px] text-center leading-relaxed mb-2" style={{ color: "var(--text-muted)", maxWidth: "420px" }}>
          The contest is still going on, please wait for the contest to end to see the report.
        </p>
        <div className="flex items-center gap-2 mt-4">
          <span style={{ width:"8px",height:"8px",borderRadius:"50%",backgroundColor:"#f59e0b",display:"inline-block",animation:"ping 1.2s cubic-bezier(0,0,0.2,1) infinite" }} />
          <span className="text-[13px] font-semibold" style={{ color: "#f59e0b" }}>Contest in progress</span>
        </div>
        <style>{`@keyframes ping{0%{transform:scale(1);opacity:1;}75%,100%{transform:scale(1.8);opacity:0;}}`}</style>
      </main>
    );
  }

  const submissionMap = new Map<number, Submission>();
  (contest.submissions ?? []).forEach((s) => submissionMap.set(s.question.id, s));

  const attempted = new Set(
    (contest.submissions ?? [])
      .filter((s) => s.verdict?.toLowerCase() === "accepted")
      .map((s) => s.question?.id)
  ).size;
  const total = (contest.questions ?? []).length;

  const selectedQ = selectedQId != null
    ? (contest.questions ?? []).find((q) => q.id === selectedQId) ?? null
    : null;
  const selectedSub = selectedQ ? submissionMap.get(selectedQ.id) : null;
  const selectedVc = selectedSub ? verdictColor(selectedSub.verdict) : null;

  return (
    <div className="flex flex-col w-full" style={{ height: "calc(100vh - 64px)" }}>

      {/* ── Top header bar ──────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-4 px-6 py-3 border-b shrink-0 flex-wrap"
        style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}
      >
        <button
          id="report-back-btn"
          onClick={() => navigate("/reports")}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 cursor-pointer shrink-0 hover:scale-105"
          style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border-color)", color: "var(--text-muted)" }}
          aria-label="Back to reports"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div className="flex-1 min-w-0">
          <h1 className="text-[19px] font-extrabold tracking-tight truncate" style={{ color: "var(--text-primary)" }}>
            {contest.contestname}
          </h1>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-[12px]" style={{ color: "var(--text-muted)" }}>
              {formatDate(contest.startDate)} &mdash; {formatDate(contest.endDate)}
            </span>
            {attempted === total && total > 0 ? (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(16,185,129,0.1)", color: "#10b981" }}>
                Completed
              </span>
            ) : (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: "rgba(239,68,68,0.08)", color: "#ef4444" }}>
                Not Completed
              </span>
            )}
          </div>
        </div>

        {/* Stats pills */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {contest.minutes && (
            <span className="text-[12px] font-semibold px-3 py-1.5 rounded-xl" style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border-color)", color: "var(--text-secondary)" }}>
              Duration: {contest.minutes} mins
            </span>
          )}
          <span className="text-[12px] font-semibold px-3 py-1.5 rounded-xl" style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border-color)", color: "var(--text-secondary)" }}>
            Solved: {attempted}/{total}
          </span>
          <span className="text-[12px] font-semibold px-3 py-1.5 rounded-xl" style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border-color)", color: "var(--text-secondary)" }}>
            Submissions: {contest.submitCount ?? attempted}
          </span>
          {contest.maxResumeCount != null && (
            <span className="text-[12px] font-semibold px-3 py-1.5 rounded-xl" style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border-color)", color: "var(--text-secondary)" }}>
              Resumes: {contest.resumeCount ?? 0}/{contest.maxResumeCount}
            </span>
          )}
          {(contest.userStartDate || contest.userEndDate) && (
            <span className="text-[12px] font-semibold px-3 py-1.5 rounded-xl" style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border-color)", color: "var(--text-secondary)" }}>
              Attempt: {formatDateTime(contest.userStartDate)} → {formatDateTime(contest.userEndDate)}
            </span>
          )}
        </div>

        {/* Export button */}
        <div className="flex flex-col items-end gap-1 shrink-0">
          <button
            id="export-report-btn"
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold transition-all duration-150 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            style={{
              background: isExporting
                ? "rgba(37,99,235,0.15)"
                : "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
              color: isExporting ? "#2563eb" : "white",
              border: isExporting ? "1px solid rgba(37,99,235,0.3)" : "none",
            }}
          >
            {isExporting ? (
              <>
                <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                Exporting...
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Export Report
              </>
            )}
          </button>
          {exportError && (
            <span className="text-[11px] font-semibold" style={{ color: "#ef4444" }}>
              {exportError}
            </span>
          )}
        </div>
      </div>

      {/* ── Two-column body ─────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* Left — Question list */}
        <div
          className="flex flex-col border-r shrink-0 overflow-y-auto"
          style={{ width: "300px", borderColor: "var(--border-color)", backgroundColor: "var(--bg-base)" }}
        >
          <div className="px-4 py-3 border-b shrink-0" style={{ borderColor: "var(--border-color)" }}>
            <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
              Problems ({total})
            </p>
          </div>
          <div className="flex flex-col">
            {(contest.questions ?? []).map((q, i) => {
              const sub = submissionMap.get(q.id);
              const vc = sub ? verdictColor(sub.verdict) : null;
              const isSelected = selectedQId === q.id;
              return (
                <button
                  key={q.id}
                  id={`q-list-btn-${q.id}`}
                  onClick={() => { setSelectedQId(isSelected ? null : q.id); setExpandedCode(false); }}
                  className="flex items-center gap-3 px-4 py-3 text-left w-full transition-colors duration-150 cursor-pointer border-b"
                  style={{
                    backgroundColor: isSelected ? "rgba(37,99,235,0.07)" : "transparent",
                    borderLeft: isSelected ? "3px solid #2563eb" : "3px solid transparent",
                    borderColor: "var(--border-color)",
                  }}
                >
                  <span
                    className="text-[11px] font-bold w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "rgba(37,99,235,0.12)", color: "#2563eb" }}
                  >
                    {i + 1}
                  </span>
                  <span className="flex-1 min-w-0 text-[13px] font-semibold leading-snug text-left" style={{ color: "var(--text-primary)" }}>
                    {q.title}
                  </span>
                  {sub ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                      style={vc ? { backgroundColor: vc.bg, color: vc.color } : {}}>
                      {sub.verdict === "Accepted" ? "✓" : sub.verdict === "Wrong Answer" ? "✗" : "!"}
                    </span>
                  ) : (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full shrink-0"
                      style={{ backgroundColor: "rgba(107,114,128,0.1)", color: "#6b7280" }}>—</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right — Question detail */}
        <div className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: "var(--bg-base)" }}>
          {selectedQ ? (
            <>
              {/* Question header */}
              <div className="px-7 pt-6 pb-4 border-b shrink-0" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-card)" }}>
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <h2 className="text-[19px] font-extrabold leading-tight" style={{ color: "var(--text-primary)" }}>
                    {selectedQ.title}
                  </h2>
                  {selectedSub && selectedVc ? (
                    <div className="flex items-center gap-2 flex-wrap shrink-0">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ backgroundColor: "rgba(37,99,235,0.08)", color: "#2563eb" }}>
                        {selectedSub.language?.toUpperCase()}
                      </span>
                      <span className="text-[12px] font-semibold" style={{ color: "var(--text-muted)" }}>
                        {selectedSub.passedTC}/{selectedSub.totalTC} TC
                      </span>
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: selectedVc.bg, color: selectedVc.color, border: `1px solid ${selectedVc.border}` }}>
                        {selectedSub.verdict}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[11px] font-semibold px-3 py-1 rounded-full shrink-0"
                      style={{ backgroundColor: "rgba(107,114,128,0.08)", color: "#6b7280", border: "1px solid rgba(107,114,128,0.2)" }}>
                      Not attempted
                    </span>
                  )}
                </div>
              </div>

              {/* Split: description+examples LEFT | submission code RIGHT */}
              <div className="flex flex-1 overflow-hidden divide-x" style={{ borderColor: "var(--border-color)" }}>

                {/* Description + Examples */}
                <div className="flex-1 overflow-y-auto px-7 py-6 flex flex-col gap-6">

                  {selectedQ.description && (
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>Description</p>
                      <p className="whitespace-pre-wrap text-[14px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
                        {selectedQ.description}
                      </p>
                    </div>
                  )}

                  {selectedQ.examples && selectedQ.examples.length > 0 && (
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: "var(--text-muted)" }}>Example Test Cases</p>
                      <div className="flex flex-col gap-3">
                        {selectedQ.examples.map((ex, i) => (
                          <div key={ex.id} className="rounded-xl overflow-hidden"
                            style={{ border: "1px solid var(--border-color)", backgroundColor: "var(--bg-card)" }}>
                            <div className="px-4 py-2 border-b" style={{ borderColor: "var(--border-color)" }}>
                              <span className="text-[11px] font-bold text-blue-500 uppercase tracking-wider">Example {i + 1}</span>
                            </div>
                            <div className="px-4 py-3 flex flex-col gap-2">
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Input</span>
                                <pre className="mt-1 text-[13px] font-mono p-2.5 rounded-lg" style={{ backgroundColor: "var(--bg-base)", color: "#34d399" }}>{ex.input}</pre>
                              </div>
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Output</span>
                                <pre className="mt-1 text-[13px] font-mono p-2.5 rounded-lg" style={{ backgroundColor: "var(--bg-base)", color: "#60a5fa" }}>{ex.output}</pre>
                              </div>
                              {ex.description && (
                                <div>
                                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Explanation</span>
                                  <pre className="mt-1 text-[12px] font-mono p-2.5 rounded-lg whitespace-pre-wrap" style={{ backgroundColor: "var(--bg-base)", color: "var(--text-secondary)" }}>{ex.description}</pre>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {!selectedQ.description && (!selectedQ.examples || selectedQ.examples.length === 0) && (
                    <p className="text-[13px] italic" style={{ color: "var(--text-muted)" }}>No description available for this question.</p>
                  )}
                </div>

                {/* Submission Code */}
                <div className="flex flex-col overflow-hidden" style={{ width: "44%", minWidth: "280px", borderColor: "var(--border-color)" }}>
                  {selectedSub ? (
                    <>
                      <div className="flex items-center justify-between px-5 py-3 border-b shrink-0"
                        style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-card)" }}>
                        <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Your Submission</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ backgroundColor: "rgba(37,99,235,0.08)", color: "#2563eb" }}>
                            {selectedSub.language?.toUpperCase()}
                          </span>
                          <button
                            id={`code-toggle-${selectedSub.id}`}
                            onClick={() => setExpandedCode((v) => !v)}
                            className="text-[11px] font-bold px-2.5 py-1 rounded-lg cursor-pointer transition-colors duration-150"
                            style={{ backgroundColor: "rgba(37,99,235,0.08)", color: "#2563eb", border: "1px solid rgba(37,99,235,0.2)" }}
                          >
                            {expandedCode ? "Collapse" : "Expand"}
                          </button>
                        </div>
                      </div>
                      <pre
                        className="flex-1 text-[12px] px-5 py-4 overflow-auto leading-relaxed"
                        style={{
                          color: "var(--text-primary)",
                          fontFamily: "'JetBrains Mono','Fira Code','Cascadia Code',monospace",
                          backgroundColor: "var(--bg-base)",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-all",
                        }}
                      >
                        {selectedSub.code}
                      </pre>
                    </>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 px-6" style={{ backgroundColor: "var(--bg-card)" }}>
                      <div className="w-12 h-12 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: "rgba(107,114,128,0.1)", color: "#6b7280" }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                        </svg>
                      </div>
                      <p className="text-[13px] font-semibold" style={{ color: "var(--text-muted)" }}>Not attempted</p>
                      <p className="text-[12px] text-center" style={{ color: "var(--text-muted)" }}>No submission was made for this question.</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* Empty state — no question selected */
            <div className="flex-1 flex flex-col items-center justify-center gap-4" style={{ minHeight: "60vh" }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.12), rgba(124,58,237,0.08))", border: "1px solid rgba(37,99,235,0.2)" }}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-[15px] font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Select a problem</p>
                <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>Click any question on the left to see its description, examples, and submission.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
