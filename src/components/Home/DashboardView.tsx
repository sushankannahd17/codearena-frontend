import { useNavigate } from "react-router-dom";
import AvailableContests from "./AvailableContests";

interface DashboardViewProps {
  name: string;
  onGoToQuestions: () => void;
}

export default function DashboardView({ name, onGoToQuestions }: DashboardViewProps) {
  const navigate = useNavigate();
  return (
    <main className="flex-grow max-w-6xl w-full mx-auto px-6 py-12 flex flex-col gap-10">

      {/* Welcome Hero Banner */}
      <div
        className="w-full rounded-3xl p-8 md:p-12 relative overflow-hidden flex flex-col justify-center border cc-border shadow-md"
        style={{
          background: "linear-gradient(135deg, rgba(37,99,235,0.08) 0%, rgba(59,130,246,0.03) 100%)",
          backgroundColor: "var(--bg-card)",
        }}
      >
        {/* Glowing background accents */}
        <div className="absolute right-0 top-0 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl -z-10 translate-x-12 -translate-y-12" />
        <div className="absolute left-1/3 bottom-0 w-64 h-64 rounded-full bg-indigo-500/5 blur-3xl -z-10 translate-y-12" />

        <div className="max-w-2xl flex flex-col gap-3">
          <h1
            className="text-3xl md:text-5xl font-extrabold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            Code <span className="text-[#2563eb]">Arena</span> Dashboard
          </h1>
          <p
            className="text-[15px] md:text-[17px] leading-relaxed mt-2"
            style={{ color: "var(--text-secondary)" }}
          >
            Welcome back, <strong style={{ color: "var(--text-primary)" }}>{name}</strong>! Prepare
            your questions, configure contests, or challenge participants in real time.
          </p>
        </div>
      </div>

      {/* Action Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Manage Questions card */}
        <button
          id="dashboard-manage-questions-btn"
          onClick={onGoToQuestions}
          className="group text-left rounded-2xl p-6 border cc-border hover:border-blue-500/40 transition-all duration-300 shadow-sm cursor-pointer hover:shadow-lg hover:-translate-y-1 flex flex-col justify-between h-[230px]"
          style={{ backgroundColor: "var(--bg-card)" }}
        >
          <div className="flex flex-col gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/45 text-[#2563eb] flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-[#2563eb] group-hover:text-white shadow-inner">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
            </div>
            <div>
              <h3
                className="text-lg font-bold group-hover:text-[#2563eb] transition-colors duration-200"
                style={{ color: "var(--text-primary)" }}
              >
                Manage Questions
              </h3>
              <p className="text-[13px] leading-relaxed mt-1" style={{ color: "var(--text-secondary)" }}>
                Create, modify, delete questions, and manage testcases for your coding contests.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[13px] font-bold text-[#2563eb] mt-4">
            Configure Questions
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transform group-hover:translate-x-1 transition-transform duration-200">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </div>
        </button>

        {/* Manage Contests */}
        <button
          id="dashboard-manage-contests-btn"
          onClick={() => navigate("/manage-contests")}
          className="group text-left rounded-2xl p-6 border cc-border hover:border-violet-500/40 transition-all duration-300 shadow-sm cursor-pointer hover:shadow-lg hover:-translate-y-1 flex flex-col justify-between h-[230px]"
          style={{ backgroundColor: "var(--bg-card)" }}
        >
          <div className="flex flex-col gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-violet-600 group-hover:text-white shadow-inner">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </div>
            <div>
              <h3
                className="text-lg font-bold group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors duration-200"
                style={{ color: "var(--text-primary)" }}
              >
                Manage Contests
              </h3>
              <p className="text-[13px] leading-relaxed mt-1" style={{ color: "var(--text-secondary)" }}>
                Create, configure, and manage your contests — set timing, rules, and invite participants.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[13px] font-bold text-violet-600 dark:text-violet-400 mt-4">
            Manage Contests
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transform group-hover:translate-x-1 transition-transform duration-200">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </div>
        </button>

      </div>

      {/* Available Contests Section */}
      <AvailableContests />
    </main>
  );
}

