import { useRef, useState } from "react";
import { authApi } from "../../services/api";
import SpinnerIcon from "./SpinnerIcon";

interface AddedUser {
  id: number;
  name: string;
  email: string;
  available: boolean; // true = already existed, false = newly invited
}

interface Props {
  /** Called after a successful upload with the IDs of NEWLY created users */
  onUsersAdded: (newUsers: { id: number; name: string; email: string }[]) => void;
  className?: string;
}

export default function ImportUsersButton({ onUsersAdded, className = "" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [results, setResults] = useState<AddedUser[] | null>(null);
  const [uploadError, setUploadError] = useState("");
  const [showResults, setShowResults] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so the same file can be re-uploaded if needed
    e.target.value = "";

    setUploadError("");
    setResults(null);
    setIsUploading(true);

    try {
      const res = await authApi.addUsers(file);
      if (res.status === "success" && Array.isArray(res.message)) {
        const users: AddedUser[] = res.message.map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          available: u.available,
        }));
        setResults(users);
        setShowResults(true);
        // Only auto-add newly created users (available === false)
        const newUsers = users.filter((u) => !u.available);
        if (newUsers.length > 0) {
          onUsersAdded(newUsers.map((u) => ({ id: u.id, name: u.name, email: u.email })));
        }
      } else {
        setUploadError("Upload failed. Please check the file and try again.");
      }
    } catch (err: any) {
      setUploadError(err.message || "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    setIsDownloading(true);
    try {
      await authApi.generateTemplate();
    } catch (err: any) {
      setUploadError(err.message || "Failed to download template.");
    } finally {
      setIsDownloading(false);
    }
  };

  const newCount = results?.filter((u) => !u.available).length ?? 0;
  const existingCount = results?.filter((u) => u.available).length ?? 0;

  return (
    <>
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex items-center gap-2">
        {/* Download Template button */}
        <button
          type="button"
          onClick={handleDownloadTemplate}
          disabled={isDownloading || isUploading}
          title="Download the Excel template to fill in user details"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold border transition-all duration-150 cursor-pointer disabled:opacity-60"
          style={{
            borderColor: "rgba(16,185,129,0.35)",
            color: "var(--text-secondary)",
            backgroundColor: "transparent",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(16,185,129,0.07)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
          }}
        >
          {isDownloading ? (
            <>
              <SpinnerIcon size={12} className="text-emerald-500" />
              Downloading…
            </>
          ) : (
            <>
              {/* Download icon */}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Template
            </>
          )}
        </button>

        {/* Import button */}
        <button
          type="button"
          onClick={() => { setUploadError(""); inputRef.current?.click(); }}
          disabled={isUploading || isDownloading}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold border transition-all duration-150 cursor-pointer disabled:opacity-60 ${className}`}
          style={{
            borderColor: "rgba(124,58,237,0.35)",
            color: "var(--text-secondary)",
            backgroundColor: "transparent",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "rgba(124,58,237,0.07)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = "transparent";
          }}
        >
          {isUploading ? (
            <>
              <SpinnerIcon size={12} className="text-violet-500" />
              Uploading…
            </>
          ) : (
            <>
              {/* Excel / file icon */}
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="9" y1="13" x2="15" y2="13" />
                <line x1="9" y1="17" x2="15" y2="17" />
              </svg>
              Import .xlsx
            </>
          )}
        </button>
      </div>

      {/* Inline error */}
      {uploadError && (
        <span className="text-[11.5px] text-red-500 font-semibold">{uploadError}</span>
      )}

      {/* Results flyout modal */}
      {showResults && results && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
          onClick={() => setShowResults(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border shadow-2xl flex flex-col max-h-[75vh]"
            style={{ backgroundColor: "var(--bg-card)", borderColor: "rgba(124,58,237,0.2)" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: "rgba(124,58,237,0.12)" }}>
              <div>
                <h3 className="text-[15px] font-bold" style={{ color: "var(--text-primary)" }}>
                  Import Results
                </h3>
                <p className="text-[11.5px] mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {newCount} invited · {existingCount} already existed
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowResults(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                style={{ color: "var(--text-muted)" }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* User list */}
            <div className="overflow-y-auto flex-1 px-5 py-4 flex flex-col gap-2">
              {results.length === 0 ? (
                <p className="text-[13px] text-center py-4" style={{ color: "var(--text-muted)" }}>
                  No users found in the file.
                </p>
              ) : (
                results.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center gap-3 p-3 rounded-xl border"
                    style={{
                      borderColor: u.available
                        ? "rgba(100,100,100,0.12)"
                        : "rgba(124,58,237,0.25)",
                      backgroundColor: u.available
                        ? "var(--bg-base)"
                        : "rgba(124,58,237,0.05)",
                    }}
                  >
                    {/* Avatar circle */}
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[12px] font-bold"
                      style={{
                        backgroundColor: u.available
                          ? "rgba(100,100,100,0.1)"
                          : "rgba(124,58,237,0.15)",
                        color: u.available ? "var(--text-muted)" : "#7c3aed",
                      }}
                    >
                      {u.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                        {u.name}
                      </p>
                      <p className="text-[11px] truncate" style={{ color: "var(--text-muted)" }}>
                        {u.email}
                      </p>
                    </div>

                    {/* Status badge */}
                    {u.available ? (
                      <span className="shrink-0 text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-400">
                        Already exists
                      </span>
                    ) : (
                      <span className="shrink-0 text-[10.5px] font-bold px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-400">
                        ✓ Invited
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t flex justify-end" style={{ borderColor: "rgba(124,58,237,0.12)" }}>
              <button
                type="button"
                onClick={() => setShowResults(false)}
                className="px-5 py-2 rounded-xl text-[13px] font-bold bg-violet-600 hover:bg-violet-700 text-white transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
