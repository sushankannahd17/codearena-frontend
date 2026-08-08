// Delete confirmation modal.

interface DeleteModalProps {
  isDeletingQuestion: boolean;
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

export default function DeleteModal({
  isDeletingQuestion,
  onConfirm,
  onClose,
}: DeleteModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm bg-black/40 animate-fade-in">
      <div
        className="w-full max-w-[400px] rounded-2xl border cc-border shadow-2xl p-6 relative animate-fade-in-up"
        style={{ backgroundColor: "var(--bg-card)" }}
      >
        <div className="flex items-center gap-3 text-red-600 dark:text-red-500 mb-3">
          <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <h2 className="text-lg font-bold">Delete Question?</h2>
        </div>

        <p className="text-[13.5px] leading-relaxed mb-6" style={{ color: "var(--text-secondary)" }}>
          Are you sure you want to delete this question? This action cannot be undone and all associated test cases will be removed permanently.
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border cc-border text-[13px] font-semibold hover:bg-[var(--nav-hover-bg)] transition-colors duration-150 cursor-pointer"
            style={{ color: "var(--text-secondary)" }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeletingQuestion}
            className="bg-red-600 text-white px-4 py-2 rounded-lg text-[13px] font-semibold hover:bg-red-700 transition-colors duration-150 cursor-pointer disabled:opacity-75"
          >
            {isDeletingQuestion ? "Deleting..." : "Yes, Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}

