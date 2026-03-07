"use client";

import { useEffect, useState } from "react";

type DriverStanding = {
  position: number;
  driverId: string;
  code: string;
  firstName: string;
  lastName: string;
  number: string;
  nationality: string;
  flagCode: string;
  team: string;
  points: number;
  wins: number;
  headshot: string | null;
};

type ConstructorStanding = {
  position: number;
  constructorId: string;
  name: string;
  nationality: string;
  points: number;
  wins: number;
};

type StandingsData = {
  season: string;
  type: "drivers" | "constructors";
  standings: DriverStanding[] | ConstructorStanding[];
};

const TEAM_COLORS: Record<string, string> = {
  McLaren: "#F47600",
  "Red Bull": "#4781D7",
  "Red Bull Racing": "#4781D7",
  Ferrari: "#ED1131",
  Mercedes: "#00D7B6",
  "Aston Martin": "#00594F",
  "Alpine F1 Team": "#0093CC",
  Williams: "#00A3E0",
  "RB F1 Team": "#4781D7",
  "Haas F1 Team": "#B6BABD",
  Sauber: "#00CF46",
  Audi: "#E00000",
  Cadillac: "#D4A017",
};

function DriverRow({
  s,
  maxPoints,
  index,
}: {
  s: DriverStanding;
  maxPoints: number;
  index: number;
}) {
  const [imgError, setImgError] = useState(false);
  const teamColor = TEAM_COLORS[s.team] ?? "#888888";
  const barWidth = maxPoints > 0 ? Math.round((s.points / maxPoints) * 100) : 0;
  const initials = `${s.firstName[0]}${s.lastName[0]}`;

  return (
    <div
      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-900/5 dark:hover:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-white/8 transition-all cursor-default"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      {/* Position */}
      <span
        className={`w-5 text-center text-sm font-bold shrink-0 ${
          index === 0
            ? "text-yellow-500"
            : index === 1
              ? "text-slate-400"
              : index === 2
                ? "text-amber-600"
                : "text-slate-500 dark:text-white/30"
        }`}
      >
        {s.position}
      </span>

      {/* Driver Avatar */}
      <div className="shrink-0" style={{ width: 36, height: 36 }}>
        {s.headshot && !imgError ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={s.headshot}
            alt={s.lastName}
            width={36}
            height={36}
            className="rounded-full object-cover object-top w-9 h-9 border-2"
            style={{ borderColor: teamColor }}
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className="rounded-full w-9 h-9 flex items-center justify-center text-xs font-bold border-2"
            style={{
              backgroundColor: teamColor + "22",
              borderColor: teamColor,
              color: teamColor,
            }}
          >
            {initials}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https://flagcdn.com/16x12/${s.flagCode}.png`}
            alt=""
            width={14}
            height={11}
            className="rounded-sm shrink-0 opacity-80"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
          <span className="font-semibold text-sm text-slate-900 dark:text-white truncate">
            {s.firstName[0]}. {s.lastName}
          </span>
          {s.wins > 0 && (
            <span className="text-[10px] font-bold text-yellow-500 bg-yellow-500/10 dark:bg-yellow-500/15 px-1.5 py-0.5 rounded-full shrink-0">
              {s.wins}W
            </span>
          )}
        </div>
        <div className="h-1 w-full bg-slate-200/60 dark:bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${barWidth}%`, backgroundColor: teamColor }}
          />
        </div>
      </div>

      <span className="font-mono font-bold text-sm shrink-0 text-slate-800 dark:text-white">
        {s.points}
        <span className="text-[9px] text-slate-400 dark:text-white/30 font-normal">
          pts
        </span>
      </span>
    </div>
  );
}

function ConstructorRow({
  s,
  maxPoints,
  index,
}: {
  s: ConstructorStanding;
  maxPoints: number;
  index: number;
}) {
  const teamColor = TEAM_COLORS[s.name] ?? "#888888";
  const barWidth = maxPoints > 0 ? Math.round((s.points / maxPoints) * 100) : 0;
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-900/5 dark:hover:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-white/8 transition-all cursor-default">
      <span
        className={`w-5 text-center text-sm font-bold shrink-0 ${
          index === 0
            ? "text-yellow-500"
            : index === 1
              ? "text-slate-400"
              : index === 2
                ? "text-amber-600"
                : "text-slate-500 dark:text-white/30"
        }`}
      >
        {s.position}
      </span>
      <div
        className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-white text-xs font-bold border-2"
        style={{
          backgroundColor: teamColor + "22",
          borderColor: teamColor,
          color: teamColor,
        }}
      >
        {s.name.slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm text-slate-900 dark:text-white truncate">
            {s.name}
          </span>
          {s.wins > 0 && (
            <span className="text-[10px] font-bold text-yellow-500 bg-yellow-500/10 dark:bg-yellow-500/15 px-1.5 py-0.5 rounded-full shrink-0">
              {s.wins}W
            </span>
          )}
        </div>
        <div className="h-1 w-full bg-slate-200/60 dark:bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${barWidth}%`, backgroundColor: teamColor }}
          />
        </div>
      </div>
      <span className="font-mono font-bold text-sm shrink-0 text-slate-800 dark:text-white">
        {s.points}
        <span className="text-[9px] text-slate-400 dark:text-white/30 font-normal">
          pts
        </span>
      </span>
    </div>
  );
}

export default function StandingsCard() {
  const [data, setData] = useState<StandingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewType, setViewType] = useState<"drivers" | "constructors">(
    "drivers",
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setData(null);
      setLoading(true);
      setError(null);
    }, 0);

    fetch(`/api/standings?type=${viewType}`)
      .then((res) => res.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load standings");
        setLoading(false);
      });

    return () => clearTimeout(timer);
  }, [viewType]);

  const maxPoints = data?.standings[0]
    ? "points" in data.standings[0]
      ? (data.standings[0] as DriverStanding).points
      : 0
    : 1;

  return (
    <div className="glass-card p-6 w-full h-full flex flex-col relative overflow-hidden group">
      <div className="absolute bottom-0 right-0 -mr-8 -mb-8 w-40 h-40 bg-yellow-400/8 dark:bg-yellow-400/15 rounded-full blur-3xl pointer-events-none" />

      <div className="flex justify-between items-center mb-4 relative z-10 gap-3">
        <div className="min-w-0">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            🏆{" "}
            <span className="truncate">
              {viewType === "drivers" ? "WDC" : "WCC"} Standings
            </span>
          </h3>
          {data && (
            <p className="text-xs text-slate-500 dark:text-white/40 mt-0.5">
              2026 Season
            </p>
          )}
        </div>

        {/* Toggle */}
        <div className="flex shrink-0 gap-1 p-1 rounded-xl bg-slate-900/5 dark:bg-white/5 border border-slate-200 dark:border-white/10">
          {(["drivers", "constructors"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setViewType(t)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                viewType === t
                  ? "bg-white dark:bg-white/15 text-slate-900 dark:text-white shadow-sm"
                  : "text-slate-500 dark:text-white/50 hover:text-slate-700 dark:hover:text-white/80"
              }`}
            >
              {t === "drivers" ? "WDC" : "WCC"}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
          {error}
        </div>
      ) : loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-5 h-4 bg-slate-200 dark:bg-white/10 rounded shrink-0" />
              <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-white/10 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-slate-200 dark:bg-white/10 rounded w-1/2" />
                <div className="h-1.5 bg-slate-100 dark:bg-white/5 rounded" />
              </div>
              <div className="w-12 h-4 bg-slate-200 dark:bg-white/10 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto space-y-1 relative z-10 custom-scrollbar pr-1">
          {data?.type === "drivers"
            ? (data.standings as DriverStanding[]).map((s, i) => (
                <DriverRow
                  key={s.driverId || i}
                  s={s}
                  maxPoints={maxPoints}
                  index={i}
                />
              ))
            : data?.type === "constructors"
              ? (data.standings as ConstructorStanding[]).map((s, i) => (
                  <ConstructorRow
                    key={s.constructorId || i}
                    s={s}
                    maxPoints={maxPoints}
                    index={i}
                  />
                ))
              : null}
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 3px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 4px; }
        html.dark .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); }
      `,
        }}
      />
    </div>
  );
}
