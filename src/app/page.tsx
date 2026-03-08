import ScheduleCard from "@/components/ScheduleCard";
import TrackMap from "@/components/TrackMap";
import ResultsCard from "@/components/ResultsCard";
import StandingsCard from "@/components/StandingsCard";
import NewsCard from "@/components/NewsCard";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function Home() {
  return (
    <main className="min-h-screen p-4 md:p-8 transition-colors duration-300">
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#ff1801] rounded-xl flex items-center justify-center shadow-[0_0_24px_rgba(255,24,1,0.4)] shrink-0">
            <span className="text-white font-black italic text-xl -skew-x-12">
              F1
            </span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
              F1 Dashboard
            </h1>
            <p className="text-xs text-slate-500 dark:text-white/40 font-mono">
              LIVE DATA
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="glass-panel px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2 text-slate-700 dark:text-white/80">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Active Weekend
          </div>
        </div>
      </header>

      {/* Top row: Schedule + Track */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="h-auto lg:h-[520px]">
          <ScheduleCard />
        </div>
        <div className="h-[420px] lg:h-[520px]">
          <TrackMap />
        </div>
      </div>

      {/* Bottom row: Results + Standings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-[480px]">
          <ResultsCard />
        </div>
        <div className="h-[480px]">
          <StandingsCard />
        </div>
      </div>

      {/* Third row: News */}
      <div className="mt-6">
        <NewsCard />
      </div>

      {/* Footer */}
      <footer className="mt-12 text-center text-slate-400 dark:text-white/20 text-xs font-mono">
        DATA: FASTF1, JOLPICA, MOTORSPORT.COM • F1 DASHBOARD
      </footer>
    </main>
  );
}
