"use client";

import { useEffect, useState } from "react";
import { Compass } from "lucide-react";

export default function TrackMap() {
  const [data, setData] = useState<{
    track_name: string;
    coordinates: { x: number[]; y: number[] };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/track")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(
          "Failed to load track data. (FastF1 telemetry might not be available yet)",
        );
        setLoading(false);
      });
  }, []);

  const getSvgPath = () => {
    if (!data || !data.coordinates) return "";
    const { x, y } = data.coordinates;
    if (!x || !y || x.length === 0) return "";

    // Normalize coordinates to fit in a 100x100 box
    const minX = Math.min(...x);
    const maxX = Math.max(...x);
    const minY = Math.min(...y);
    const maxY = Math.max(...y);

    const rangeX = maxX - minX;
    const rangeY = maxY - minY;

    // Maintain aspect ratio
    const scale = 100 / Math.max(rangeX, rangeY);

    // Center it
    const offsetX = (100 - rangeX * scale) / 2;
    const offsetY = (100 - rangeY * scale) / 2;

    const pathData = x
      .map((xi: number, i: number) => {
        const yi = y[i];
        // Note: SVG Y-axis points down, telemetry Y-axis points up, so we invert Y
        const px = (xi - minX) * scale + offsetX;
        const py = 100 - ((yi - minY) * scale + offsetY);

        return `${i === 0 ? "M" : "L"} ${px} ${py}`;
      })
      .join(" ");

    // Close the path perfectly
    return pathData + " Z";
  };

  return (
    <div className="glass-card p-6 w-full h-full flex flex-col relative overflow-hidden group">
      <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-40 h-40 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl group-hover:bg-blue-500/20 dark:group-hover:bg-blue-500/30 transition-all duration-500"></div>

      <div className="flex justify-between items-center mb-4 relative z-10 w-full">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Compass className="text-[#ff1801]" size={20} /> Circuit Layout
        </h3>
        {data && (
          <span className="text-slate-600 dark:text-white/50 text-xs px-2 py-1 bg-slate-900/5 dark:bg-white/5 rounded-md border border-slate-200 dark:border-white/10 shrink-0 truncate max-w-[50%] ml-2">
            {data.track_name}
          </span>
        )}
      </div>

      {error ? (
        <div className="flex-1 flex items-center justify-center text-center p-4">
          <p className="text-slate-600 dark:text-white/60 text-sm">{error}</p>
        </div>
      ) : loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center gap-2">
            <div className="w-8 h-8 rounded-full border-t-2 border-[#ff1801] animate-spin"></div>
            <span className="text-xs text-slate-500 dark:text-white/40 tracking-widest uppercase">
              Analyzing Telemetry
            </span>
          </div>
        </div>
      ) : (
        <div className="flex-1 w-full h-full flex items-center justify-center relative z-10 p-4 min-h-[300px]">
          {data && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0">
              <span className="text-[4rem] md:text-[6rem] font-black uppercase text-center leading-none tracking-tighter text-slate-900/5 dark:text-white/5 whitespace-nowrap select-none">
                {data.track_name}
              </span>
            </div>
          )}
          {/* preserveAspectRatio="xMidYMid meet" ensures the SVG scales uniformly inside its parent without stretching */}
          <svg
            viewBox="-5 -5 110 110"
            preserveAspectRatio="xMidYMid meet"
            className="relative z-10 w-full h-full max-h-[400px] drop-shadow-[0_0_15px_rgba(0,0,0,0.1)] dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]"
          >
            <path
              d={getSvgPath()}
              fill="none"
              stroke="url(#track-gradient)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-90"
            />
            <defs>
              <linearGradient
                id="track-gradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                {/* Standard colors for track stroke gradient */}
                <stop
                  offset="0%"
                  stopColor="#94a3b8"
                  className="dark:stop-color-white"
                />
                <stop offset="50%" stopColor="#ff4b4b" />
                <stop
                  offset="100%"
                  stopColor="#94a3b8"
                  className="dark:stop-color-white"
                />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )}
    </div>
  );
}
