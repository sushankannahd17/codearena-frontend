import { useEffect, useState } from "react";
import { contestsApi } from "../../services/api";
import { type Contest } from "../../types";
import { SpinnerIcon } from "../ui";

interface ContestDetailModalProps {
  contestId: number;
  onClose: () => void;
}

export default function ContestDetailModal({
  contestId,
  onClose,
}: ContestDetailModalProps) {
  const [contest, setContest] = useState<Contest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchContest = async () => {
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
    fetchContest();
  }, [contestId]);

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
      return { label: "Always Open", color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800/40" };
    const now = new Date();
    const start = c.startDate ? new Date(c.startDate) : null;
    const end = c.endDate ? new Date(c.endDate) : null;
    if (start && now < start)
      return { label: "Upcoming", color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800/40" };
    if (end && now > end)
      return { label: "Completed", color: "text-neutral-500", bg: "bg-neutral-100 dark:bg-neutral-800/40 border-neutral-200 dark:border-neutral-700/40" };
    return { label: "Active Now", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/40" };
  };

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
      onClick={handleBackdropClick}
    >
      <div
        className="relative w-full max-w-xl rounded-3xl shadow-2xl border cc-border overflow-hidden animate-fade-in"
        style={{ backgroundColor: "var(--bg-card)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative gradient blobs */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-violet-500/10 blur-3xl pointer-events-none" />

        {/* Header */}
        <div
          className="relative flex items-center justify-between px-7 pt-7 pb-5"
          style={{
            borderBottom: "1px solid var(--border-color)",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/40 text-blue-500 flex items-center justify-center shrink-0">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
              </svg>
            </div>
            <h2 className="text-xl font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
              Contest Details
            </h2>
          </div>

          <button
            id="contest-detail-close-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-all duration-150 cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-7 py-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <SpinnerIcon size={26} className="text-blue-500" />
              <span className="text-[14px]" style={{ color: "var(--text-muted)" }}>
                Loading contest details…
              </span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
              <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center text-red-400">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <p className="text-[14px] font-semibold text-red-500">{error}</p>
            </div>
          ) : contest ? (
            <div className="flex flex-col gap-6">
              {/* Status badge + name */}
              <div className="flex flex-col gap-2">
                <span
                  className={`self-start px-3 py-1 text-[11px] font-bold border rounded-full ${getContestStatus(contest).bg} ${getContestStatus(contest).color}`}
                >
                  {getContestStatus(contest).label}
                </span>
                <h3
                  className="text-2xl font-extrabold tracking-tight leading-snug"
                  style={{ color: "var(--text-primary)" }}
                >
                  {contest.contestname}
                </h3>
                <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>
                  Created by{" "}
                  <span className="font-semibold" style={{ color: "var(--text-secondary)" }}>
                    {contest.user?.name || "Unknown"}
                  </span>
                </p>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Created At */}
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

                {/* Duration */}
                <InfoTile
                  icon={
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                  }
                  label="Duration"
                  value={`${contest.minutes} minutes`}
                />

                {/* Start Date */}
                <InfoTile
                  icon={
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="5 12 12 5 19 12" />
                      <line x1="12" y1="5" x2="12" y2="19" />
                    </svg>
                  }
                  label="Start Date"
                  value={contest.startDate ? formatDate(contest.startDate) : "Always Open"}
                />

                {/* End Date */}
                <InfoTile
                  icon={
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="19 12 12 19 5 12" />
                      <line x1="12" y1="5" x2="12" y2="19" />
                    </svg>
                  }
                  label="End Date"
                  value={contest.endDate ? formatDate(contest.endDate) : "—"}
                />

                {/* Questions */}
                <InfoTile
                  icon={
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 11l3 3L22 4" />
                      <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                    </svg>
                  }
                  label="Questions"
                  value={`${contest.questions?.length ?? 0} problem${(contest.questions?.length ?? 0) !== 1 ? "s" : ""}`}
                />

                {/* Organizer */}
                <InfoTile
                  icon={
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  }
                  label="Organizer"
                  value={contest.user?.name || "Unknown"}
                />
              </div>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        {!isLoading && !error && contest && (
          <div
            className="flex items-center justify-between gap-3 px-7 py-5"
            style={{ borderTop: "1px solid var(--border-color)" }}
          >
            <button
              onClick={onClose}
              className="text-[13px] font-semibold px-4 py-2 rounded-xl transition-all duration-200 cursor-pointer"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-hover)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              Close
            </button>
            <button
              id="start-contest-btn"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2563eb] hover:bg-[#1d54d4] active:scale-95 text-white font-bold text-[14px] transition-all duration-200 shadow-md hover:shadow-blue-500/30 hover:shadow-lg cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Start Contest
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Helper: Info Tile ────────────────────────────────────────────────────────

function InfoTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div
      className="flex flex-col gap-1.5 rounded-2xl border cc-border p-4"
      style={{ backgroundColor: "var(--bg-base)" }}
    >
      <div className="flex items-center gap-1.5 text-blue-500">
        {icon}
        <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500">
          {label}
        </span>
      </div>
      <p className="text-[14px] font-semibold leading-snug" style={{ color: "var(--text-primary)" }}>
        {value}
      </p>
    </div>
  );
}
