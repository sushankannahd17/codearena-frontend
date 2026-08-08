import { useEffect, useRef, useState } from "react";
import { authApi, contestsApi, questionsApi, type CreateContestPayload } from "../../services/api";
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

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateContestModal({ isOpen, onClose, onCreated }: Props) {
  // Form fields
  const [name, setName] = useState("");
  const [minutes, setMinutes] = useState(90);
  const [maxResumeCount, setMaxResumeCount] = useState(3);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedAttenderIDs, setSelectedAttenderIDs] = useState<number[]>([]);
  const [selectedQuestionIDs, setSelectedQuestionIDs] = useState<number[]>([]);

  // Data from backend
  const [questions, setQuestions] = useState<BackendQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [users, setUsers] = useState<BackendUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  // Attender search filter
  const [userSearch, setUserSearch] = useState("");

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const backdropRef = useRef<HTMLDivElement>(null);

  // Load questions and users when modal opens
  useEffect(() => {
    if (!isOpen) return;
    resetForm();

    setLoadingQuestions(true);
    questionsApi
      .getAll()
      .then((res: any) => {
        if (res.status === "success" && Array.isArray(res.message)) {
          setQuestions(
            res.message.map((q: any) => ({
              id: q.id,
              title: q.title,
              description: q.description,
            }))
          );
        }
      })
      .catch(() => setQuestions([]))
      .finally(() => setLoadingQuestions(false));

    setLoadingUsers(true);
    authApi
      .getAllUsers()
      .then((res: any) => {
        if (res.status === "success" && Array.isArray(res.message)) {
          setUsers(
            res.message.map((u: any) => ({
              id: u.id,
              name: u.name,
              email: u.email,
            }))
          );
        }
      })
      .catch(() => setUsers([]))
      .finally(() => setLoadingUsers(false));
  }, [isOpen]);

  function resetForm() {
    setName("");
    setMinutes(90);
    setMaxResumeCount(3);
    setStartDate("");
    setEndDate("");
    setUserSearch("");
    setSelectedAttenderIDs([]);
    setSelectedQuestionIDs([]);
    setError("");
    setSuccess("");
  }

  const handleClose = () => {
    resetForm();
    onClose();
  };

  // ── Attender selection ──────────────────────────────────────────────────────

  const toggleAttender = (id: number) =>
    setSelectedAttenderIDs((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );

  const handleImportedUsers = (newUsers: { id: number; name: string; email: string }[]) => {
    setUsers((prev) => {
      const existingIds = new Set(prev.map((u) => u.id));
      const toAdd = newUsers.filter((u) => !existingIds.has(u.id));
      return [...prev, ...toAdd];
    });
    setSelectedAttenderIDs((prev) => {
      const newIds = newUsers.map((u) => u.id).filter((id) => !prev.includes(id));
      return [...prev, ...newIds];
    });
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  // ── Question selection ─────────────────────────────────────────────────────

  const toggleQuestion = (id: number) =>
    setSelectedQuestionIDs((prev) =>
      prev.includes(id) ? prev.filter((q) => q !== id) : [...prev, id]
    );

  // ── Submit ─────────────────────────────────────────────────────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim()) { setError("Contest name is required."); return; }
    if (selectedQuestionIDs.length === 0) { setError("Select at least one question."); return; }

    const payload: CreateContestPayload = {
      name: name.trim(),
      attenderID: selectedAttenderIDs,
      questionID: selectedQuestionIDs,
      minutes,
      maxResumeCount,
      startDate: startDate
        ? new Date(startDate).toISOString()
        : null,
      endDate: endDate
        ? new Date(endDate).toISOString()
        : null,
    };

    setIsSubmitting(true);
    try {
      const res = await contestsApi.create(payload);
      if (res.status === "success") {
        setSuccess("Contest created successfully!");
        onCreated();
        setTimeout(handleClose, 1200);
      } else {
        setError("Failed to create contest. Try again.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create contest.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={backdropRef}
      onClick={(e) => { if (e.target === backdropRef.current) handleClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="w-full max-w-2xl rounded-3xl border cc-border shadow-2xl flex flex-col max-h-[90vh]"
        style={{ backgroundColor: "var(--bg-card)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b cc-border shrink-0">
          <div>
            <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              Create Contest
            </h2>
            <p className="text-[13px] mt-0.5" style={{ color: "var(--text-muted)" }}>
              Set up a new coding contest with questions and participants.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            style={{ color: "var(--text-muted)" }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 px-7 py-6 flex flex-col gap-6">

          {/* Contest Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-bold" style={{ color: "var(--text-secondary)" }}>
              Contest Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Weekly Test 103"
              className="w-full rounded-xl px-4 py-2.5 text-[14px] border cc-border outline-none focus:border-[#2563eb] transition-colors"
              style={{ backgroundColor: "var(--bg-base)", color: "var(--text-primary)" }}
            />
          </div>

          {/* Duration */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-bold" style={{ color: "var(--text-secondary)" }}>
              Duration (minutes) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={5}
              max={480}
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
              className="w-full rounded-xl px-4 py-2.5 text-[14px] border cc-border outline-none focus:border-[#2563eb] transition-colors"
              style={{ backgroundColor: "var(--bg-base)", color: "var(--text-primary)" }}
            />
          </div>

          {/* Max Resume Count */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-bold" style={{ color: "var(--text-secondary)" }}>
              Max Resume Count <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min={0}
              max={100}
              value={maxResumeCount}
              onChange={(e) => setMaxResumeCount(Number(e.target.value))}
              className="w-full rounded-xl px-4 py-2.5 text-[14px] border cc-border outline-none focus:border-[#2563eb] transition-colors"
              style={{ backgroundColor: "var(--bg-base)", color: "var(--text-primary)" }}
            />
          </div>

          {/* Start / End Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-bold" style={{ color: "var(--text-secondary)" }}>
                Start Date <span className="text-[11px] text-neutral-400">(optional)</span>
              </label>
              <input
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 text-[13.5px] border cc-border outline-none focus:border-[#2563eb] transition-colors"
                style={{ backgroundColor: "var(--bg-base)", color: "var(--text-primary)" }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-bold" style={{ color: "var(--text-secondary)" }}>
                End Date <span className="text-[11px] text-neutral-400">(optional)</span>
              </label>
              <input
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full rounded-xl px-4 py-2.5 text-[13.5px] border cc-border outline-none focus:border-[#2563eb] transition-colors"
                style={{ backgroundColor: "var(--bg-base)", color: "var(--text-primary)" }}
              />
            </div>
          </div>

          {/* Attenders — user list */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[13px] font-bold" style={{ color: "var(--text-secondary)" }}>
                Participants{" "}
                <span className="text-[11px] text-neutral-400">(select users to invite)</span>
                {selectedAttenderIDs.length > 0 && (
                  <span className="ml-2 text-[11px] font-normal text-[#2563eb]">
                    {selectedAttenderIDs.length} selected
                  </span>
                )}
              </label>
              <ImportUsersButton onUsersAdded={handleImportedUsers} />
            </div>

            {loadingUsers ? (
              <div className="flex items-center gap-2 py-4 text-[13px]" style={{ color: "var(--text-muted)" }}>
                <SpinnerIcon size={16} className="text-[#2563eb]" />
                Loading users...
              </div>
            ) : users.length === 0 ? (
              <p className="text-[13px] py-3" style={{ color: "var(--text-muted)" }}>
                No users available.
              </p>
            ) : (
              <>
                {/* Search */}
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search by name or email…"
                  className="w-full rounded-xl px-4 py-2 text-[13px] border cc-border outline-none focus:border-[#2563eb] transition-colors"
                  style={{ backgroundColor: "var(--bg-base)", color: "var(--text-primary)" }}
                />
                <div className="flex flex-col gap-1.5 max-h-[160px] overflow-y-auto pr-1 mt-1">
                  {filteredUsers.length === 0 ? (
                    <p className="text-[12px] text-center py-3" style={{ color: "var(--text-muted)" }}>
                      No users match your search.
                    </p>
                  ) : (
                    filteredUsers.map((u) => {
                      const checked = selectedAttenderIDs.includes(u.id);
                      return (
                        <label
                          key={u.id}
                          className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all duration-150 ${
                            checked
                              ? "border-[#2563eb]/40 bg-blue-50/50 dark:bg-blue-950/20"
                              : "cc-border hover:border-blue-300/50"
                          }`}
                          style={{ backgroundColor: checked ? undefined : "var(--bg-base)" }}
                        >
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleAttender(u.id)}
                            className="accent-[#2563eb] w-4 h-4 shrink-0 cursor-pointer"
                          />
                          <div className="flex flex-col gap-0 min-w-0">
                            <span className="text-[13px] font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                              {u.name}
                            </span>
                            <span className="text-[11.5px] truncate" style={{ color: "var(--text-muted)" }}>
                              {u.email}
                            </span>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              </>
            )}
          </div>

          {/* Questions */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-bold" style={{ color: "var(--text-secondary)" }}>
              Questions <span className="text-red-500">*</span>
              <span className="ml-2 text-[11px] font-normal text-neutral-400">
                ({selectedQuestionIDs.length} selected)
              </span>
            </label>
            {loadingQuestions ? (
              <div className="flex items-center gap-2 py-4 text-[13px]" style={{ color: "var(--text-muted)" }}>
                <SpinnerIcon size={16} className="text-[#2563eb]" />
                Loading questions...
              </div>
            ) : questions.length === 0 ? (
              <p className="text-[13px] py-3" style={{ color: "var(--text-muted)" }}>
                No questions available. Create questions first.
              </p>
            ) : (
              <div className="flex flex-col gap-2 max-h-[180px] overflow-y-auto pr-1">
                {questions.map((q) => {
                  const checked = selectedQuestionIDs.includes(q.id);
                  return (
                    <label
                      key={q.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all duration-150 ${
                        checked
                          ? "border-[#2563eb]/40 bg-blue-50/50 dark:bg-blue-950/20"
                          : "cc-border hover:border-blue-300/50"
                      }`}
                      style={{ backgroundColor: checked ? undefined : "var(--bg-base)" }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleQuestion(q.id)}
                        className="mt-0.5 accent-[#2563eb] w-4 h-4 shrink-0 cursor-pointer"
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
          </div>

          {/* Error / Success */}
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
        </form>

        {/* Footer */}
        <div className="flex gap-3 justify-end px-7 py-5 border-t cc-border shrink-0">
          <button
            type="button"
            onClick={handleClose}
            className="px-5 py-2.5 rounded-xl text-[13.5px] font-bold border cc-border hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
            style={{ color: "var(--text-secondary)" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            form="create-contest-form"
            onClick={handleSubmit as any}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-[#2563eb] hover:bg-[#1d54d4] disabled:opacity-60 text-white text-[13.5px] font-bold transition-all duration-200 flex items-center gap-2 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <SpinnerIcon size={14} className="text-white" />
                Creating...
              </>
            ) : (
              "Create Contest"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

