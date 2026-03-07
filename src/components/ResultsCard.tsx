"use client";

import { useEffect, useState, useCallback } from "react";
import { Trophy } from "lucide-react";
import DriverAvatar from "./DriverAvatar";

type Result = {
  position: number;
  driver: string;
  team: string;
  time: string;
  gap: string;
  color: string;
};

type SessionData = {
  session_name: string;
  session_type: string;
  results: Result[];
};

const NATIONALITY_FLAGS: Record<string, string> = {
  "G RUSSELL": "gb",
  "L HAMILTON": "gb",
  "L NORRIS": "gb",
  "O PIASTRI": "au",
  "C LECLERC": "mc",
  "C SAINZ": "es",
  "M VERSTAPPEN": "nl",
  "S PEREZ": "mx",
  "F ALONSO": "es",
  "L STROLL": "ca",
  "V BOTTAS": "fi",
  "Z GUANYU": "cn",
  "E OCON": "fr",
  "P GASLY": "fr",
  "N HULKENBERG": "de",
  "K MAGNUSSEN": "dk",
  "A ALBON": "th",
  "L SARGEANT": "us",
  "Y TSUNODA": "jp",
  "D RICCIARDO": "au",
  "K ANTONELLI": "it",
  "I HADJAR": "fr",
  "J DOOHAN": "au",
  "O BEARMAN": "gb",
  "G BORTOLETO": "br",
  "L LAWSON": "nz",
};

const SESSION_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  R: { label: "Race", color: "#ff1801" },
  Q: { label: "Qualifying", color: "#3b82f6" },
  SQ: { label: "Sprint Quali", color: "#8b5cf6" },
  S: { label: "Sprint", color: "#f59e0b" },
  FP1: { label: "Practice 1", color: "#6b7280" },
  FP2: { label: "Practice 2", color: "#6b7280" },
  FP3: { label: "Practice 3", color: "#6b7280" },
};

// Map broadcast name → F1.com media CDN headshot
const DRIVER_HEADSHOTS: Record<string, string> = {
  "G RUSSELL":
    "https://media.formula1.com/image/upload/f_auto/q_auto/v1677244987/content/dam/fom-website/drivers/G/GEORUS01_George_Russell/georus01.png",
  "L HAMILTON":
    "https://media.formula1.com/image/upload/f_auto/q_auto/v1677244990/content/dam/fom-website/drivers/L/LEWHAM01_Lewis_Hamilton/lewham01.png",
  "L NORRIS":
    "https://media.formula1.com/image/upload/f_auto/q_auto/v1677245035/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01.png",
  "O PIASTRI":
    "https://media.formula1.com/image/upload/f_auto/q_auto/v1677244708/content/dam/fom-website/drivers/O/OSCPIA01_Oscar_Piastri/oscpia01.png",
  "C LECLERC":
    "https://media.formula1.com/image/upload/f_auto/q_auto/v1677244960/content/dam/fom-website/drivers/C/CHALEC01_Charles_Leclerc/chalec01.png",
  "C SAINZ":
    "https://media.formula1.com/image/upload/f_auto/q_auto/v1677245083/content/dam/fom-website/drivers/C/CARSAI01_Carlos_Sainz/carsai01.png",
  "M VERSTAPPEN":
    "https://media.formula1.com/image/upload/f_auto/q_auto/v1677244772/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png",
  "F ALONSO":
    "https://media.formula1.com/image/upload/f_auto/q_auto/v1677244745/content/dam/fom-website/drivers/F/FERALO01_Fernando_Alonso/feralo01.png",
  "L STROLL":
    "https://media.formula1.com/image/upload/f_auto/q_auto/v1677245189/content/dam/fom-website/drivers/L/LANSTR01_Lance_Stroll/lanstr01.png",
  "E OCON":
    "https://media.formula1.com/image/upload/f_auto/q_auto/v1677244749/content/dam/fom-website/drivers/E/ESTOCO01_Esteban_Ocon/estoco01.png",
  "P GASLY":
    "https://media.formula1.com/image/upload/f_auto/q_auto/v1677244800/content/dam/fom-website/drivers/P/PIEGAS01_Pierre_Gasly/piegas01.png",
  "N HULKENBERG":
    "https://media.formula1.com/image/upload/f_auto/q_auto/v1677244840/content/dam/fom-website/drivers/N/NICHUL01_Nico_Hulkenberg/nichul01.png",
  "A ALBON":
    "https://media.formula1.com/image/upload/f_auto/q_auto/v1677244865/content/dam/fom-website/drivers/A/ALEALB01_Alexander_Albon/alealb01.png",
  "Y TSUNODA":
    "https://media.formula1.com/image/upload/f_auto/q_auto/v1677245232/content/dam/fom-website/drivers/Y/YUKTSU01_Yuki_Tsunoda/yuktsu01.png",
  "K ANTONELLI":
    "https://media.formula1.com/image/upload/f_auto/q_auto/v1726738226/content/dam/fom-website/drivers/A/ANDANT01_Andrea_Kimi_Antonelli/andant01.png",
  "I HADJAR":
    "https://media.formula1.com/image/upload/f_auto/q_auto/v1726738226/content/dam/fom-website/drivers/I/ISAHAD01_Isack_Hadjar/isahad01.png",
  "J DOOHAN":
    "https://media.formula1.com/image/upload/f_auto/q_auto/v1726738226/content/dam/fom-website/drivers/J/JACDOO01_Jack_Doohan/jacdoo01.png",
  "O BEARMAN":
    "https://media.formula1.com/image/upload/f_auto/q_auto/v1726738226/content/dam/fom-website/drivers/O/OLIBEA01_Oliver_Bearman/olibea01.png",
  "L LAWSON":
    "https://media.formula1.com/image/upload/f_auto/q_auto/v1726738226/content/dam/fom-website/drivers/L/LIALAW01_Liam_Lawson/lialaw01.png",
  "G BORTOLETO":
    "https://media.formula1.com/image/upload/f_auto/q_auto/v1726738226/content/dam/fom-website/drivers/G/GABOR01_Gabriel_Bortoleto/gabbor01.png",
};

function getDriverCode(broadcastName: string): string {
  const parts = broadcastName.split(" ");
  return parts[parts.length - 1]?.slice(0, 3).toUpperCase() ?? "UNK";
}

export default function ResultsCard() {
  const [data, setData] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchData = useCallback(() => {
    fetch("/api/session")
      .then((res) => res.json())
      .then((d) => {
        if (d.error) throw new Error(d.error);
        setData(d);
        setLastUpdated(new Date());
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load session results");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchData();
    // Auto-refresh every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const sessionInfo = data?.session_type
    ? SESSION_TYPE_LABELS[data.session_type]
    : null;

  return (
    <div className="glass-card p-6 w-full h-full flex flex-col relative overflow-hidden group">
      <div className="absolute top-1/2 left-1/2 -ml-20 -mt-20 w-40 h-40 bg-zinc-400/8 dark:bg-zinc-400/15 rounded-full blur-3xl pointer-events-none" />

      <div className="flex justify-between items-center mb-4 relative z-10">
        <div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Trophy className="text-yellow-500" size={20} /> Latest Results
          </h3>
          <p className="text-slate-500 dark:text-white/40 text-xs mt-0.5 truncate max-w-[200px]">
            {data?.session_name ?? "Fetching..."}
          </p>
        </div>
        {sessionInfo && (
          <span
            className="text-xs font-bold px-2.5 py-1 rounded-full shrink-0"
            style={{
              backgroundColor: sessionInfo.color + "22",
              color: sessionInfo.color,
              border: `1px solid ${sessionInfo.color}44`,
            }}
          >
            {sessionInfo.label}
          </span>
        )}
      </div>

      {error ? (
        <div className="flex-1 flex items-center justify-center text-slate-500 dark:text-white/40 text-sm">
          {error}
        </div>
      ) : loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-white/10 shrink-0" />
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-white/10 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-slate-200 dark:bg-white/10 rounded w-2/3" />
                <div className="h-2 bg-slate-100 dark:bg-white/5 rounded w-1/2" />
              </div>
              <div className="w-16 h-6 rounded-lg bg-slate-200 dark:bg-white/10" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 relative z-10 custom-scrollbar">
            {data?.results?.map((result, i) => {
              const code = getDriverCode(result.driver);
              const flagCode = NATIONALITY_FLAGS[result.driver];
              const firstName = result.driver.split(" ")[0];
              const lastName = result.driver.split(" ").slice(1).join(" ");

              return (
                <div
                  key={i}
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-900/5 dark:hover:bg-white/8 border border-transparent hover:border-slate-900/8 dark:hover:border-white/8 transition-all cursor-default"
                >
                  {/* Position badge */}
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      result.position === 1
                        ? "bg-yellow-100 text-yellow-600 border border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-400 dark:border-yellow-500/40"
                        : result.position === 2
                          ? "bg-slate-200 text-slate-600 border border-slate-300 dark:bg-zinc-500/20 dark:text-zinc-300 dark:border-zinc-400/40"
                          : result.position === 3
                            ? "bg-orange-100 text-orange-600 border border-orange-200 dark:bg-orange-600/20 dark:text-orange-400 dark:border-orange-500/40"
                            : "bg-slate-100 text-slate-500 border border-slate-200 dark:bg-white/5 dark:text-white/40 dark:border-white/8"
                    }`}
                  >
                    {result.position}
                  </div>

                  {/* Avatar */}
                  <DriverAvatar
                    code={code}
                    firstName={firstName || code}
                    lastName={lastName || code}
                    headshot={DRIVER_HEADSHOTS[result.driver] ?? null}
                    teamColor={result.color}
                    size={32}
                  />

                  {/* Driver info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      {flagCode && (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={`https://flagcdn.com/16x12/${flagCode}.png`}
                          alt=""
                          width={14}
                          height={11}
                          className="rounded-sm shrink-0 opacity-80"
                        />
                      )}
                      <span className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                        {result.driver}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: result.color }}
                      />
                      <span className="text-xs text-slate-500 dark:text-white/40 truncate">
                        {result.team}
                      </span>
                    </div>
                  </div>

                  {/* Time + Gap */}
                  <div className="flex flex-col items-end gap-0.5 shrink-0">
                    <span className="font-mono text-xs text-slate-700 dark:text-white/70 bg-slate-900/5 dark:bg-black/30 px-2 py-1 rounded-lg">
                      {result.time}
                    </span>
                    {result.gap && result.gap !== "LEADER" && (
                      <span
                        className="font-mono text-[10px] px-1.5 py-0.5 rounded opacity-90 font-semibold"
                        style={{
                          color: result.color,
                          backgroundColor: `${result.color}15`,
                        }}
                      >
                        {result.gap}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {data?.results?.length === 0 && (
              <div className="flex-1 flex items-center justify-center text-slate-500 dark:text-white/40 text-sm italic py-8">
                No results available yet.
              </div>
            )}
          </div>

          {lastUpdated && (
            <p className="text-[10px] text-slate-400 dark:text-white/20 text-right mt-2 font-mono relative z-10">
              Updated {lastUpdated.toLocaleTimeString()}
            </p>
          )}
        </>
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
