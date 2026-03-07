"use client";

import { Calendar, MapPin } from "lucide-react";
import { useEffect, useState } from "react";
import CountdownTimer from "./CountdownTimer";

type SessionData = {
  name: string;
  country: string;
  location: string;
  date: string;
  sessions: {
    fp1?: string;
    fp2?: string;
    fp3?: string;
    qualifying?: string;
    race?: string;
    sprint?: string;
    sprint_qualifying?: string;
  };
};

const fallbackData: SessionData = {
  name: "Loading...",
  country: "...",
  location: "...",
  date: "...",
  sessions: {},
};

function isSessionPast(dateStr?: string): boolean {
  if (!dateStr) return true;
  return new Date(dateStr).getTime() < Date.now();
}

function isSessionLive(dateStr?: string): boolean {
  if (!dateStr) return false;
  const start = new Date(dateStr).getTime();
  // Assume sessions last ~2 hours
  return Date.now() >= start && Date.now() < start + 2 * 60 * 60 * 1000;
}

function formatTime(dateStr?: string) {
  if (!dateStr) return "";
  try {
    return new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr));
  } catch {
    return dateStr;
  }
}

export default function ScheduleCard() {
  const [data, setData] = useState<SessionData>(fallbackData);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/schedule")
      .then((res) => res.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setData(d);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load schedule");
      });
  }, []);

  const sessionRows: {
    name: string;
    key: keyof SessionData["sessions"];
    isRace?: boolean;
  }[] = [
    { name: "Practice 1", key: "fp1" as const },
    { name: "Practice 2", key: "fp2" as const },
    { name: "Practice 3", key: "fp3" as const },
    { name: "Sprint Qualifying", key: "sprint_qualifying" as const },
    { name: "Sprint", key: "sprint" as const },
    { name: "Qualifying", key: "qualifying" as const },
    { name: "Race", key: "race" as const, isRace: true },
  ].filter((s) => data.sessions[s.key]);

  return (
    <div className="glass-card p-6 w-full h-full flex flex-col relative overflow-hidden group">
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-36 h-36 bg-[#ff1801]/10 dark:bg-[#ff1801]/15 rounded-full blur-3xl transition-all duration-500 pointer-events-none" />

      <div className="relative z-10 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-5">
          <div>
            <p className="text-[#ff1801] font-semibold tracking-widest text-xs uppercase mb-1">
              Up Next
            </p>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              {data.name}
            </h2>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-slate-500 dark:text-white/50 text-xs mt-1.5">
              <span className="flex items-center gap-1">
                <MapPin size={11} /> {data.location}, {data.country}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={11} /> {data.date}
              </span>
            </div>
          </div>
          <div className="w-11 h-11 rounded-full glass-panel flex items-center justify-center text-xl shrink-0 ml-2">
            🏎️
          </div>
        </div>

        {error && (
          <div className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 rounded-xl p-3 text-xs mb-4">
            ⚠️ {error}
          </div>
        )}

        <div className="space-y-1.5 flex-1">
          {sessionRows.map(({ name, key, isRace }) => {
            const dateStr = data.sessions[key];
            const past = isSessionPast(dateStr);
            const live = isSessionLive(dateStr);
            return (
              <div
                key={key}
                className={`flex justify-between items-center px-3 py-2 rounded-xl transition-colors ${
                  live
                    ? "bg-green-500/10 dark:bg-green-500/15 border border-green-500/30"
                    : past
                      ? "opacity-40"
                      : "hover:bg-slate-900/5 dark:hover:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-white/10"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      live
                        ? "bg-green-500 animate-pulse"
                        : isRace
                          ? "bg-[#ff1801]"
                          : name.includes("Qualifying")
                            ? "bg-blue-500 dark:bg-blue-400"
                            : name.includes("Sprint")
                              ? "bg-purple-500"
                              : "bg-slate-300 dark:bg-white/30"
                    }`}
                  />
                  <span
                    className={`text-sm font-medium ${past ? "text-slate-500 dark:text-white/50" : "text-slate-800 dark:text-white/90"}`}
                  >
                    {name}
                    {live && (
                      <span className="ml-2 text-green-500 text-xs font-bold">
                        ● LIVE
                      </span>
                    )}
                    {past && !live && (
                      <span className="ml-2 text-slate-400 dark:text-white/30 text-xs">
                        ✓
                      </span>
                    )}
                  </span>
                </div>
                <span className="text-xs text-slate-600 dark:text-white/50 font-mono bg-slate-900/5 dark:bg-black/20 px-2 py-1 rounded-lg">
                  {formatTime(dateStr)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Countdown to next upcoming session */}
        <CountdownTimer sessions={data.sessions} />
      </div>
    </div>
  );
}
