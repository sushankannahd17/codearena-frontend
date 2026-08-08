import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { contestsApi } from "../../services/api";
import { type Contest } from "../../types";
import { SpinnerIcon } from "../ui";

export default function AvailableContests() {
  const navigate = useNavigate();
  const [contests, setContests] = useState<Contest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const fetchContests = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await contestsApi.getAvailable();
      if (res.status === "success" && Array.isArray(res.message)) {
        const all: Contest[] = res.message;
        // Hide contests whose endDate has already passed
        const active = all.filter((c) => {
          if (!c.endDate) return true; // Always Open — always show
          return new Date(c.endDate).getTime() > Date.now();
        });
        setContests(active);
      } else {
        setError("Failed to fetch available contests.");
      }
    } catch (err: any) {
      console.error("Error loading available contests:", err);
      setError(err.message || "Failed to load contests from backend.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContests();
  }, []);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getContestStatus = (contest: Contest) => {
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
      color: "bg-blue-50 text-[#2563eb] dark:bg-blue-950/35 dark:text-blue-400 border-blue-100 dark:border-blue-900/30 animate-pulse",
    };
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 gap-3">
        <SpinnerIcon size={24} className="text-[#2563eb]" />
        <span className="text-[14px]" style={{ color: "var(--text-muted)" }}>
          Loading available contests...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 dark:border-red-950/20 bg-red-50/50 dark:bg-red-950/5 p-6 text-center">
        <p className="text-[14px] text-red-500 font-semibold mb-2">{error}</p>
        <button
          onClick={fetchContests}
          className="text-[13px] text-[#2563eb] font-bold hover:underline cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
          Available Contests to Attend
        </h2>
        <span className="text-[13px] font-semibold" style={{ color: "var(--text-muted)" }}>
        {contests.length} {contests.length === 1 ? "contest" : "contests"} available
        </span>
      </div>

      {contests.length === 0 ? (
        <div
          className="rounded-2xl border cc-border border-dashed p-10 text-center"
          style={{ backgroundColor: "var(--bg-card)" }}
        >
          <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 flex items-center justify-center mx-auto mb-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <h3 className="text-md font-bold mb-1" style={{ color: "var(--text-primary)" }}>
            No Contests Scheduled
          </h3>
          <p className="text-[13.5px] max-w-sm mx-auto leading-relaxed" style={{ color: "var(--text-muted)" }}>
            You haven't been invited to any upcoming or active coding contests yet. Check back later!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contests.map((contest) => {
            const status = getContestStatus(contest);
            return (
              <div
                key={contest.id}
                className="rounded-2xl border cc-border hover:border-blue-500/40 p-5 flex flex-col justify-between transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-0.5 group"
                style={{ backgroundColor: "var(--bg-card)" }}
              >
                <div>
                  {/* Card Header Status & Duration */}
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <span className={`px-2.5 py-0.5 text-[11px] font-bold border rounded-full ${status.color}`}>
                      {status.label}
                    </span>
                    <span className="text-[12px] font-semibold text-neutral-500 dark:text-neutral-400 flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      {contest.minutes} mins
                    </span>
                  </div>

                  {/* Contest Title */}
                  <h3
                    className="text-lg font-bold group-hover:text-[#2563eb] transition-colors duration-200 line-clamp-1 mb-2"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {contest.contestname}
                  </h3>

                  {/* Contest Meta Info */}
                  <div className="flex flex-col gap-2 mt-4 text-[13px]" style={{ color: "var(--text-secondary)" }}>
                    {/* Organized By */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11.5px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 w-24 shrink-0">
                        Organizer:
                      </span>
                      <span className="font-semibold truncate">
                        {contest.user?.name || "Unknown"}
                      </span>
                    </div>

                    {/* Start Date */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11.5px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 w-24 shrink-0">
                        Starts:
                      </span>
                      <span className="truncate">
                        {contest.startDate ? formatDate(contest.startDate) : "Always Open"}
                      </span>
                    </div>

                    {/* End Date */}
                    {contest.endDate && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11.5px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 w-24 shrink-0">
                          Ends:
                        </span>
                        <span className="truncate">
                          {formatDate(contest.endDate)}
                        </span>
                      </div>
                    )}

                    {/* Questions Count */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11.5px] font-bold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 w-24 shrink-0">
                        Questions:
                      </span>
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                        {contest.questions?.length || 0}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Section */}
                <div className="border-t cc-border mt-5 pt-4 flex justify-end">
                  {/* Enter Contest Button */}
                  <button
                    id={`enter-contest-btn-${contest.id}`}
                    onClick={() => navigate("/contesthome", { state: { contestId: contest.id } })}
                    className="bg-[#2563eb] hover:bg-[#1d54d4] text-white text-[12.5px] font-bold px-4 py-1.5 rounded-lg transition-all duration-200 active:scale-95 cursor-pointer"
                  >
                    Enter Contest
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

