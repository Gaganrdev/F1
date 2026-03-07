import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import util from 'util';

const execPromise = util.promisify(exec);

export const dynamic = 'force-dynamic';

// Track data barely changes — circuits are fixed. Cache for an hour.
let trackCache: { data: unknown; timestamp: number } | null = null;
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
trackCache = null;

export async function GET() {
  if (trackCache && Date.now() - trackCache.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(trackCache.data);
  }

  try {
    const scriptPath = path.join(process.cwd(), 'python_scripts', 'get_track.py');
    const venvPython = process.cwd() + '/python_scripts/venv/bin/python';
    
    const { stdout } = await execPromise(`${venvPython} ${scriptPath}`, {
      timeout: 60000, // 60s timeout for telemetry
      maxBuffer: 1024 * 1024 * 10
    });

    const data = JSON.parse(stdout.trim());
    trackCache = { data, timestamp: Date.now() };
    return NextResponse.json(data);
  } catch (error) {
    console.error('Track API Error:', error);
    if (trackCache) return NextResponse.json(trackCache.data);
    return NextResponse.json({ error: 'Failed to load track data. (FastF1 telemetry might not be available yet)' }, { status: 500 });
  }
}
