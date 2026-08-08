import { useEffect, useState } from "react";

export interface TimerData {
  remainingSeconds: number;
  formatted: string;
  isExpired: boolean;
}

export function useContestTimer(sessionEnd: string): TimerData {
  const calculateRemaining = (): TimerData => {
    if (!sessionEnd) {
      return { remainingSeconds: 0, formatted: "00:00:00", isExpired: true };
    }

    const endMs = new Date(sessionEnd).getTime();
    if (isNaN(endMs)) {
      return { remainingSeconds: 0, formatted: "00:00:00", isExpired: true };
    }

    const nowMs = Date.now();
    const diffSeconds = Math.max(0, Math.floor((endMs - nowMs) / 1000));

    const hours = Math.floor(diffSeconds / 3600);
    const mins = Math.floor((diffSeconds % 3600) / 60);
    const secs = diffSeconds % 60;

    const pad = (n: number) => String(n).padStart(2, "0");
    const formatted = `${pad(hours)}:${pad(mins)}:${pad(secs)}`;
    const isExpired = diffSeconds <= 0;

    return {
      remainingSeconds: diffSeconds,
      formatted,
      isExpired,
    };
  };

  const [timerData, setTimerData] = useState<TimerData>(calculateRemaining);

  useEffect(() => {
    // Sync immediately on sessionEnd change or mount
    setTimerData(calculateRemaining());

    const intervalId = setInterval(() => {
      setTimerData(calculateRemaining());
    }, 1000);

    return () => clearInterval(intervalId);
  }, [sessionEnd]);

  return timerData;
}
