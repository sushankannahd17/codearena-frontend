import { SpinnerIcon } from "../../components/ui";

interface DeleteConfirmProps {
  contestName: string;
  isDeleting: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export default function DeleteConfirmModal({ contestName, isDeleting, onConfirm, onClose }: DeleteConfirmProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.currentTarget === e.target) onClose(); }}
    >
      <div
        className="w-full max-w-sm rounded-2xl border cc-border shadow-2xl p-6 flex flex-col gap-5"
        style={{ backgroundColor: "var(--bg-card)" }}
      >
        <div className="flex flex-col gap-2">
          <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/20 text-red-500 flex items-center justify-center mx-auto">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
            </svg>
          </div>
          <h3 className="text-base font-bold text-center" style={{ color: "var(--text-primary)" }}>
            Delete Contest?
          </h3>
          <p className="text-[13px] text-center" style={{ color: "var(--text-secondary)" }}>
            Are you sure you want to delete{" "}
            <span className="font-bold" style={{ color: "var(--text-primary)" }}>{contestName}</span>
            ? This action cannot be undone.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 rounded-xl text-[13.5px] font-bold border cc-border hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-50"
            style={{ color: "var(--text-secondary)" }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 disabled:opacity-60 text-white text-[13.5px] font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
          >
            {isDeleting ? (
              <>
                <SpinnerIcon size={13} className="text-white" />
                Deleting…
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
