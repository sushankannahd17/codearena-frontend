import { useNavigate } from "react-router-dom";

interface CreatedContest {
  id: number;
  contestname: string;
  minutes: number;
  startDate: string | null;
  endDate: string | null;
  questions?: { id: number; title: string }[];
  attenders?: { id: number; name: string; email: string }[];
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "N/A";
  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getContestStatus(contest: CreatedContest) {
  if (!contest.startDate && !contest.endDate) {
    return {
      label: "Always Open",
      color: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/35 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30",
    };
  }
  const now = new Date();
  const start = contest.startDate ? new Date(contest.startDate) : null;
  const end = contest.endDate ? new Date(contest.endDate) : null;
  if (start && now < start) {
    return {
      label: "Upcoming",
      color: "bg-amber-50 text-amber-600 dark:bg-amber-950/35 dark:text-amber-400 border-amber-100 dark:border-amber-900/30",
    };
  }
  if (end && now > end) {
    return {
      label: "Completed",
      color: "bg-neutral-100 text-neutral-600 dark:bg-neutral-800/40 dark:text-neutral-400 border-neutral-200 dark:border-neutral-700/30",
    };
  }
  return {
    label: "Active Now",
    color: "bg-blue-50 text-[#2563eb] dark:bg-blue-950/35 dark:text-blue-400 border-blue-100 dark:border-blue-900/30",
  };
}

interface ContestCardProps {
  contest: CreatedContest;
  onModify: (contest: CreatedContest) => void;
  onDelete: (contest: CreatedContest) => void;
}

export default function ContestCard({ contest, onModify, onDelete }: ContestCardProps) {
  const status = getContestStatus(contest);
  const navigate = useNavigate();

  const handleViewLeaderboard = () => {
    navigate("/leaderboard", {
      state: { contestId: contest.id, contestName: contest.contestname },
    });
  };

  return (
    <div
      className="rounded-2xl border cc-border hover:border-violet-500/40 p-5 flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 group"
      style={{ backgroundColor: "var(--bg-card)" }}
    >
      <div>
        {/* Status & Duration */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <span className={`px-2.5 py-0.5 text-[11px] font-bold border rounded-full ${status.color}`}>
            {status.label}
          </span>
          <span className="text-[12px] font-semibold text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            {contest.minutes} mins
          </span>
        </div>

        {/* Contest Title */}
        <h3
          className="text-lg font-bold group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors duration-200 line-clamp-1 mb-3"
          style={{ color: "var(--text-primary)" }}
        >
          {contest.contestname}
        </h3>

        {/* Meta Info */}
        <div className="flex flex-col gap-2 text-[13px]" style={{ color: "var(--text-secondary)" }}>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 w-24 shrink-0">Starts:</span>
            <span className="truncate">{contest.startDate ? formatDate(contest.startDate) : "Always Open"}</span>
          </div>
          {contest.endDate && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 w-24 shrink-0">Ends:</span>
              <span className="truncate">{formatDate(contest.endDate)}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 w-24 shrink-0">Questions:</span>
            <span className="font-semibold text-neutral-800 dark:text-neutral-200">{contest.questions?.length ?? 0}</span>
          </div>
          {contest.attenders !== undefined && (
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 w-24 shrink-0">Invitees:</span>
              <span className="font-semibold text-neutral-800 dark:text-neutral-200">{contest.attenders.length}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer — Leaderboard + Modify + Delete */}
      <div className="border-t cc-border mt-5 pt-4 flex items-center justify-between gap-2 flex-wrap">
        <button
          id={`leaderboard-contest-${contest.id}-btn`}
          onClick={handleViewLeaderboard}
          className="flex items-center gap-1.5 text-[12.5px] font-bold text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/20 px-3 py-1.5 rounded-lg transition-all duration-150 cursor-pointer"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="8 21 12 17 16 21" />
            <line x1="12" y1="17" x2="12" y2="11" />
            <path d="M7 4h10l1 7a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5Z" />
            <path d="M5 4H3v3a3 3 0 0 0 3 3" />
            <path d="M19 4h2v3a3 3 0 0 1-3 3" />
          </svg>
          Leaderboard
        </button>
        <button
          id={`modify-contest-${contest.id}-btn`}
          onClick={() => onModify(contest)}
          className="flex items-center gap-1.5 text-[12.5px] font-bold text-violet-600 dark:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-950/20 px-3 py-1.5 rounded-lg transition-all duration-150 cursor-pointer"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
          </svg>
          Modify
        </button>
        <button
          id={`delete-contest-${contest.id}-btn`}
          onClick={() => onDelete(contest)}
          className="flex items-center gap-1.5 text-[12.5px] font-bold text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 px-3 py-1.5 rounded-lg transition-all duration-150 cursor-pointer"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
          </svg>
          Delete
        </button>
      </div>
    </div>
  );
}
