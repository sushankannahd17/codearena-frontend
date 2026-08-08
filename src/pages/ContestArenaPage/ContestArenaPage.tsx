import { useEffect, useRef, useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CodeMirror from "@uiw/react-codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { githubDark, githubLight } from "@uiw/codemirror-theme-github";
import { dracula } from "@uiw/codemirror-theme-dracula";
import { tokyoNight } from "@uiw/codemirror-theme-tokyo-night";
import { tokyoNightDay } from "@uiw/codemirror-theme-tokyo-night-day";
import { nord } from "@uiw/codemirror-theme-nord";
import { okaidia } from "@uiw/codemirror-theme-okaidia";
import { solarizedDark, solarizedLight } from "@uiw/codemirror-theme-solarized";
import { materialDark, materialLight } from "@uiw/codemirror-theme-material";
import { sublime } from "@uiw/codemirror-theme-sublime";
import { abyss } from "@uiw/codemirror-theme-abyss";
import { androidstudio } from "@uiw/codemirror-theme-androidstudio";
import { atomone } from "@uiw/codemirror-theme-atomone";
import { java } from "@codemirror/lang-java";
import { python } from "@codemirror/lang-python";
import { cpp } from "@codemirror/lang-cpp";
import { javascript } from "@codemirror/lang-javascript";
import { useContestTimer } from "../../hooks/useContestTimer";
import { contestsApi } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Example {
  id: number;
  input: string;
  output: string;
  description?: string;
}

interface ArenaQuestion {
  id: number;
  title: string;
  description: string;
  examples?: Example[];
  tc?: { id: number; input: string; output: string }[];
}

interface ArenaState {
  questions: ArenaQuestion[];
  sessionEnd: string;
  contestName: string;
  contestId?: number | string;
  /** "Ongoing" | "Completed" — from the entercontest API response */
  contestStatus?: string;
  /** Number of times the user has previously navigated away from this contest */
  resumeCount?: number;
}

interface ExecuteResult {
  answer: string;        // "Code Accepted" | "Wrong Answer" | "1 out of 3 are correct" etc.
  expected: string | null;
  input: string | null;
  output: string | null;
}



// ─── Editor Themes ───────────────────────────────────────────────────────────

const EDITOR_THEMES = [
  { label: "VS Code Dark",      value: "vscodeDark",      theme: vscodeDark,        bg: "#1e1e1e", toolbar: "#252526", border: "#333" },
  { label: "GitHub Dark",       value: "githubDark",      theme: githubDark,        bg: "#0d1117", toolbar: "#161b22", border: "#30363d" },
  { label: "GitHub Light",      value: "githubLight",     theme: githubLight,       bg: "#ffffff", toolbar: "#f6f8fa", border: "#d0d7de" },
  { label: "Dracula",           value: "dracula",         theme: dracula,           bg: "#282a36", toolbar: "#21222c", border: "#44475a" },
  { label: "Tokyo Night",       value: "tokyoNight",      theme: tokyoNight,        bg: "#1a1b26", toolbar: "#16161e", border: "#292e42" },
  { label: "Tokyo Night Day",   value: "tokyoNightDay",   theme: tokyoNightDay,     bg: "#e1e2e7", toolbar: "#d5d6db", border: "#c4c8da" },
  { label: "Nord",              value: "nord",            theme: nord,              bg: "#2e3440", toolbar: "#272c36", border: "#3b4252" },
  { label: "Okaidia",           value: "okaidia",         theme: okaidia,           bg: "#272822", toolbar: "#1e1f1c", border: "#3a3a3a" },
  { label: "Solarized Dark",    value: "solarizedDark",   theme: solarizedDark,     bg: "#002b36", toolbar: "#00212b", border: "#073642" },
  { label: "Solarized Light",   value: "solarizedLight",  theme: solarizedLight,    bg: "#fdf6e3", toolbar: "#eee8d5", border: "#ddd6c1" },
  { label: "Material Dark",     value: "materialDark",    theme: materialDark,      bg: "#263238", toolbar: "#1e272c", border: "#37474f" },
  { label: "Material Light",    value: "materialLight",   theme: materialLight,     bg: "#fafafa", toolbar: "#efefef", border: "#ddd" },
  { label: "Sublime",           value: "sublime",         theme: sublime,           bg: "#23241f", toolbar: "#1a1b17", border: "#333" },
  { label: "Abyss",             value: "abyss",           theme: abyss,             bg: "#000c18", toolbar: "#000c18", border: "#1b2d3e" },
  { label: "Android Studio",    value: "androidstudio",   theme: androidstudio,     bg: "#282b2e", toolbar: "#1e2123", border: "#3c3f41" },
  { label: "Atom One Dark",     value: "atomone",         theme: atomone,           bg: "#282c34", toolbar: "#21252b", border: "#383e4a" },
];

const THEME_STORAGE_KEY = "clash-editor-theme";

// ─── Default code templates ───────────────────────────────────────────────────

const LANGUAGES = [
  { label: "Java", value: "java", ext: () => java(), defaultCode: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        // your code here
    }
}` },
  { label: "Python", value: "python", ext: () => python(), defaultCode: `import sys
input = sys.stdin.readline

def solve():
    # your code here
    pass

solve()` },
  { label: "C++", value: "cpp", ext: () => cpp(), defaultCode: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    // your code here
    
    return 0;
}` },
  { label: "JavaScript", value: "javascript", ext: () => javascript(), defaultCode: `const lines = require("fs").readFileSync("/dev/stdin","utf8").split("\\n");
let idx = 0;

// your code here` },
  { label: "C", value: "c", ext: () => cpp(), defaultCode: `#include <stdio.h>
#include <stdlib.h>

int main() {
    // your code here
    
    return 0;
}` },
];

// ─── Center Timer ─────────────────────────────────────────────────────────────

function CenterTimer({ display, isLow, isDone }: { display: string; isLow: boolean; isDone: boolean }) {
  const textColor = isDone ? "#ef4444" : isLow ? "#f59e0b" : "var(--text-primary)";

  const containerStyle: React.CSSProperties = isDone
    ? { borderColor: "#ef4444", backgroundColor: "rgba(239,68,68,0.08)" }
    : isLow
    ? { borderColor: "rgba(245,158,11,0.5)", backgroundColor: "rgba(245,158,11,0.06)" }
    : { borderColor: "var(--border-color)" };

  return (
    <div
      className="flex items-center gap-2 px-5 py-2 rounded-2xl border transition-colors duration-300"
      style={containerStyle}
    >
      {/* Clock Icon */}
      <svg
        width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        style={{ color: isDone ? "#ef4444" : isLow ? "#f59e0b" : "#3b82f6", flexShrink: 0 }}
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="12" x2="12" y2="7" />
        <line x1="12" y1="12" x2="15.5" y2="12" />
      </svg>

      {/* Timer digits */}
      <span
        className="select-none tabular-nums"
        style={{ fontSize: "15px", fontWeight: 700, color: textColor, letterSpacing: "0.02em" }}
      >
        {isDone ? "Contest Ended" : display}
      </span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ContestArenaPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ArenaState | null;

  const questions: ArenaQuestion[] = state?.questions ?? [];
  const sessionEnd: string = state?.sessionEnd ?? "";
  const contestName: string = state?.contestName ?? "Contest";
  const contestId: number | string | undefined = state?.contestId;
  const contestStatus: string = state?.contestStatus ?? "Ongoing";
  const resumeCount: number = state?.resumeCount ?? 0;

  // Track current question
  const [currentIndex, setCurrentIndex] = useState(0);

  // Track solved questions (id set)
  const [solved, setSolved] = useState<Set<number>>(new Set());

  // Code per question per language (key: "questionId-langValue")
  const [codes, setCodes] = useState<Record<string, string>>({});

  // Language selection (shared across questions)
  const [selectedLang, setSelectedLang] = useState(LANGUAGES[0]);

  // Editor theme selection
  const [selectedTheme, setSelectedTheme] = useState(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    return EDITOR_THEMES.find((t) => t.value === saved) ?? EDITOR_THEMES[0];
  });

  // Persist theme preference
  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, selectedTheme.value);
  }, [selectedTheme]);

  // Unsolved panel open/close
  const [showUnsolvedPanel, setShowUnsolvedPanel] = useState(false);

  // Resume-count warning banner (dismiss after user acknowledges)
  const [showResumeWarning, setShowResumeWarning] = useState(resumeCount > 0);

  // Submit state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<ExecuteResult | null>(null);

  // Run (sample test cases) state
  const [isRunning, setIsRunning] = useState(false);
  const [runResult, setRunResult] = useState<ExecuteResult | null>(null);

  // Track whether we've already fetched saved code for a given questionId
  const fetchedQuestionsRef = useRef<Set<number>>(new Set());
  const [isFetchingCode, setIsFetchingCode] = useState(false);

  const panelRef = useRef<HTMLDivElement>(null);

  const timerData = useContestTimer(sessionEnd);

  const { logout } = useAuth();

  // ── Fullscreen exited modal (gentle prompt to return) ────────────────────
  const [showReturnFullscreenModal, setShowReturnFullscreenModal] = useState(false);

  // Listen for fullscreen changes → show "return to fullscreen" modal
  useEffect(() => {
    const handleFullscreenChange = () => {
      const alreadyDone = timerData.isExpired || solved.size >= questions.length;
      if (!document.fullscreenElement && !alreadyDone) {
        setShowReturnFullscreenModal(true);
      } else if (document.fullscreenElement) {
        setShowReturnFullscreenModal(false);
      }
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, [timerData.isExpired, solved, questions.length]);

  // ── Focus-lost violation state (window switch → warning + auto-logout) ────
  const [focusViolated, setFocusViolated] = useState(false);
  const [logoutCountdown, setLogoutCountdown] = useState(10);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const triggerFocusViolation = useCallback(() => {
    // Only trigger once; ignore if contest is already done
    setFocusViolated(true);
    let count = 10;
    setLogoutCountdown(count);
    countdownRef.current = setInterval(() => {
      count -= 1;
      setLogoutCountdown(count);
      if (count <= 0) {
        if (countdownRef.current) clearInterval(countdownRef.current);
        logout();
      }
    }, 1000);
  }, [logout]);

  // Listen for window blur (tab switch, alt-tab, etc.)
  useEffect(() => {
    const handleBlur = () => {
      const alreadyDone = timerData.isExpired || solved.size >= questions.length;
      if (!alreadyDone && !focusViolated) {
        // Increment resumecount on the server (fire-and-forget)
        if (contestId != null) {
          contestsApi.updateResumeCount(Number(contestId)).catch(() => {});
        }
        triggerFocusViolation();
      }
    };
    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("blur", handleBlur);
    };
  }, [timerData.isExpired, focusViolated, triggerFocusViolation, solved, questions.length, contestId]);

  // Exit fullscreen cleanly when the contest timer expires
  useEffect(() => {
    if (timerData.isExpired && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }, [timerData.isExpired]);

  // Cleanup countdown interval on unmount
  useEffect(() => {
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  // Map timer properties to match expected format in UI components
  const timer = {
    display: timerData.formatted,
    isLow: timerData.remainingSeconds <= 300,
    isDone: timerData.isExpired,
    isExpired: timerData.isExpired,
  };

  // Redirect to results page (contest home or dashboard) after a few seconds once expired
  useEffect(() => {
    if (timer.isExpired) {
      const redirectTimeout = setTimeout(() => {
        if (contestId) {
          navigate("/contesthome", { state: { contestId: Number(contestId) } });
        } else {
          navigate("/home");
        }
      }, 4000); // 4 seconds delay
      return () => clearTimeout(redirectTimeout);
    }
  }, [timer.isExpired, navigate, contestId]);

  const currentQuestion = questions[currentIndex] ?? null;

  // Close panel on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowUnsolvedPanel(false);
      }
    };
    if (showUnsolvedPanel) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showUnsolvedPanel]);

  // Detect when every question has been solved
  const allSolved = questions.length > 0 && solved.size >= questions.length;

  // When all questions are solved: exit fullscreen cleanly
  useEffect(() => {
    if (allSolved && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }, [allSolved]);

  // Clear result panels when switching questions or language
  // (must be before any early returns to satisfy the Rules of Hooks)
  useEffect(() => {
    setSubmitResult(null);
    setRunResult(null);
  }, [currentIndex, selectedLang.value]);

  // Fetch previously submitted code for the current question (once per question)
  useEffect(() => {
    if (!currentQuestion || !contestId) return;
    const qId = currentQuestion.id;
    // Skip if already fetched for this question
    if (fetchedQuestionsRef.current.has(qId)) return;
    fetchedQuestionsRef.current.add(qId);

    setIsFetchingCode(true);
    contestsApi
      .fetchSubmittedCode(contestId, qId)
      .then((res) => {
        const savedCode: string = res.message ?? "";
        if (savedCode.trim()) {
          // Pre-fill all language slots that haven't been touched yet
          setCodes((prev) => {
            const updated = { ...prev };
            for (const lang of LANGUAGES) {
              const key = `${qId}-${lang.value}`;
              // Only pre-fill if the user hasn't typed anything for this slot
              if (updated[key] === undefined) {
                updated[key] = savedCode;
              }
            }
            return updated;
          });
        }
      })
      .catch(() => { /* silently ignore — editor will just show the default template */ })
      .finally(() => setIsFetchingCode(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion?.id, contestId]);

  // Show completed screen when the API explicitly returns status "Completed",
  // OR when the user has just solved every question in this session
  if (allSolved || contestStatus === "Completed" || !sessionEnd || questions.length === 0) {
    // Make sure we're not stuck in fullscreen
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    return (
      <main className="flex-grow flex items-center justify-center px-6">
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-color)",
            borderRadius: "24px",
            padding: "48px 40px",
            maxWidth: "440px",
            width: "100%",
            textAlign: "center",
            boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
          }}
        >
          {/* Trophy icon */}
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, rgba(245,158,11,0.15), rgba(251,191,36,0.08))",
              border: "2px solid rgba(245,158,11,0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 24px",
            }}
          >
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6 9H4a2 2 0 00-2 2v1a4 4 0 004 4h1" />
              <path d="M18 9h2a2 2 0 012 2v1a4 4 0 01-4 4h-1" />
              <path d="M8 21h8" />
              <path d="M12 17v4" />
              <path d="M7 4h10l-1 9a5 5 0 01-10 0L7 4z" />
            </svg>
          </div>

          <h2
            style={{
              fontSize: "22px",
              fontWeight: 800,
              color: "var(--text-primary)",
              marginBottom: "10px",
              letterSpacing: "-0.4px",
            }}
          >
            Contest Completed!
          </h2>

          <p
            style={{
              fontSize: "14px",
              color: "var(--text-muted)",
              lineHeight: 1.65,
              marginBottom: "32px",
            }}
          >
            You've already completed this contest. Your submissions have been recorded.
          </p>

          <button
            id="completed-go-home-btn"
            onClick={() => navigate("/home")}
            style={{
              width: "100%",
              padding: "13px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              border: "none",
              color: "white",
              fontSize: "14px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(37,99,235,0.3)",
              transition: "opacity 0.2s ease",
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.9")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            ← Back to Home
          </button>
        </div>
      </main>
    );
  }

  const codeKey = (qId: number) => `${qId}-${selectedLang.value}`;

  const getCode = (qId: number) =>
    codes[codeKey(qId)] ?? selectedLang.defaultCode;

  const setCode = (qId: number, value: string) =>
    setCodes((prev) => ({ ...prev, [codeKey(qId)]: value }));

  const handleLangChange = (langValue: string) => {
    const lang = LANGUAGES.find((l) => l.value === langValue)!;
    setSelectedLang(lang);
  };

  const unsolvedQuestions = questions.filter((q) => !solved.has(q.id));

  const markSolved = (qId: number) => {
    setSolved((prev) => new Set([...prev, qId]));
  };

  const handleRun = async () => {
    if (!currentQuestion || !contestId || isRunning || timer.isExpired) return;
    setIsRunning(true);
    setRunResult(null);
    setSubmitResult(null);
    try {
      const res = await contestsApi.runCode(contestId, {
        questionID: currentQuestion.id,
        language: selectedLang.value,
        code: getCode(currentQuestion.id),
      });
      const msg: ExecuteResult = res.message;
      // Detect Time Limit Exceeded: answer=="Error", input==null, expected==null, output==""
      if (msg.answer === "Error" && msg.input === null && msg.expected === null && msg.output === "") {
        setRunResult({ answer: "Time Limit Exceeded", expected: null, input: null, output: "" });
      } else {
        setRunResult(msg);
      }
    } catch (err: any) {
      setRunResult({
        answer: "Error",
        expected: null,
        input: null,
        output: err?.message ?? "Run failed. Please try again.",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    if (!currentQuestion || !contestId || isSubmitting || timer.isExpired) return;
    setIsSubmitting(true);
    setSubmitResult(null);
    setRunResult(null);
    try {
      const res = await contestsApi.executeCode(contestId, {
        questionID: currentQuestion.id,
        language: selectedLang.value,
        code: getCode(currentQuestion.id),
      });
      const msg: ExecuteResult = res.message;
      // Detect Time Limit Exceeded: answer=="Error", input==null, expected==null, output==""
      if (msg.answer === "Error" && msg.input === null && msg.expected === null && msg.output === "") {
        setSubmitResult({ answer: "Time Limit Exceeded", expected: null, input: null, output: "" });
      } else {
        setSubmitResult(msg);
        if (msg.answer === "Code Accepted") {
          markSolved(currentQuestion.id);
        }
      }
    } catch (err: any) {
      setSubmitResult({
        answer: "Error",
        expected: null,
        input: null,
        output: err?.message ?? "Submission failed. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div
      className="flex flex-col"
      style={{ height: "calc(100vh - 64px)", overflow: "hidden" }}
    >
      {/* ── Return-to-Fullscreen Modal ────────────────────────────────────────── */}
      {showReturnFullscreenModal && !focusViolated && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9998,
            background: "rgba(0,0,0,0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(6px)",
            animation: "modal-fade-in 0.25s ease both",
          }}
        >
          <div
            style={{
              background: "linear-gradient(145deg, rgba(15,20,40,0.98) 0%, rgba(10,15,30,0.99) 100%)",
              border: "1px solid rgba(59,130,246,0.35)",
              borderRadius: "24px",
              padding: "44px 40px",
              maxWidth: "460px",
              width: "90%",
              textAlign: "center",
              boxShadow: "0 0 60px rgba(59,130,246,0.2), 0 20px 60px rgba(0,0,0,0.5)",
              animation: "modal-entrance 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
            }}
          >
            {/* Fullscreen icon */}
            <div
              style={{
                width: "76px",
                height: "76px",
                borderRadius: "50%",
                background: "rgba(59,130,246,0.12)",
                border: "2px solid rgba(59,130,246,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 22px",
                animation: "pulse-blue 2s ease-in-out infinite",
              }}
            >
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3H5a2 2 0 00-2 2v3" />
                <path d="M21 8V5a2 2 0 00-2-2h-3" />
                <path d="M3 16v3a2 2 0 002 2h3" />
                <path d="M16 21h3a2 2 0 002-2v-3" />
              </svg>
            </div>

            <h2 style={{ color: "#e2e8f0", fontSize: "21px", fontWeight: 800, marginBottom: "10px", letterSpacing: "-0.4px" }}>
              Return to Fullscreen
            </h2>

            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "14px", lineHeight: 1.65, marginBottom: "30px" }}>
              You left fullscreen during an active contest. Please return to fullscreen to continue.
              <br />
              <span style={{ color: "rgba(239,68,68,0.8)", fontWeight: 600 }}>Switching windows will result in automatic logout.</span>
            </p>

            <button
              id="return-fullscreen-btn"
              onClick={async () => {
                try {
                  await document.documentElement.requestFullscreen();
                  setShowReturnFullscreenModal(false);
                } catch {
                  // Browser denied — keep modal visible
                }
              }}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                border: "none",
                color: "white",
                fontSize: "15px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 20px rgba(37,99,235,0.4)",
                transition: "opacity 0.2s ease",
                marginBottom: "12px",
              }}
              onMouseEnter={e => (e.currentTarget.style.opacity = "0.88")}
              onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
            >
              ↑ Go Fullscreen
            </button>
          </div>

          <style>{`
            @keyframes modal-fade-in {
              from { opacity: 0; }
              to   { opacity: 1; }
            }
            @keyframes modal-entrance {
              from { opacity: 0; transform: scale(0.88) translateY(16px); }
              to   { opacity: 1; transform: scale(1) translateY(0); }
            }
            @keyframes pulse-blue {
              0%, 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0.4); }
              50%       { box-shadow: 0 0 0 12px rgba(59,130,246,0); }
            }
          `}</style>
        </div>
      )}

      {/* ── Focus-Lost Violation Overlay (window switch → auto-logout) ────────── */}
      {focusViolated && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "linear-gradient(135deg, rgba(10,10,20,0.98) 0%, rgba(30,10,10,0.99) 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(8px)",
          }}
        >
          <div
            style={{
              background: "linear-gradient(145deg, rgba(30,10,10,1) 0%, rgba(20,5,5,1) 100%)",
              border: "1px solid rgba(239,68,68,0.4)",
              borderRadius: "24px",
              padding: "48px",
              maxWidth: "480px",
              width: "90%",
              textAlign: "center",
              boxShadow: "0 0 60px rgba(239,68,68,0.25), 0 0 120px rgba(239,68,68,0.1)",
              animation: "violation-entrance 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
            }}
          >
            {/* Warning Icon */}
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "rgba(239,68,68,0.15)",
                border: "2px solid rgba(239,68,68,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 24px",
                animation: "pulse-red 1.5s ease-in-out infinite",
              }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>

            <h2 style={{ color: "#ef4444", fontSize: "22px", fontWeight: 800, marginBottom: "12px", letterSpacing: "-0.5px" }}>
              Window Switch Detected
            </h2>

            <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "14px", lineHeight: 1.6, marginBottom: "32px" }}>
              You switched away from the contest window. This violates contest rules.
              <br />
              Your session will be terminated and you will be logged out.
            </p>

            {/* Countdown */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
                marginBottom: "28px",
              }}
            >
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "50%",
                  border: "3px solid #ef4444",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "28px",
                  fontWeight: 900,
                  color: "#ef4444",
                  background: "rgba(239,68,68,0.1)",
                }}
              >
                {logoutCountdown}
              </div>
              <span style={{ color: "rgba(255,255,255,0.45)", fontSize: "12px", fontWeight: 600, letterSpacing: "0.5px" }}>
                LOGGING OUT IN {logoutCountdown}s
              </span>
            </div>

            {/* Logout Now button */}
            <button
              id="violation-logout-now-btn"
              onClick={() => {
                if (countdownRef.current) clearInterval(countdownRef.current);
                logout();
              }}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "14px",
                background: "linear-gradient(135deg, #dc2626, #b91c1c)",
                border: "none",
                color: "white",
                fontSize: "15px",
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: "0 4px 20px rgba(239,68,68,0.4)",
                transition: "all 0.2s ease",
              }}
            >
              Logout Now
            </button>
          </div>

          <style>{`
            @keyframes violation-entrance {
              from { opacity: 0; transform: scale(0.85) translateY(20px); }
              to   { opacity: 1; transform: scale(1) translateY(0); }
            }
            @keyframes pulse-red {
              0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.4); }
              50%       { box-shadow: 0 0 0 12px rgba(239,68,68,0); }
            }
          `}</style>
        </div>
      )}

      {/* ── Resume-Count Warning Banner ─────────────────────────────────────── */}
      {showResumeWarning && (
        <div
          style={{
            backgroundColor: "rgba(251,191,36,0.08)",
            borderBottom: "1px solid rgba(251,191,36,0.3)",
          }}
          className="flex items-center justify-between gap-3 px-5 py-2.5 shrink-0"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="shrink-0 text-amber-400">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </span>
            <p className="text-[13px] font-semibold text-amber-400 truncate">
              Warning: You have navigated out of this contest{" "}
              <span className="font-extrabold">{resumeCount} {resumeCount === 1 ? "time" : "times"}</span>.
              {" "}Further violations may result in being locked out.
            </p>
          </div>
          <button
            onClick={() => setShowResumeWarning(false)}
            className="shrink-0 text-amber-400/70 hover:text-amber-400 transition-colors cursor-pointer"
            title="Dismiss"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {/* ── Top Bar ─────────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-5 py-2 border-b cc-border shrink-0 gap-4"
        style={{ backgroundColor: "var(--bg-card)" }}
      >
        {/* Left: contest name + Q counter */}
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-[13px] font-bold truncate" style={{ color: "var(--text-primary)" }}>
            {contestName}
          </span>
        </div>

        {/* Right side controls: Timer & Unsolved Questions */}
        <div className="flex items-center gap-3 shrink-0">
          <CenterTimer display={timer.display} isLow={timer.isLow} isDone={timer.isDone} />

          {/* Unsolved Questions button */}
          <div className="relative flex items-center gap-3" ref={panelRef}>
            <button
              id="unsolved-questions-btn"
              onClick={() => setShowUnsolvedPanel((v) => !v)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border cc-border text-[13px] font-bold transition-all duration-200 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
              style={{ color: "var(--text-secondary)", backgroundColor: "var(--bg-base)" }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              Unsolved Questions
              {unsolvedQuestions.length > 0 && (
                <span className="ml-1 w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-extrabold flex items-center justify-center leading-none">
                  {unsolvedQuestions.length}
                </span>
              )}
            </button>

            {/* Dropdown panel */}
            {showUnsolvedPanel && (
              <div
                className="absolute right-0 top-full mt-2 w-72 rounded-2xl border cc-border shadow-xl z-50 overflow-hidden animate-fade-in"
                style={{ backgroundColor: "var(--bg-card)" }}
              >
                <div className="px-4 py-3 border-b cc-border">
                  <p className="text-[12px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>
                    Unsolved Questions
                  </p>
                </div>
                {unsolvedQuestions.length === 0 ? (
                  <div className="px-4 py-6 text-center">
                    <p className="text-[13px] font-semibold text-emerald-500">🎉 All questions solved!</p>
                  </div>
                ) : (
                  <div className="flex flex-col divide-y divide-[var(--border-color)]">
                    {unsolvedQuestions.map((q, idx) => {
                      return (
                        <button
                          key={q.id}
                          onClick={() => { setCurrentIndex(questions.findIndex(fullQ => fullQ.id === q.id)); setShowUnsolvedPanel(false); }}
                          className="flex items-center gap-3 px-4 py-3 text-left hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors duration-150 cursor-pointer w-full"
                        >
                          <span className="text-[13px] font-semibold truncate" style={{ color: "var(--text-primary)" }}>
                            {q.title}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>


      {/* ── Main Arena Layout ────────────────────────────────────────────────── */}
      {currentQuestion ? (
        <div className="flex flex-1 overflow-hidden">

          {/* Left Panel — Question Description */}
          <div
            className="w-[45%] flex flex-col border-r cc-border overflow-y-auto"
            style={{ backgroundColor: "var(--bg-base)" }}
          >
            {/* Question header */}
            <div className="px-6 pt-5 pb-4 border-b cc-border">
              <div className="flex items-start justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <h2
                    className="text-[18px] font-extrabold leading-tight mt-1"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {currentQuestion.title}
                  </h2>
                </div>
                {/* Nav arrows */}
                <div className="flex items-center gap-1 shrink-0 mt-1">
                  <button
                    onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                    disabled={currentIndex === 0}
                    className="w-7 h-7 rounded-lg border cc-border flex items-center justify-center text-neutral-400 hover:text-blue-500 hover:border-blue-400 transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setCurrentIndex((i) => Math.min(questions.length - 1, i + 1))}
                    disabled={currentIndex === questions.length - 1}
                    className="w-7 h-7 rounded-lg border cc-border flex items-center justify-center text-neutral-400 hover:text-blue-500 hover:border-blue-400 transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Solved badge */}
              {solved.has(currentQuestion.id) && (
                <span className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 px-2.5 py-0.5 rounded-full">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Solved
                </span>
              )}
            </div>

            {/* Problem body */}
            <div className="flex flex-col gap-6 px-6 py-5 text-[14px] leading-relaxed" style={{ color: "var(--text-secondary)" }}>
              {/* Description */}
              <div>
                <p className="whitespace-pre-wrap">{currentQuestion.description}</p>
              </div>

              {/* Examples */}
              {currentQuestion.examples && currentQuestion.examples.length > 0 && (
                <div className="flex flex-col gap-3">
                  <h3 className="text-[12px] font-bold uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
                    Examples
                  </h3>
                  {currentQuestion.examples.map((ex, i) => (
                    <div
                      key={ex.id}
                      className="rounded-xl border cc-border overflow-hidden"
                      style={{ backgroundColor: "var(--bg-card)" }}
                    >
                      <div className="px-4 py-2 border-b cc-border">
                        <span className="text-[11px] font-bold text-blue-500 uppercase tracking-wider">
                          Example {i + 1}
                        </span>
                      </div>
                      <div className="px-4 py-3 flex flex-col gap-2">
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Input</span>
                          <pre className="mt-1 text-[13px] font-mono p-2.5 rounded-lg text-emerald-600 dark:text-emerald-400" style={{ backgroundColor: "var(--bg-base)" }}>{ex.input}</pre>
                        </div>
                        <div>
                          <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Output</span>
                          <pre className="mt-1 text-[13px] font-mono p-2.5 rounded-lg text-blue-600 dark:text-blue-400" style={{ backgroundColor: "var(--bg-base)" }}>{ex.output}</pre>
                        </div>
                        {ex.description && (
                          <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>Explanation</span>
                            <pre className="mt-1 text-[12px] font-mono p-2.5 rounded-lg whitespace-pre-wrap" style={{ backgroundColor: "var(--bg-base)", color: "var(--text-secondary)" }}>{ex.description}</pre>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel — IDE */}
          <div className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: selectedTheme.bg }}>

            {/* IDE Toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-b shrink-0" style={{ borderColor: selectedTheme.border, backgroundColor: selectedTheme.toolbar }}>
              <div className="flex items-center gap-2">
                {/* Language selector */}
                <select
                  value={selectedLang.value}
                  onChange={(e) => handleLangChange(e.target.value)}
                  disabled={timer.isExpired}
                  className="text-[12px] font-semibold px-3 py-1.5 rounded-lg border cursor-pointer outline-none transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: selectedTheme.bg,
                    borderColor: selectedTheme.border,
                    color: selectedTheme.value.includes("Light") || selectedTheme.value.includes("Day") ? "#24292f" : "#d4d4d4",
                  }}
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.value} value={l.value}>{l.label}</option>
                  ))}
                </select>

                {/* Theme selector */}
                <div className="flex items-center gap-1.5">
                  {/* Palette icon */}
                  <svg
                    width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    style={{ color: selectedTheme.value.includes("Light") || selectedTheme.value.includes("Day") ? "#666" : "#888", flexShrink: 0 }}
                  >
                    <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
                    <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
                    <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
                    <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
                  </svg>
                  <select
                    value={selectedTheme.value}
                    onChange={(e) => {
                      const t = EDITOR_THEMES.find((th) => th.value === e.target.value);
                      if (t) setSelectedTheme(t);
                    }}
                    className="text-[12px] font-semibold px-3 py-1.5 rounded-lg border cursor-pointer outline-none transition-colors duration-150"
                    title="Editor theme"
                    style={{
                      backgroundColor: selectedTheme.bg,
                      borderColor: selectedTheme.border,
                      color: selectedTheme.value.includes("Light") || selectedTheme.value.includes("Day") ? "#24292f" : "#d4d4d4",
                    }}
                  >
                    {EDITOR_THEMES.map((t) => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Fetching saved code indicator */}
              {isFetchingCode && (
                <span
                  className="flex items-center gap-1.5 text-[11px] font-semibold"
                  style={{ color: "#7ca8d8" }}
                >
                  <svg
                    width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{ animation: "spin 0.8s linear infinite", transformOrigin: "center" }}
                  >
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  Loading saved code…
                </span>
              )}


              <div className="flex items-center gap-2">
                {/* Solved badge (read-only, shown when accepted) */}
                {solved.has(currentQuestion.id) && (
                  <span
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-bold"
                    style={{ backgroundColor: "#1a3a1a", color: "#4ec94e", border: "1px solid #2d5a2d" }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Accepted
                  </span>
                )}

                {/* Run button */}
                <button
                  id={`run-btn-${currentQuestion.id}`}
                  onClick={handleRun}
                  disabled={isRunning || isSubmitting || timer.isExpired}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: isRunning ? "#1a2e1a" : "#14331a",
                    color: "#86efac",
                    border: "1px solid #16a34a",
                  }}
                >
                  {isRunning ? (
                    <>
                      <svg
                        width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                        style={{ animation: "spin 0.8s linear infinite", transformOrigin: "center" }}
                      >
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                      Running…
                    </>
                  ) : (
                    <>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                      Run
                    </>
                  )}
                </button>

                {/* Submit button */}
                <button
                  id={`submit-btn-${currentQuestion.id}`}
                  onClick={handleSubmit}
                  disabled={isSubmitting || isRunning || timer.isExpired || solved.has(currentQuestion.id)}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[12px] font-bold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: isSubmitting ? "#1d3557" : "#1e40af",
                    color: "#93c5fd",
                    border: "1px solid #2563eb",
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                        style={{ animation: "spin 0.8s linear infinite", transformOrigin: "center" }}
                      >
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                      </svg>
                      Submitting…
                    </>
                  ) : (
                    <>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13" />
                        <polygon points="22 2 15 22 11 13 2 9 22 2" />
                      </svg>
                      Submit
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* CodeMirror Editor — key forces full remount on question or language change */}
            <div className="flex-1 overflow-auto" style={{ backgroundColor: selectedTheme.bg }}>
              <CodeMirror
                key={`${currentQuestion.id}-${selectedLang.value}`}
                value={getCode(currentQuestion.id)}
                height="100%"
                theme={selectedTheme.theme}
                readOnly={timer.isExpired}
                extensions={[selectedLang.ext()]}
                onChange={(val) => setCode(currentQuestion.id, val)}
                basicSetup={{
                  lineNumbers: true,
                  highlightActiveLineGutter: true,
                  highlightSpecialChars: true,
                  foldGutter: true,
                  drawSelection: true,
                  dropCursor: true,
                  allowMultipleSelections: true,
                  indentOnInput: true,
                  syntaxHighlighting: true,
                  bracketMatching: true,
                  closeBrackets: true,
                  autocompletion: true,
                  rectangularSelection: true,
                  crosshairCursor: false,
                  highlightActiveLine: true,
                  highlightSelectionMatches: true,
                  closeBracketsKeymap: true,
                  defaultKeymap: true,
                  searchKeymap: true,
                  historyKeymap: true,
                  foldKeymap: true,
                  completionKeymap: true,
                  lintKeymap: true,
                  tabSize: 4,
                }}
                style={{
                  fontSize: "14px",
                  fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                  height: "100%",
                }}
              />
            </div>

            {/* Run Result Panel */}
            {runResult && (
              <div
                className="shrink-0 px-4 py-3 border-t text-[13px] font-mono animate-fade-in"
                style={{
                  borderColor: "#333",
                  backgroundColor:
                    runResult.answer === "Sample Test Cases are passed successfully"
                      ? "#0d2b1f"
                      : runResult.answer === "Time Limit Exceeded"
                      ? "#2b1a00"
                      : runResult.input !== null
                      ? "#2b1e0d"
                      : "#2b0d0d",
                }}
              >
                {/* Header row */}
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="flex items-center gap-2 font-bold text-[13px]"
                    style={{
                      color:
                        runResult.answer === "Sample Test Cases are passed successfully"
                          ? "#4ade80"
                          : runResult.answer === "Time Limit Exceeded"
                          ? "#fb923c"
                          : runResult.input !== null
                          ? "#fbbf24"
                          : "#f87171",
                    }}
                  >
                    {/* Icon */}
                    {runResult.answer === "Sample Test Cases are passed successfully" ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : runResult.answer === "Time Limit Exceeded" ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                      </svg>
                    ) : runResult.input !== null ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                    ) : (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                      </svg>
                    )}
                    <span className="text-[10px] uppercase tracking-widest font-semibold opacity-60 mr-1" style={{ color: "#86efac" }}>Run</span>
                    {runResult.answer}
                  </span>
                  <button
                    onClick={() => setRunResult(null)}
                    className="text-[11px] font-semibold opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
                    style={{ color: "#aaa" }}
                  >
                    ✕ Dismiss
                  </button>
                </div>

                {/* Wrong Answer details */}
                {runResult.input !== null && (
                  <div className="flex flex-col gap-1.5 mt-1">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "#777" }}>Input</span>
                      <pre className="mt-0.5 px-2.5 py-1.5 rounded-md text-[12px] whitespace-pre-wrap" style={{ backgroundColor: "#111", color: "#a3e635" }}>{runResult.input}</pre>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "#777" }}>Your Output</span>
                        <pre className="mt-0.5 px-2.5 py-1.5 rounded-md text-[12px] whitespace-pre-wrap" style={{ backgroundColor: "#111", color: "#f87171" }}>{runResult.output}</pre>
                      </div>
                      <div className="flex-1">
                        <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "#777" }}>Expected</span>
                        <pre className="mt-0.5 px-2.5 py-1.5 rounded-md text-[12px] whitespace-pre-wrap" style={{ backgroundColor: "#111", color: "#4ade80" }}>{runResult.expected}</pre>
                      </div>
                    </div>
                  </div>
                )}

                {/* Runtime / Compile / Network Error */}
                {runResult.input === null && runResult.output && (
                  <div className="mt-1">
                    <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "#777" }}>Error Output</span>
                    <pre className="mt-0.5 px-2.5 py-2 rounded-md text-[12px] whitespace-pre-wrap overflow-auto max-h-48" style={{ backgroundColor: "#111", color: "#f87171" }}>
                      {runResult.output}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* Submit Result Panel */}
            {submitResult && (
              <div
                className="shrink-0 px-4 py-3 border-t text-[13px] font-mono animate-fade-in"
                style={{
                  borderColor: "#333",
                  backgroundColor:
                    submitResult.answer === "Code Accepted"
                      ? "#0d2b1f"
                      : submitResult.answer === "Time Limit Exceeded"
                      ? "#2b1a00"
                      : submitResult.input !== null
                      ? "#2b1e0d"
                      : "#2b0d0d",
                }}
              >
                {/* Header row */}
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="flex items-center gap-2 font-bold text-[13px]"
                    style={{
                      color:
                        submitResult.answer === "Code Accepted"
                          ? "#4ade80"
                          : submitResult.answer === "Time Limit Exceeded"
                          ? "#fb923c"
                          : submitResult.input !== null
                          ? "#fbbf24"
                          : "#f87171",
                    }}
                  >
                    {submitResult.answer === "Code Accepted" ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : submitResult.answer === "Time Limit Exceeded" ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                      </svg>
                    ) : submitResult.input !== null ? (
                      // Wrong Answer → warning triangle
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                    ) : (
                      // Runtime Error / Compile Error → circle X
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="15" y1="9" x2="9" y2="15" />
                        <line x1="9" y1="9" x2="15" y2="15" />
                      </svg>
                    )}
                    {submitResult.answer}
                  </span>
                  <button
                    onClick={() => setSubmitResult(null)}
                    className="text-[11px] font-semibold opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
                    style={{ color: "#aaa" }}
                  >
                    ✕ Dismiss
                  </button>
                </div>

                {/* Wrong Answer details */}
                {submitResult.input !== null && (
                  <div className="flex flex-col gap-1.5 mt-1">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "#777" }}>Input</span>
                      <pre className="mt-0.5 px-2.5 py-1.5 rounded-md text-[12px] whitespace-pre-wrap" style={{ backgroundColor: "#111", color: "#a3e635" }}>{submitResult.input}</pre>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "#777" }}>Your Output</span>
                        <pre className="mt-0.5 px-2.5 py-1.5 rounded-md text-[12px] whitespace-pre-wrap" style={{ backgroundColor: "#111", color: "#f87171" }}>{submitResult.output}</pre>
                      </div>
                      <div className="flex-1">
                        <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "#777" }}>Expected</span>
                        <pre className="mt-0.5 px-2.5 py-1.5 rounded-md text-[12px] whitespace-pre-wrap" style={{ backgroundColor: "#111", color: "#4ade80" }}>{submitResult.expected}</pre>
                      </div>
                    </div>
                  </div>
                )}

                {/* Runtime / Compile / Network Error — show output trace */}
                {submitResult.input === null && submitResult.output && (
                  <div className="mt-1">
                    <span className="text-[10px] uppercase tracking-wider font-bold" style={{ color: "#777" }}>Error Output</span>
                    <pre className="mt-0.5 px-2.5 py-2 rounded-md text-[12px] whitespace-pre-wrap overflow-auto max-h-48" style={{ backgroundColor: "#111", color: "#f87171" }}>
                      {submitResult.output}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-[14px]" style={{ color: "var(--text-muted)" }}>No questions found.</p>
        </div>
      )}
    </div>
  );
}
