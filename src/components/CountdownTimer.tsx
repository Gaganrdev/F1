"use client";

import { useEffect, useState } from "react";

interface CountdownProps {
  sessions: {
    fp1?: string;
    fp2?: string;
    fp3?: string;
    qualifying?: string;
    race?: string;
    sprint?: string;
    sprint_qualifying?: string;
  };
}

function msToTime(ms: number) {
  if (ms <= 0) return null;
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((ms % (1000 * 60)) / 1000);
  return { days, hours, mins, secs };
}

export default function CountdownTimer({ sessions }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState<ReturnType<typeof msToTime>>(null);
  const [nextSessionName, setNextSessionName] = useState<string>("");

  useEffect(() => {
    const sessionOrder: [string, string | undefined][] = [
      ["Practice 1", sessions.fp1],
      ["Practice 2", sessions.fp2],
      ["Practice 3", sessions.fp3],
      ["Sprint Quali", sessions.sprint_qualifying],
      ["Sprint", sessions.sprint],
      ["Qualifying", sessions.qualifying],
      ["Race", sessions.race],
    ];

    function update() {
      const now = Date.now();
      const next = sessionOrder.find(
        ([, date]) => date && new Date(date).getTime() > now,
      );
      if (!next || !next[1]) {
        setTimeLeft(null);
        setNextSessionName("");
        return;
      }
      const [name, date] = next;
      setNextSessionName(name);
      setTimeLeft(msToTime(new Date(date!).getTime() - now));
    }

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [sessions]);

  if (!timeLeft || !nextSessionName) return null;

  return (
    <div className="mt-4 p-4 rounded-xl bg-[#ff1801]/8 dark:bg-[#ff1801]/10 border border-[#ff1801]/20">
      <p className="text-[#ff1801] text-xs font-semibold tracking-widest uppercase mb-2">
        ⏱ Next: {nextSessionName}
      </p>
      <div className="flex gap-3">
        {[
          { label: "D", val: timeLeft.days },
          { label: "H", val: timeLeft.hours },
          { label: "M", val: timeLeft.mins },
          { label: "S", val: timeLeft.secs },
        ].map(({ label, val }) => (
          <div key={label} className="flex flex-col items-center">
            <span className="text-2xl font-black font-mono tabular-nums text-slate-900 dark:text-white leading-none">
              {String(val).padStart(2, "0")}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-white/40 uppercase tracking-wider">
              {label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
