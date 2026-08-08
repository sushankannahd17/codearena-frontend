import { useEffect, useState } from "react";
import { authApi, contestsApi, questionsApi } from "../../services/api";
import { ImportUsersButton, SpinnerIcon } from "../ui";

interface BackendQuestion {
  id: number;
  title: string;
  description: string;
}

interface BackendUser {
  id: number;
  name: string;
  email: string;
}

interface CreatedContest {
  id: number;
  contestname: string;
  minutes: number;
  startDate: string | null;
  endDate: string | null;
  questions?: { id: number; title: string }[];
  attenders?: { id: number; name: string; email: string }[];
}

type ModifyTab = "questions" | "participants";

interface ModifyContestModalProps {
  contest: CreatedContest;
  onClose: () => void;
  onSaved: (
    contestId: number,
    patch: {
      questions: { id: number; title: string }[];
      attenders: { id: number; name: string; email: string }[];
    }
  ) => void;
}

export default function ModifyContestModal({ contest, onClose, onSaved }: ModifyContestModalProps) {
  const [activeTab, setActiveTab] = useState<ModifyTab>("questions");

  const [allQuestions, setAllQuestions] = useState<BackendQuestion[]>([]);
  const [selectedQuestionIDs, setSelectedQuestionIDs] = useState<number[]>(
    contest.questions?.map((q) => q.id) ?? []
  );
  const [loadingQuestions, setLoadingQuestions] = useState(true);

  const [allUsers, setAllUsers] = useState<BackendUser[]>([]);
  const [selectedAttenderIDs, setSelectedAttenderIDs] = useState<number[]>(
    contest.attenders?.map((a) => a.id) ?? []
  );
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userSearch, setUserSearch] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleImportedUsers = (newUsers: { id: number; name: string; email: string }[]) => {
    setAllUsers((prev) => {
      const existingIds = new Set(prev.map((u) => u.id));
      const toAdd = newUsers.filter((u) => !existingIds.has(u.id));
      return [...prev, ...toAdd];
    });
    setSelectedAttenderIDs((prev) => {
      const newIds = newUsers.map((u) => u.id).filter((id) => !prev.includes(id));
      return [...prev, ...newIds];
    });
  };

  useEffect(() => {
    questionsApi
      .getAll()
      .then((res: any) => {
        if (res.status === "success" && Array.isArray(res.message)) {
          setAllQuestions(
            res.message.map((q: any) => ({ id: q.id, title: q.title, description: q.description }))
          );
        }
      })
      .catch(() => setAllQuestions([]))
      .finally(() => setLoadingQuestions(false));

    authApi
      .getAllUsers()
      .then((res: any) => {
        if (res.status === "success" && Array.isArray(res.message)) {
          setAllUsers(
            res.message.map((u: any) => ({ id: u.id, name: u.name, email: u.email }))
          );
        }
      })
      .catch(() => setAllUsers([]))
      .finally(() => setLoadingUsers(false));
  }, []);

  const toggleQuestion = (id: number) =>
    setSelectedQuestionIDs((prev) =>
      prev.includes(id) ? prev.filter((q) => q !== id) : [...prev, id]
    );

  const toggleAttender = (id: number) =>
    setSelectedAttenderIDs((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );

  const filteredUsers = allUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const handleSave = async () => {
    setError("");
    setSuccess("");
    if (selectedQuestionIDs.length === 0) {
      setError("Select at least one question.");
      setActiveTab("questions");
      return;
    }
    setIsSaving(true);
    try {
      const res = await contestsApi.modifyContest(contest.id, {
        questionID: selectedQuestionIDs,
        attenderID: selectedAttenderIDs,
      });
      if (res.status === "success") {
        setSuccess("Contest updated successfully!");
        const updatedQs = allQuestions
          .filter((q) => selectedQuestionIDs.includes(q.id))
          .map((q) => ({ id: q.id, title: q.title }));
        const updatedAttenders = allUsers
          .filter((u) => selectedAttenderIDs.includes(u.id))
          .map((u) => ({ id: u.id, name: u.name, email: u.email }));
        setTimeout(() => {
          onSaved(contest.id, { questions: updatedQs, attenders: updatedAttenders });
          onClose();
        }, 900);
      } else {
        setError("Failed to update contest. Try again.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to update contest.");
    } finally {
      setIsSaving(false);
    }
  };

  const isLoading = loadingQuestions || loadingUsers;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.currentTarget === e.target) onClose(); }}
    >
      <div
        className="w-full max-w-lg rounded-3xl border cc-border shadow-2xl flex flex-col max-h-[90vh]"
        style={{ backgroundColor: "var(--bg-card)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b cc-border shrink-0">
          <div>
            <h2 className="text-[17px] font-bold" style={{ color: "var(--text-primary)" }}>
              Modify Contest
            </h2>
            <p className="text-[12.5px] mt-0.5 truncate max-w-[280px]" style={{ color: "var(--text-muted)" }}>
              {contest.contestname}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            style={{ color: "var(--text-muted)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b cc-border shrink-0 px-7">
          {(["questions", "participants"] as ModifyTab[]).map((tab) => {
            const isActive = activeTab === tab;
            const count = tab === "questions" ? selectedQuestionIDs.length : selectedAttenderIDs.length;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative py-3 px-1 mr-6 text-[13px] font-bold capitalize transition-colors duration-150 cursor-pointer ${
                  isActive ? "text-violet-600 dark:text-violet-400" : ""
                }`}
                style={{ color: isActive ? undefined : "var(--text-muted)" }}
              >
                {tab}
                <span
                  className={`ml-1.5 text-[11px] px-1.5 py-0.5 rounded-full font-bold ${
                    isActive
                      ? "bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400"
                  }`}
                >
                  {count}
                </span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-violet-600 dark:bg-violet-400 rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 px-7 py-5 flex flex-col gap-3">
          {isLoading ? (
            <div className="flex items-center gap-2 py-10 justify-center text-[13px]" style={{ color: "var(--text-muted)" }}>
              <SpinnerIcon size={18} className="text-violet-600" />
              Loading…
            </div>
          ) : activeTab === "questions" ? (
            <>
              <p className="text-[12px] font-semibold" style={{ color: "var(--text-muted)" }}>
                {selectedQuestionIDs.length} of {allQuestions.length} selected
              </p>
              {allQuestions.length === 0 ? (
                <p className="text-[13px] py-4 text-center" style={{ color: "var(--text-muted)" }}>
                  No questions available. Create questions first.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {allQuestions.map((q) => {
                    const checked = selectedQuestionIDs.includes(q.id);
                    return (
                      <label
                        key={q.id}
                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-150 ${
                          checked
                            ? "border-violet-500/40 bg-violet-50/50 dark:bg-violet-950/20"
                            : "cc-border hover:border-violet-300/50"
                        }`}
                        style={{ backgroundColor: checked ? undefined : "var(--bg-base)" }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleQuestion(q.id)}
                          className="mt-0.5 w-4 h-4 shrink-0 cursor-pointer accent-violet-600"
                        />
                        <div className="flex flex-col gap-0.5 min-w-0">
                          <span className="text-[13.5px] font-bold truncate" style={{ color: "var(--text-primary)" }}>
                            {q.title}
                          </span>
                          <span className="text-[12px] line-clamp-1" style={{ color: "var(--text-muted)" }}>
                            {q.description}
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-semibold" style={{ color: "var(--text-muted)" }}>
                  {selectedAttenderIDs.length} of {allUsers.length} selected
                </p>
                <ImportUsersButton onUsersAdded={handleImportedUsers} />
              </div>
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search by name or email…"
                className="w-full rounded-xl px-4 py-2 text-[13px] border cc-border outline-none focus:border-violet-500 transition-colors"
                style={{ backgroundColor: "var(--bg-base)", color: "var(--text-primary)" }}
              />
              {filteredUsers.length === 0 ? (
                <p className="text-[13px] py-3 text-center" style={{ color: "var(--text-muted)" }}>
                  No users match your search.
                </p>
              ) : (
                <div className="flex flex-col gap-2">
                  {filteredUsers.map((u) => {
                    const checked = selectedAttenderIDs.includes(u.id);
                    return (
                      <label
                        key={u.id}
                        className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all duration-150 ${
                          checked
                            ? "border-violet-500/40 bg-violet-50/50 dark:bg-violet-950/20"
                            : "cc-border hover:border-violet-300/50"
                        }`}
                        style={{ backgroundColor: checked ? undefined : "var(--bg-base)" }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleAttender(u.id)}
                          className="w-4 h-4 shrink-0 cursor-pointer accent-violet-600"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-[13px] font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                            {u.name}
                          </p>
                          <p className="text-[11.5px] truncate" style={{ color: "var(--text-muted)" }}>
                            {u.email}
                          </p>
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {error && (
            <p className="text-[13px] text-red-500 font-semibold bg-red-50 dark:bg-red-950/20 px-4 py-2.5 rounded-xl border border-red-100 dark:border-red-900/20">
              {error}
            </p>
          )}
          {success && (
            <p className="text-[13px] text-emerald-600 font-semibold bg-emerald-50 dark:bg-emerald-950/20 px-4 py-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/20">
              ✓ {success}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 justify-end px-7 py-5 border-t cc-border shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-[13.5px] font-bold border cc-border hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            style={{ color: "var(--text-secondary)" }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || isLoading}
            className="px-6 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-[13.5px] font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer"
          >
            {isSaving ? (
              <>
                <SpinnerIcon size={14} className="text-white" />
                Saving…
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

