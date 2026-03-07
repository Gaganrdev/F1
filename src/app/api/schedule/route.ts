import { NextResponse } from "next/server";
import { exec } from "child_process";
import path from "path";
import util from "util";

const execPromise = util.promisify(exec);

// In-memory cache: schedule data changes at most once a week
let scheduleCache: { data: unknown; timestamp: number } | null = null;
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

export async function GET() {
  // Serve from cache if fresh
  if (scheduleCache && Date.now() - scheduleCache.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(scheduleCache.data);
  }

  try {
    const scriptPath = path.join(process.cwd(), "python_scripts", "get_schedule.py");
    const venvPython = process.cwd() + '/python_scripts/venv/bin/python';

    const { stdout, stderr } = await execPromise(`${venvPython} ${scriptPath}`, { timeout: 60000 });

    if (stderr) {
      console.warn("Python Warning:", stderr.split("\n").filter((l: string) => !l.includes("INFO") && !l.includes("NotOpenSSL")).join("\n"));
    }

    const data = JSON.parse(stdout.trim());
    scheduleCache = { data, timestamp: Date.now() };
    return NextResponse.json(data);
  } catch (error) {
    console.error("Schedule API Error:", error);
    // Return stale cache if we have it
    if (scheduleCache) return NextResponse.json(scheduleCache.data);
    return NextResponse.json({ error: "Failed to fetch schedule" }, { status: 500 });
  }
}
