import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { contestsApi } from "../../services/api";
import { type Contest } from "../../types";
import { SpinnerIcon } from "../../components/ui";

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getContestStatus = (c: Contest) => {
  if (!c.startDate && !c.endDate)
    return {
      label: "Always Open",
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40",
      dot: "bg-emerald-500",
    };
  const now = new Date();
  const start = c.startDate ? new Date(c.startDate) : null;
  const end = c.endDate ? new Date(c.endDate) : null;
  if (start && now < start)
    return {
      label: "Upcoming",
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/40",
      dot: "bg-amber-500",
    };
  if (end && now > end)
    return {
      label: "Completed",
      color: "text-neutral-500 dark:text-neutral-400",
      bg: "bg-neutral-100 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-700/40",
      dot: "bg-neutral-400",
    };
  return {
    label: "Active Now",
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/40",
    dot: "bg-blue-500 animate-pulse",
  };
};

function InfoTile({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: string;
}) {
  return (
    <div
      className="flex flex-col gap-2 rounded-2xl border cc-border p-5 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
      style={{ backgroundColor: "var(--bg-card)" }}
    >
      <div className={`flex items-center gap-2 ${accent ?? "text-blue-500"}`}>
        {icon}
        <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
          {label}
        </span>
      </div>
      <p
        className="text-[15px] font-bold leading-snug"
        style={{ color: "var(--text-primary)" }}
      >
        {value}
      </p>
    </div>
  );
}

export default function ContestDetailPage() {
  const location = useLocation();
  const contestId = (location.state as { contestId?: number })?.contestId;
  const navigate = useNavigate();

  const [contest, setContest] = useState<Contest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEntering, setIsEntering] = useState(false);
  const [enterError, setEnterError] = useState("");

  useEffect(() => {
    if (!contestId) return;
    const fetch = async () => {
      setIsLoading(true);
      setError("");
      try {
        const res = await contestsApi.getContest(contestId);
        if (res.status === "success" && res.message) {
          setContest(res.message as Contest);
        } else {
          setError("Failed to load contest details.");
        }
      } catch (err: any) {
        setError(err.message || "Failed to load contest details.");
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [contestId]);

  const handleStartContest = async () => {
    if (!contestId) return;
    setIsEntering(true);
    setEnterError("");
    try {
      const res = await contestsApi.enterContest(contestId);
      const msg = res.message;
      if (res.status === "success" && msg && Array.isArray(msg.questionList)) {
        const sessionEnd = msg.sessionEnd || new Date(Date.now() + (msg.secondsLeft ?? (contest?.minutes ?? 0) * 60) * 1000).toISOString();
        const contestStatus: string = msg.status ?? "Ongoing"; // "Ongoing" | "Completed"
        navigate("/contestarena", {
          state: {
            questions: msg.questionList,
            sessionEnd,
            contestName: contest?.contestname ?? "",
            contestId,
            contestStatus,
            resumeCount: msg.resumeCount ?? 0,
          },
        });
        // Only enter fullscreen for an active contest
        if (contestStatus === "Ongoing" && msg.questionList.length > 0) {
          try {
            await document.documentElement.requestFullscreen();
          } catch {
            // Fullscreen may be denied (e.g. in some browsers/iframes) — continue anyway
          }
        }
      } else {
        setEnterError(
          typeof res.message === "string" && res.message
            ? res.message
            : "Unable to enter contest. Please try again."
        );
      }
    } catch (err: any) {
      setEnterError(err.message || "Failed to enter contest.");
    } finally {
      setIsEntering(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <main className="flex-grow flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <SpinnerIcon size={30} className="text-blue-500" />
          <span className="text-[14px]" style={{ color: "var(--text-muted)" }}>
            Loading contest details…
          </span>
        </div>
      </main>
    );
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (error || !contest) {
    return (
      <main className="flex-grow flex items-center justify-center">
        <div className="flex flex-col items-center gap-5 text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-400">
            <svg
              width="28"
              height="28"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p className="text-[15px] font-semibold text-red-500">
            {error || "Contest not found."}
          </p>
          <button
            onClick={() => navigate(-1)}
            className="text-[13px] font-bold text-blue-500 hover:underline cursor-pointer"
          >
            ← Go Back
          </button>
        </div>
      </main>
    );
  }

  const status = getContestStatus(contest);

  // ── Main Page ────────────────────────────────────────────────────────────
  return (
    <main className="flex-grow max-w-4xl w-full mx-auto px-6 py-12 flex flex-col gap-10">

      {/* Back button */}
      <button
        id="contest-detail-back-btn"
        onClick={() => navigate(-1)}
        className="self-start flex items-center gap-2 text-[13px] font-semibold transition-colors duration-150 cursor-pointer group"
        style={{ color: "var(--text-muted)" }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="group-hover:-translate-x-0.5 transition-transform duration-150"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to Contests
      </button>

      {/* Hero Card */}
      <div
        className="relative w-full rounded-3xl p-8 md:p-10 overflow-hidden border cc-border shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-8"
        style={{
          background:
            "linear-gradient(135deg, rgba(37,99,235,0.07) 0%, rgba(99,102,241,0.03) 100%)",
          backgroundColor: "var(--bg-card)",
        }}
      >
        {/* Decorative blobs */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/3 w-48 h-48 rounded-full bg-violet-500/8 blur-3xl pointer-events-none" />

        <div className="flex flex-col gap-4 relative z-10">
          {/* Status badge */}
          <span
            className={`self-start inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold border rounded-full ${status.bg} ${status.color}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>

          {/* Contest name */}
          <h1
            className="text-3xl md:text-4xl font-extrabold tracking-tight leading-tight"
            style={{ color: "var(--text-primary)" }}
          >
            {contest.contestname}
          </h1>

          {/* Creator */}
          <p className="text-[14px]" style={{ color: "var(--text-muted)" }}>
            Organised by{" "}
            <span
              className="font-bold"
              style={{ color: "var(--text-secondary)" }}
            >
              {contest.user?.name || "Unknown"}
            </span>
          </p>
        </div>

        {/* Start Contest CTA */}
        <div className="flex flex-col items-end gap-2 relative z-10">
          {enterError && (
            <p className="text-[12px] text-red-500 font-semibold">{enterError}</p>
          )}
          <button
            id="start-contest-btn"
            onClick={handleStartContest}
            disabled={isEntering}
            className="shrink-0 flex items-center gap-2 px-7 py-3 rounded-2xl bg-[#2563eb] hover:bg-[#1d54d4] active:scale-95 text-white font-bold text-[15px] transition-all duration-200 shadow-lg hover:shadow-blue-500/30 hover:shadow-xl cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {isEntering ? (
              <>
                <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 11-6.219-8.56" />
                </svg>
                Entering…
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                Start Contest
              </>
            )}
          </button>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <InfoTile
          icon={
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          }
          label="Created At"
          value={formatDate(contest.createdAt)}
        />

        <InfoTile
          icon={
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="5 12 12 5 19 12" />
              <line x1="12" y1="5" x2="12" y2="19" />
            </svg>
          }
          label="Start Date"
          value={contest.startDate ? formatDate(contest.startDate) : "Always Open"}
          accent="text-emerald-500"
        />

        <InfoTile
          icon={
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="19 12 12 19 5 12" />
              <line x1="12" y1="5" x2="12" y2="19" />
            </svg>
          }
          label="End Date"
          value={contest.endDate ? formatDate(contest.endDate) : "—"}
          accent="text-red-400"
        />

        <InfoTile
          icon={
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          }
          label="Duration"
          value={`${contest.minutes} minutes`}
          accent="text-violet-500"
        />

        <InfoTile
          icon={
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4" />
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
            </svg>
          }
          label="Questions"
          value={`${contest.questions?.length ?? 0} problem${(contest.questions?.length ?? 0) !== 1 ? "s" : ""}`}
          accent="text-amber-500"
        />

        <InfoTile
          icon={
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          }
          label="Organizer"
          value={contest.user?.name || "Unknown"}
          accent="text-blue-500"
        />
      </div>
    </main>
  );
}
