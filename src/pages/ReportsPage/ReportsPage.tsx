import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { reportsApi } from "../../services/api";

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
  submissions: { id: number; question: { id: number; title: string } }[];
}

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function TrophyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="8 21 12 17 16 21" />
      <line x1="12" y1="17" x2="12" y2="11" />
      <path d="M7 4h10l1 7a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5Z" />
      <path d="M5 4H3v3a3 3 0 0 0 3 3" />
      <path d="M19 4h2v3a3 3 0 0 1-3 3" />
    </svg>
  );
}

function ReportBarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

export default function ReportsPage() {
  const [contests, setContests] = useState<ContestOver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    reportsApi
      .getContestsOver()
      .then((res) => setContests(res.message ?? []))
      .catch((err: Error) => setError(err.message ?? "Failed to load reports."))
      .finally(() => setLoading(false));
  }, []);

  const handleSeeReport = (contest: ContestOver) => {
    navigate("/reports/detail", { state: { contest } });
  };

  return (
    <main className="max-w-4xl mx-auto px-6 py-10 w-full">
      {/* Page Header */}
      <div className="flex items-center gap-3 mb-8">
        <div
          className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
          style={{ background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)" }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
          </svg>
        </div>
        <div>
          <h1 className="text-[24px] font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Reports
          </h1>
          <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>
            View completed contests and your performance
          </p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-24">
          <div className="w-8 h-8 rounded-full border-2 border-[#2563eb] border-t-transparent animate-spin" />
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-2xl border px-6 py-8 text-center" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-card)" }}>
          <p className="text-[14px]" style={{ color: "var(--text-muted)" }}>{error}</p>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && contests.length === 0 && (
        <div className="rounded-2xl border px-6 py-16 text-center flex flex-col items-center gap-3" style={{ borderColor: "var(--border-color)", backgroundColor: "var(--bg-card)" }}>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: "rgba(37,99,235,0.08)", color: "#2563eb" }}>
            <TrophyIcon />
          </div>
          <p className="text-[15px] font-semibold" style={{ color: "var(--text-primary)" }}>No completed contests yet</p>
          <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>Finished contests will appear here.</p>
        </div>
      )}

      {/* Contest list */}
      {!loading && !error && contests.length > 0 && (
        <div className="flex flex-col gap-3">
          {contests.map((contest) => {
            const attempted = (contest.submissions ?? []).length;
            const total = (contest.questions ?? []).length;
            return (
              <div
                key={contest.id}
                className="flex items-center justify-between gap-4 px-5 py-4 rounded-2xl border transition-all duration-200"
                style={{ backgroundColor: "var(--bg-card)", borderColor: "var(--border-color)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "rgba(37,99,235,0.3)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(37,99,235,0.06)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = "var(--border-color)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "none";
                }}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="min-w-0">
                    <p className="text-[15px] font-bold truncate" style={{ color: "var(--text-primary)" }}>
                      {contest.contestname}
                    </p>
                    <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                      <span className="text-[12px]" style={{ color: "var(--text-muted)" }}>
                        {formatDate(contest.startDate)} &mdash; {formatDate(contest.endDate)}
                      </span>
                      <span
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: "rgba(37,99,235,0.08)", color: "#2563eb" }}
                      >
                        {attempted}/{total} solved
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

                <button
                  id={`report-btn-${contest.id}`}
                  onClick={() => handleSeeReport(contest)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-bold shrink-0 transition-all duration-150 cursor-pointer"
                  style={{ background: "linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)", color: "white" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.88"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                >
                  <ReportBarIcon />
                  See Report
                </button>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
