// Configure testcases modal — add/edit form + existing testcases list.
import { SpinnerIcon } from "../ui";
import type { Question, TestCase } from "../../types";

interface TestcaseModalProps {
  activeQuestion: Question;
  tcInput: string;
  onTcInputChange: (v: string) => void;
  tcOutput: string;
  onTcOutputChange: (v: string) => void;
  tcIsSample: boolean;
  onTcIsSampleChange: (v: boolean) => void;
  editingTestCaseId: string | null;
  tcError: string;
  isUpdatingTestcases: boolean;
  onSaveTestCase: (e: React.FormEvent) => Promise<void>;
  onEditTestCase: (tc: TestCase) => void;
  onDeleteTestCase: (tcId: string) => Promise<void>;
  onCancelEdit: () => void;
  onClose: () => void;
}

export default function TestcaseModal({
  activeQuestion,
  tcInput,
  onTcInputChange,
  tcOutput,
  onTcOutputChange,
  tcIsSample,
  onTcIsSampleChange,
  editingTestCaseId,
  tcError,
  isUpdatingTestcases,
  onSaveTestCase,
  onEditTestCase,
  onDeleteTestCase,
  onCancelEdit,
  onClose,
}: TestcaseModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/40 animate-fade-in">
      <div
        className="w-full max-w-[680px] rounded-2xl border cc-border shadow-2xl p-6 relative animate-fade-in-up max-h-[90vh] flex flex-col"
        style={{ backgroundColor: "var(--bg-card)" }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-4 shrink-0">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
              Configure Test Cases
            </h2>
            <span className="text-[12.5px] font-medium" style={{ color: "var(--text-muted)" }}>
              Question: <strong style={{ color: "var(--text-secondary)" }}>{activeQuestion.title}</strong>
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[var(--nav-hover-bg)]"
            style={{ color: "var(--text-secondary)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-grow overflow-y-auto flex flex-col gap-6 pr-1 -mr-2">

          {/* Add/Edit Form */}
          <form
            onSubmit={onSaveTestCase}
            className="rounded-xl border cc-border p-4 flex flex-col gap-3.5"
            style={{ backgroundColor: "var(--bg-subtle)" }}
          >
            <h3 className="text-[13px] font-bold uppercase tracking-wider text-[#2563eb]">
              {editingTestCaseId ? "Modify Testcase" : "Add New Testcase"}
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold" style={{ color: "var(--text-secondary)" }}>Standard Input</label>
                <textarea
                  rows={3}
                  placeholder="Enter inputs here..."
                  value={tcInput}
                  onChange={(e) => onTcInputChange(e.target.value)}
                  className="cc-input w-full px-3 py-2 text-[13px] rounded-lg outline-none border transition-all duration-200 font-mono"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[12px] font-bold" style={{ color: "var(--text-secondary)" }}>Expected Output</label>
                <textarea
                  rows={3}
                  placeholder="Enter expected stdout..."
                  value={tcOutput}
                  onChange={(e) => onTcOutputChange(e.target.value)}
                  className="cc-input w-full px-3 py-2 text-[13px] rounded-lg outline-none border transition-all duration-200 font-mono"
                />
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <label
                className="flex items-center gap-2 text-[13px] font-medium cursor-pointer"
                style={{ color: "var(--text-secondary)" }}
              >
                <input
                  type="checkbox"
                  checked={tcIsSample}
                  onChange={(e) => onTcIsSampleChange(e.target.checked)}
                  className="w-4 h-4 text-[#2563eb] border-[var(--input-border)] rounded focus:ring-blue-500 accent-[#2563eb]"
                />
                <span>Is Sample Test Case (Visible to contestants)</span>
              </label>

              <div className="flex gap-2">
                {editingTestCaseId && (
                  <button
                    type="button"
                    onClick={onCancelEdit}
                    className="px-3.5 py-1.5 rounded-lg border cc-border text-[12.5px] font-semibold hover:bg-[var(--nav-hover-bg)] transition-colors duration-150 cursor-pointer"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Cancel Edit
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isUpdatingTestcases}
                  className="bg-[#2563eb] text-white px-4 py-1.5 rounded-lg text-[12.5px] font-semibold hover:bg-[#1d54d4] transition-colors duration-150 cursor-pointer flex items-center gap-1.5 disabled:opacity-75"
                >
                  {isUpdatingTestcases ? (
                    <SpinnerIcon size={13} className="text-white" />
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  )}
                  {editingTestCaseId ? "Apply Changes" : "Add Testcase"}
                </button>
              </div>
            </div>

            {tcError && (
              <p className="text-[12.5px] text-red-500 animate-shake">{tcError}</p>
            )}
          </form>

          {/* Existing Testcases List */}
          <div className="flex flex-col gap-3">
            <h3 className="text-[13px] font-bold" style={{ color: "var(--text-primary)" }}>
              Current Test Cases ({activeQuestion.testCases?.length || 0})
            </h3>

            <div className="flex flex-col gap-2.5 max-h-[250px] overflow-y-auto pr-1">
              {activeQuestion.testCases && activeQuestion.testCases.length > 0 ? (
                activeQuestion.testCases.map((tc, idx) => (
                  <div
                    key={tc.id}
                    className="p-3 border cc-border rounded-xl flex items-center justify-between gap-4 text-[13px] hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors duration-150"
                    style={{ backgroundColor: "var(--bg-card)" }}
                  >
                    <div className="flex items-start gap-3 flex-grow min-w-0">
                      <span className="w-5 h-5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <div className="flex-grow min-w-0 grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[11px] uppercase font-bold tracking-wider" style={{ color: "var(--text-muted)" }}>Input</span>
                          <pre className="mt-0.5 font-mono text-[12px] bg-neutral-50 dark:bg-neutral-900/60 p-1.5 rounded border border-neutral-100 dark:border-neutral-900/40 truncate max-w-full">{tc.input}</pre>
                        </div>
                        <div>
                          <span className="text-[11px] uppercase font-bold tracking-wider" style={{ color: "var(--text-muted)" }}>Expected Output</span>
                          <pre className="mt-0.5 font-mono text-[12px] bg-neutral-50 dark:bg-neutral-900/60 p-1.5 rounded border border-neutral-100 dark:border-neutral-900/40 truncate max-w-full">{tc.output}</pre>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {tc.isSample && (
                        <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-950/20 text-[#2563eb] text-[10px] font-bold rounded border border-blue-100 dark:border-blue-900/20">
                          Sample
                        </span>
                      )}
                      <button
                        onClick={() => onEditTestCase(tc)}
                        title="Edit Testcase"
                        className="p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors duration-150 cursor-pointer"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onDeleteTestCase(tc.id)}
                        disabled={isUpdatingTestcases}
                        title="Delete Testcase"
                        className="p-1 rounded hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 hover:text-red-700 transition-colors duration-150 cursor-pointer disabled:opacity-50"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18" />
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 border cc-border border-dashed rounded-xl text-center text-[13px]" style={{ color: "var(--text-muted)" }}>
                  No test cases created yet. Add a testcase above.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t cc-border mt-4 shrink-0">
          <button
            onClick={onClose}
            className="bg-[#2563eb] text-white px-5 py-2.5 rounded-lg text-[13.5px] font-semibold hover:bg-[#1d54d4] transition-colors duration-150 cursor-pointer"
          >
            Close Editor
          </button>
        </div>
      </div>
    </div>
  );
}

