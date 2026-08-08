// Questions management view — breadcrumb, header, search/filter, table.
import type { Question } from "../../types";

interface QuestionsViewProps {
  filteredQuestions: Question[];
  isLoadingQuestions: boolean;
  fetchError: string;
  searchQuery: string;
  onSearchChange: (v: string) => void;
  onBackToDashboard: () => void;
  onAddQuestion: () => void;
  onEditQuestion: (q: Question) => void;
  onDeleteQuestion: (id: string) => void;
  onManageTestcases: (id: string) => void;
}

export default function QuestionsView({
  filteredQuestions,
  isLoadingQuestions,
  fetchError,
  searchQuery,
  onSearchChange,
  onBackToDashboard,
  onAddQuestion,
  onEditQuestion,
  onDeleteQuestion,
  onManageTestcases,
}: QuestionsViewProps) {
  return (
    <main className="flex-grow max-w-6xl w-full mx-auto px-6 py-8 flex flex-col gap-6 animate-fade-in">

      {/* Header / Breadcrumbs */}
      <div className="flex flex-col gap-2.5">
        <div className="flex items-center gap-2 text-[13px]" style={{ color: "var(--text-muted)" }}>
          <button
            onClick={onBackToDashboard}
            className="hover:text-blue-500 transition-colors duration-150 cursor-pointer"
          >
            Dashboard
          </button>
          <span>/</span>
          <span className="font-semibold text-neutral-700 dark:text-neutral-300">Manage Questions</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToDashboard}
              title="Back to Dashboard"
              className="p-2 rounded-lg border cc-border hover:bg-[var(--nav-hover-bg)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-all duration-200 cursor-pointer"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
            <h1 className="text-2xl sm:text-3xl font-extrabold" style={{ color: "var(--text-primary)" }}>
              Questions Manager
            </h1>
          </div>

          <button
            id="add-question-btn"
            onClick={onAddQuestion}
            className="flex items-center justify-center gap-2 bg-[#2563eb] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#1d54d4] transition-all duration-200 shadow-md shadow-[#2563eb]/15 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Question
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div
        className="rounded-2xl border cc-border shadow-sm overflow-hidden"
        style={{ backgroundColor: "var(--bg-card)" }}
      >
        {/* Filters Row */}
        <div
          className="p-4 border-b cc-border flex flex-col sm:flex-row gap-4 items-center justify-between"
          style={{ backgroundColor: "var(--bg-subtle)" }}
        >
          {/* Search */}
          <div className="relative w-full sm:max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--text-muted)" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="cc-input w-full pl-9 pr-4 py-2 text-[13.5px] rounded-lg outline-none border transition-all duration-200"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr
                className="border-b cc-border text-[12px] font-bold uppercase tracking-wider"
                style={{ color: "var(--text-secondary)", backgroundColor: "var(--bg-subtle)" }}
              >
                <th className="px-6 py-3.5">Title</th>
                <th className="px-6 py-3.5">Run Time</th>
                <th className="px-6 py-3.5">Testcases</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y cc-border">
              {isLoadingQuestions ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-[14px]" style={{ color: "var(--text-muted)" }}>
                    <div className="flex justify-center items-center gap-2">
                      <svg className="animate-spin text-[#2563eb]" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                      </svg>
                      <span>Loading questions from server...</span>
                    </div>
                  </td>
                </tr>
              ) : fetchError ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-[14px] text-red-500 font-semibold">
                    {fetchError}
                  </td>
                </tr>
              ) : filteredQuestions.length > 0 ? (
                filteredQuestions.map((q) => (
                  <tr
                    key={q.id}
                    className="hover:bg-[rgba(37,99,235,0.015)] transition-colors duration-150 text-[14px]"
                  >
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-neutral-800 dark:text-neutral-200">{q.title}</span>
                        <span className="text-[12.5px] line-clamp-1 max-w-[320px]" style={{ color: "var(--text-muted)" }}>
                          {q.description}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[13px] font-semibold" style={{ color: "var(--text-secondary)" }}>
                        {q.runTime} ms
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-neutral-800 dark:text-neutral-200">{q.testCases?.length || 0}</span>
                        <span className="text-[12.5px]" style={{ color: "var(--text-muted)" }}>
                          {(q.testCases?.length || 0) === 1 ? "testcase" : "testcases"}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* Manage Testcases */}
                        <button
                          onClick={() => onManageTestcases(q.id)}
                          title="Modify Testcases"
                          className="p-1.5 rounded-lg border cc-border hover:bg-blue-50 dark:hover:bg-blue-950/20 text-[#2563eb] transition-all duration-150 cursor-pointer"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <line x1="9" y1="9" x2="15" y2="9" />
                            <line x1="9" y1="13" x2="15" y2="13" />
                            <line x1="9" y1="17" x2="13" y2="17" />
                          </svg>
                        </button>

                        {/* Edit Question */}
                        <button
                          onClick={() => onEditQuestion(q)}
                          title="Modify Question"
                          className="p-1.5 rounded-lg border cc-border hover:bg-amber-50 dark:hover:bg-amber-950/20 text-amber-600 dark:text-amber-500 transition-all duration-150 cursor-pointer"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z" />
                          </svg>
                        </button>

                        {/* Delete Question */}
                        <button
                          onClick={() => onDeleteQuestion(q.id)}
                          title="Delete Question"
                          className="p-1.5 rounded-lg border cc-border hover:bg-red-50 dark:hover:bg-red-950/20 text-red-600 dark:text-red-500 transition-all duration-150 cursor-pointer"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-[14.5px]" style={{ color: "var(--text-muted)" }}>
                    No questions found matching the criteria. Click &quot;Add Question&quot; to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

