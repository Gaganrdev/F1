import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import path from 'path';
import util from 'util';

const execPromise = util.promisify(exec);

// In-memory cache: 5 minutes
let sessionCache: { data: unknown; timestamp: number } | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;
// Force refetch on restart to pick up new fields from Python script
sessionCache = null;

export async function GET() {
  if (sessionCache && Date.now() - sessionCache.timestamp < CACHE_TTL_MS) {
    return NextResponse.json(sessionCache.data);
  }

  try {
    const scriptPath = path.join(process.cwd(), 'python_scripts', 'get_session.py');
    const venvPython = path.join(process.cwd(), 'python_scripts', 'venv', 'bin', 'python');
    
    const { stdout } = await execPromise(`${venvPython} ${scriptPath}`, { timeout: 30000 });

    const data = JSON.parse(stdout.trim());
    sessionCache = { data, timestamp: Date.now() };
    return NextResponse.json(data);
  } catch (error) {
    console.error('Session API Error:', error);
    if (sessionCache) return NextResponse.json(sessionCache.data);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
