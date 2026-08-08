import { useEffect, useState } from "react";
import { contestsApi } from "../../services/api";
import { SpinnerIcon } from "../../components/ui";
import CreateContestModal from "../../components/Home/CreateContestModal";
import ModifyContestModal from "../../components/ManageContests/ModifyContestModal";
import DeleteConfirmModal from "../../components/ManageContests/DeleteConfirmModal";
import ContestCard from "../../components/ManageContests/ContestCard";

interface CreatedContest {
  id: number;
  contestname: string;
  minutes: number;
  startDate: string | null;
  endDate: string | null;
  questions?: { id: number; title: string }[];
  attenders?: { id: number; name: string; email: string }[];
}

export default function ManageContestsPage() {
  const [contests, setContests] = useState<CreatedContest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [modifyTarget, setModifyTarget] = useState<CreatedContest | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchContests = async () => {
    setIsLoading(true);
    setFetchError("");
    try {
      const res = await contestsApi.getCreatedContests();
      if (res.status === "success" && Array.isArray(res.message)) {
        setContests(res.message);
      } else {
        setFetchError("Failed to load contests.");
      }
    } catch (err: any) {
      setFetchError(err.message || "Failed to load contests.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContests();
  }, []);

  const handleDeleteClick = (contest: CreatedContest) => {
    setDeleteTargetId(contest.id);
    setDeleteTargetName(contest.contestname);
  };

  const handleConfirmDelete = async () => {
    if (deleteTargetId === null) return;
    setIsDeleting(true);
    try {
      await contestsApi.deleteContest(deleteTargetId);
      setContests((prev) => prev.filter((c) => c.id !== deleteTargetId));
      setDeleteTargetId(null);
      setDeleteTargetName("");
    } catch (err: any) {
      alert(err.message || "Failed to delete contest.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleContestUpdated = (
    contestId: number,
    patch: { questions: { id: number; title: string }[]; attenders: { id: number; name: string; email: string }[] }
  ) => {
    setContests((prev) =>
      prev.map((c) =>
        c.id === contestId ? { ...c, questions: patch.questions, attenders: patch.attenders } : c
      )
    );
  };

  return (
    <main className="flex-grow max-w-6xl w-full mx-auto px-6 py-12 flex flex-col gap-10">

      {/* Page Header */}
      <div
        className="w-full rounded-3xl p-8 md:p-10 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 border cc-border shadow-md"
        style={{
          background: "linear-gradient(135deg, rgba(124,58,237,0.08) 0%, rgba(139,92,246,0.03) 100%)",
          backgroundColor: "var(--bg-card)",
        }}
      >
        <div className="absolute right-0 top-0 w-80 h-80 rounded-full bg-violet-500/10 blur-3xl -z-10 translate-x-10 -translate-y-10" />
        <div className="absolute left-1/4 bottom-0 w-48 h-48 rounded-full bg-purple-500/5 blur-3xl -z-10 translate-y-8" />

        <div className="flex flex-col gap-2 max-w-xl">
          <span className="text-[12px] font-bold uppercase tracking-wider text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 px-3 py-1.5 rounded-full w-max">
            Contest Management
          </span>
          <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight" style={{ color: "var(--text-primary)" }}>
            My <span className="text-violet-600 dark:text-violet-400">Contests</span>
          </h1>
          <p className="text-[14px] md:text-[15px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
            Create, manage, and track all the coding contests you've organised.
          </p>
        </div>

        <button
          id="create-contest-btn"
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-violet-600 hover:bg-violet-700 active:scale-95 text-white font-bold text-[14px] transition-all duration-200 shadow-md hover:shadow-violet-500/30 hover:shadow-lg shrink-0 cursor-pointer"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Create Contest
        </button>
      </div>

      {/* Contests List */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Created Contests
          </h2>
          <span className="text-[13px] font-semibold" style={{ color: "var(--text-muted)" }}>
            {contests.length} {contests.length === 1 ? "contest" : "contests"}
          </span>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-16 gap-3">
            <SpinnerIcon size={26} className="text-violet-600" />
            <span className="text-[14px]" style={{ color: "var(--text-muted)" }}>Loading your contests…</span>
          </div>
        ) : fetchError ? (
          <div className="rounded-2xl border border-red-100 dark:border-red-950/20 bg-red-50/50 dark:bg-red-950/5 p-8 text-center">
            <p className="text-[14px] text-red-500 font-semibold mb-3">{fetchError}</p>
            <button onClick={fetchContests} className="text-[13px] text-violet-600 font-bold hover:underline cursor-pointer">
              Try Again
            </button>
          </div>
        ) : contests.length === 0 ? (
          <div className="rounded-2xl border cc-border border-dashed p-14 text-center" style={{ backgroundColor: "var(--bg-card)" }}>
            <div className="w-14 h-14 rounded-full bg-violet-50 dark:bg-violet-950/30 text-violet-400 flex items-center justify-center mx-auto mb-4">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <h3 className="text-base font-bold mb-2" style={{ color: "var(--text-primary)" }}>No Contests Yet</h3>
            <p className="text-[13.5px] max-w-sm mx-auto leading-relaxed mb-5" style={{ color: "var(--text-muted)" }}>
              You haven't created any contests yet. Click the button above to create your first one!
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-[13px] font-bold transition-all duration-200 cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Create Your First Contest
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {contests.map((contest) => (
              <ContestCard
                key={contest.id}
                contest={contest}
                onModify={setModifyTarget}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateContestModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreated={() => { setShowCreateModal(false); fetchContests(); }}
      />

      {modifyTarget && (
        <ModifyContestModal
          contest={modifyTarget}
          onClose={() => setModifyTarget(null)}
          onSaved={handleContestUpdated}
        />
      )}

      {deleteTargetId !== null && (
        <DeleteConfirmModal
          contestName={deleteTargetName}
          isDeleting={isDeleting}
          onConfirm={handleConfirmDelete}
          onClose={() => { setDeleteTargetId(null); setDeleteTargetName(""); }}
        />
      )}
    </main>
  );
}
