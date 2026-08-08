// Add / Edit Question modal with scrollable form body.
import { SpinnerIcon } from "../ui";
import type { ExampleIOPayload, TestCasePayload } from "../../services/api";

interface QuestionModalProps {
  modalMode: "add" | "edit";
  formTitle: string;
  onTitleChange: (v: string) => void;
  formDesc: string;
  onDescChange: (v: string) => void;
  formRunTime: number;
  onRunTimeChange: (v: number) => void;
  formError: string;
  isSubmittingQuestion: boolean;
  formExamples: ExampleIOPayload[];
  setFormExamples: React.Dispatch<React.SetStateAction<ExampleIOPayload[]>>;
  formTestcases: TestCasePayload[];
  setFormTestcases: React.Dispatch<React.SetStateAction<TestCasePayload[]>>;
  onSave: (e: React.FormEvent) => Promise<void>;
  onClose: () => void;
}

export default function QuestionModal({
  modalMode,
  formTitle,
  onTitleChange,
  formDesc,
  onDescChange,
  formRunTime,
  onRunTimeChange,
  formError,
  isSubmittingQuestion,
  formExamples,
  setFormExamples,
  formTestcases,
  setFormTestcases,
  onSave,
  onClose,
}: QuestionModalProps) {


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/40 animate-fade-in">
      <div
        className="w-full max-w-[680px] rounded-2xl border cc-border shadow-2xl relative animate-fade-in-up flex flex-col max-h-[92vh]"
        style={{ backgroundColor: "var(--bg-card)" }}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 pt-6 pb-4 border-b cc-border shrink-0">
          <h2 className="text-xl font-bold" style={{ color: "var(--text-primary)" }}>
            {modalMode === "add" ? "Create Question" : "Edit Question"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[var(--nav-hover-bg)] cursor-pointer"
            style={{ color: "var(--text-secondary)" }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={onSave} className="flex flex-col overflow-y-auto flex-grow">
          <div className="flex flex-col gap-5 px-6 py-5">


            {/* ── Section 1: Basic Info ── */}
            <div className="flex flex-col gap-4">
              <h3 className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                Basic Information
              </h3>

              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-semibold" style={{ color: "var(--text-secondary)" }}>Question Title</label>
                <input
                  type="text"
                  placeholder="e.g., Reverse String"
                  value={formTitle}
                  onChange={(e) => onTitleChange(e.target.value)}
                  className="cc-input w-full px-3.5 py-2 text-[14px] rounded-lg outline-none border transition-all duration-200"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-semibold" style={{ color: "var(--text-secondary)" }}>Problem Description</label>
                <textarea
                  rows={3}
                  placeholder="Describe the problem, constraints, input/output format..."
                  value={formDesc}
                  onChange={(e) => onDescChange(e.target.value)}
                  className="cc-input w-full px-3.5 py-2 text-[14px] rounded-lg outline-none border transition-all duration-200 font-sans"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[13px] font-semibold" style={{ color: "var(--text-secondary)" }}>Run Time (ms)</label>
                <input type="number" step="100" min="100" max="60000" value={formRunTime} onChange={(e) => onRunTimeChange(parseInt(e.target.value) || 0)} className="cc-input w-full px-3 py-2 text-[13.5px] rounded-lg outline-none border transition-all duration-200" />
              </div>
            </div>

            {/* ── Section 2: Sample Examples ── */}
            {modalMode === "add" && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Sample Examples (examplesIO)</h3>
                  <button
                    type="button"
                    onClick={() => setFormExamples((prev) => [...prev, { input: "", output: "", description: "" }])}
                    className="flex items-center gap-1 text-[12px] font-semibold text-[#2563eb] hover:underline cursor-pointer"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    Add Example
                  </button>
                </div>
                {formExamples.length === 0 ? (
                  <div className="border cc-border border-dashed rounded-xl p-4 text-center text-[12.5px]" style={{ color: "var(--text-muted)" }}>
                    No sample examples yet. Click &quot;Add Example&quot; to add one.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {formExamples.map((ex, idx) => (
                      <div key={idx} className="rounded-xl border cc-border p-3.5 flex flex-col gap-2.5" style={{ backgroundColor: "var(--bg-subtle)" }}>
                        <div className="flex justify-between items-center">
                          <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Example {idx + 1}</span>
                          <button type="button" onClick={() => setFormExamples((prev) => prev.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700 dark:hover:text-red-400 cursor-pointer p-0.5">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="flex flex-col gap-1">
                            <label className="text-[11.5px] font-bold" style={{ color: "var(--text-muted)" }}>Input</label>
                            <textarea rows={2} placeholder="Input value..." value={ex.input} onChange={(e) => setFormExamples((prev) => prev.map((item, i) => i === idx ? { ...item, input: e.target.value } : item))} className="cc-input w-full px-2.5 py-1.5 text-[12.5px] rounded-lg outline-none border font-mono transition-all duration-200" />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[11.5px] font-bold" style={{ color: "var(--text-muted)" }}>Output</label>
                            <textarea rows={2} placeholder="Expected output..." value={ex.output} onChange={(e) => setFormExamples((prev) => prev.map((item, i) => i === idx ? { ...item, output: e.target.value } : item))} className="cc-input w-full px-2.5 py-1.5 text-[12.5px] rounded-lg outline-none border font-mono transition-all duration-200" />
                          </div>
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-[11.5px] font-bold" style={{ color: "var(--text-muted)" }}>Description (optional)</label>
                          <input type="text" placeholder="Brief explanation of this example..." value={ex.description} onChange={(e) => setFormExamples((prev) => prev.map((item, i) => i === idx ? { ...item, description: e.target.value } : item))} className="cc-input w-full px-2.5 py-1.5 text-[12.5px] rounded-lg outline-none border transition-all duration-200" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Section 3: Test Cases ── */}
            {modalMode === "add" && (
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-[11px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>Test Cases</h3>
                  <button
                    type="button"
                    onClick={() => setFormTestcases((prev) => [...prev, { input: "", output: "" }])}
                    className="flex items-center gap-1 text-[12px] font-semibold text-[#2563eb] hover:underline cursor-pointer"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
                    Add Test Case
                  </button>
                </div>
                {formTestcases.length === 0 ? (
                  <div className="border cc-border border-dashed rounded-xl p-4 text-center text-[12.5px]" style={{ color: "var(--text-muted)" }}>
                    No test cases yet. Click &quot;Add Test Case&quot; to add one.
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    {formTestcases.map((tc, idx) => (
                      <div key={idx} className="rounded-xl border cc-border p-3.5 flex flex-col gap-2.5" style={{ backgroundColor: "var(--bg-subtle)" }}>
                        <div className="flex justify-between items-center">
                          <span className="text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--text-secondary)" }}>Test Case {idx + 1}</span>
                          <button type="button" onClick={() => setFormTestcases((prev) => prev.filter((_, i) => i !== idx))} className="text-red-500 hover:text-red-700 dark:hover:text-red-400 cursor-pointer p-0.5">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-2.5">
                          <div className="flex flex-col gap-1">
                            <label className="text-[11.5px] font-bold" style={{ color: "var(--text-muted)" }}>Input</label>
                            <textarea rows={2} placeholder="Standard input..." value={tc.input} onChange={(e) => setFormTestcases((prev) => prev.map((item, i) => i === idx ? { ...item, input: e.target.value } : item))} className="cc-input w-full px-2.5 py-1.5 text-[12.5px] rounded-lg outline-none border font-mono transition-all duration-200" />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[11.5px] font-bold" style={{ color: "var(--text-muted)" }}>Output</label>
                            <textarea rows={2} placeholder="Expected output..." value={tc.output} onChange={(e) => setFormTestcases((prev) => prev.map((item, i) => i === idx ? { ...item, output: e.target.value } : item))} className="cc-input w-full px-2.5 py-1.5 text-[12.5px] rounded-lg outline-none border font-mono transition-all duration-200" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {formError && (
              <p className="text-[13px] text-red-500 animate-shake">{formError}</p>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-6 py-4 border-t cc-border shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border cc-border text-[13.5px] font-semibold hover:bg-[var(--nav-hover-bg)] transition-colors duration-150 cursor-pointer"
              style={{ color: "var(--text-secondary)" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmittingQuestion}
              className="bg-[#2563eb] text-white px-5 py-2 rounded-lg text-[13.5px] font-semibold hover:bg-[#1d54d4] transition-colors duration-150 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              {isSubmittingQuestion && <SpinnerIcon size={14} className="text-white" />}
              {modalMode === "add"
                ? (isSubmittingQuestion ? "Creating..." : "Create Question")
                : (isSubmittingQuestion ? "Saving..." : "Save Changes")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

