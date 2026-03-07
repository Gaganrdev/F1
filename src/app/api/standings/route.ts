import { NextResponse } from 'next/server';

let standingsCache: { data: unknown; timestamp: number } | null = null;
let constructorCache: { data: unknown; timestamp: number } | null = null;
const CACHE_TTL_MS = 30 * 60 * 1000;
standingsCache = null;
constructorCache = null;

// F1.com media CDN - format confirmed working as of 2026
// https://media.formula1.com/image/upload/f_auto/q_auto/v[ver]/content/dam/fom-website/drivers/[INITIAL]/[CODE]01_[First]_[Last]/[code]01.png
const DRIVER_IMAGES: Record<string, string> = {
  'NOR': 'https://media.formula1.com/image/upload/f_auto/q_auto/v1677245035/content/dam/fom-website/drivers/L/LANNOR01_Lando_Norris/lannor01.png',
  'VER': 'https://media.formula1.com/image/upload/f_auto/q_auto/v1677244772/content/dam/fom-website/drivers/M/MAXVER01_Max_Verstappen/maxver01.png',
  'RUS': 'https://media.formula1.com/image/upload/f_auto/q_auto/v1677244987/content/dam/fom-website/drivers/G/GEORUS01_George_Russell/georus01.png',
  'ANT': 'https://media.formula1.com/image/upload/f_auto/q_auto/v1726738226/content/dam/fom-website/drivers/A/ANDANT01_Andrea_Kimi_Antonelli/andant01.png',
  'ALB': 'https://media.formula1.com/image/upload/f_auto/q_auto/v1677244865/content/dam/fom-website/drivers/A/ALEALB01_Alexander_Albon/alealb01.png',
  'STR': 'https://media.formula1.com/image/upload/f_auto/q_auto/v1677245189/content/dam/fom-website/drivers/L/LANSTR01_Lance_Stroll/lanstr01.png',
  'HUL': 'https://media.formula1.com/image/upload/f_auto/q_auto/v1677244840/content/dam/fom-website/drivers/N/NICHUL01_Nico_Hulkenberg/nichul01.png',
  'LEC': 'https://media.formula1.com/image/upload/f_auto/q_auto/v1677244960/content/dam/fom-website/drivers/C/CHALEC01_Charles_Leclerc/chalec01.png',
  'PIA': 'https://media.formula1.com/image/upload/f_auto/q_auto/v1677244708/content/dam/fom-website/drivers/O/OSCPIA01_Oscar_Piastri/oscpia01.png',
  'HAM': 'https://media.formula1.com/image/upload/f_auto/q_auto/v1677244990/content/dam/fom-website/drivers/L/LEWHAM01_Lewis_Hamilton/lewham01.png',
  'GAS': 'https://media.formula1.com/image/upload/f_auto/q_auto/v1677244800/content/dam/fom-website/drivers/P/PIEGAS01_Pierre_Gasly/piegas01.png',
  'TSU': 'https://media.formula1.com/image/upload/f_auto/q_auto/v1677245232/content/dam/fom-website/drivers/Y/YUKTSU01_Yuki_Tsunoda/yuktsu01.png',
  'OCO': 'https://media.formula1.com/image/upload/f_auto/q_auto/v1677244749/content/dam/fom-website/drivers/E/ESTOCO01_Esteban_Ocon/estoco01.png',
  'BEA': 'https://media.formula1.com/image/upload/f_auto/q_auto/v1726738226/content/dam/fom-website/drivers/O/OLIBEA01_Oliver_Bearman/olibea01.png',
  'LAW': 'https://media.formula1.com/image/upload/f_auto/q_auto/v1726738226/content/dam/fom-website/drivers/L/LIALAW01_Liam_Lawson/lialaw01.png',
  'BOR': 'https://media.formula1.com/image/upload/f_auto/q_auto/v1726738226/content/dam/fom-website/drivers/G/GABBOR01_Gabriel_Bortoleto/gabbor01.png',
  'ALO': 'https://media.formula1.com/image/upload/f_auto/q_auto/v1677244745/content/dam/fom-website/drivers/F/FERALO01_Fernando_Alonso/feralo01.png',
  'SAI': 'https://media.formula1.com/image/upload/f_auto/q_auto/v1677245083/content/dam/fom-website/drivers/C/CARSAI01_Carlos_Sainz/carsai01.png',
  'DOO': 'https://media.formula1.com/image/upload/f_auto/q_auto/v1726738226/content/dam/fom-website/drivers/J/JACDOO01_Jack_Doohan/jacdoo01.png',
  'HAD': 'https://media.formula1.com/image/upload/f_auto/q_auto/v1726738226/content/dam/fom-website/drivers/I/ISAHAD01_Isack_Hadjar/isahad01.png',
};

const NATIONALITY_FLAGS: Record<string, string> = {
  British: 'gb', Dutch: 'nl', Spanish: 'es', German: 'de',
  French: 'fr', Australian: 'au', Finnish: 'fi', Mexican: 'mx',
  Canadian: 'ca', Monegasque: 'mc', Japanese: 'jp', Thai: 'th',
  Danish: 'dk', American: 'us', Italian: 'it', Chinese: 'cn',
  Brazilian: 'br', Austrian: 'at', 'New Zealander': 'nz', Polish: 'pl',
  Swiss: 'ch', Belgian: 'be', 'Argentine': 'ar'
};

const TEAM_MAPPING_2026: Record<string, string> = {
  'VER': 'Red Bull', 'HAD': 'Red Bull',
  'NOR': 'McLaren', 'PIA': 'McLaren',
  'LEC': 'Ferrari', 'HAM': 'Ferrari',
  'RUS': 'Mercedes', 'ANT': 'Mercedes',
  'ALO': 'Aston Martin', 'STR': 'Aston Martin',
  'GAS': 'Alpine F1 Team', 'COL': 'Alpine F1 Team',
  'SAI': 'Williams', 'ALB': 'Williams',
  'LAW': 'RB F1 Team', 'LIN': 'RB F1 Team',
  'OCO': 'Haas F1 Team', 'BEA': 'Haas F1 Team',
  'HUL': 'Audi', 'BOR': 'Audi',
  'PER': 'Cadillac', 'BOT': 'Cadillac'
};

async function fetchLatestDriverStandings() {
  if (standingsCache && Date.now() - standingsCache.timestamp < CACHE_TTL_MS) {
    return { data: standingsCache.data, cached: true };
  }

  // Fetch current year standings
  const res = await fetch(`https://api.jolpi.ca/ergast/f1/current/driverStandings.json`);
  const json = await res.json();
  const lists = json.MRData?.StandingsTable?.StandingsLists ?? [];

  if (lists.length === 0) {
    // No 2026 championship points awarded yet - synthesize 2026 grid with 0 points
    const res2026 = await fetch('https://api.jolpi.ca/ergast/f1/2026/drivers.json');
    const json2026 = await res2026.json();
    const drivers = json2026.MRData?.DriverTable?.Drivers ?? [];
    
    const result = drivers.map((d: Record<string, any>, i: number) => {
      const code = d.code?.toUpperCase() ?? '';
      return {
        position: i + 1,
        driverId: d.driverId,
        code,
        firstName: d.givenName,
        lastName: d.familyName,
        number: d.permanentNumber,
        nationality: d.nationality,
        flagCode: NATIONALITY_FLAGS[d.nationality] ?? 'un',
        team: TEAM_MAPPING_2026[code] ?? 'Unknown',
        points: 0,
        wins: 0,
        headshot: DRIVER_IMAGES[code] ?? null,
      };
    });
    
    const data = { season: '2026', type: 'drivers', standings: result };
    standingsCache = { data, timestamp: Date.now() };
    return { data, cached: false };
  }

  const standings = lists[0]?.DriverStandings ?? [];
  const season = json.MRData?.StandingsTable?.season ?? 'latest';

  const result = standings.slice(0, 22).map((s: Record<string, any>) => {
    const code = s.Driver.code?.toUpperCase() ?? '';
    return {
      position: parseInt(s.position) || 99,
      driverId: s.Driver.driverId,
      code,
      firstName: s.Driver.givenName,
      lastName: s.Driver.familyName,
      number: s.Driver.permanentNumber,
      nationality: s.Driver.nationality,
      flagCode: NATIONALITY_FLAGS[s.Driver.nationality] ?? 'un',
      team: s.Constructors[0]?.name ?? 'Unknown',
      points: parseFloat(s.points),
      wins: parseInt(s.wins),
      headshot: DRIVER_IMAGES[code] ?? null,
    };
  });

  const data = { season, type: 'drivers', standings: result };
  standingsCache = { data, timestamp: Date.now() };
  return { data, cached: false };
}

async function fetchLatestConstructorStandings() {
  if (constructorCache && Date.now() - constructorCache.timestamp < CACHE_TTL_MS) {
    return { data: constructorCache.data, cached: true };
  }

  const res = await fetch(`https://api.jolpi.ca/ergast/f1/current/constructorStandings.json`);
  const json = await res.json();
  const lists = json.MRData?.StandingsTable?.StandingsLists ?? [];

  if (lists.length === 0) {
    // No 2026 championship points awarded yet - synthesize 2026 grid with 0 points
    const res2026 = await fetch('https://api.jolpi.ca/ergast/f1/2026/constructors.json');
    const json2026 = await res2026.json();
    const constructors = json2026.MRData?.ConstructorTable?.Constructors ?? [];
    
    const result = constructors.map((c: Record<string, any>, i: number) => ({
      position: i + 1,
      constructorId: c.constructorId,
      name: c.name,
      nationality: c.nationality,
      points: 0,
      wins: 0,
    }));

    const data = { season: '2026', type: 'constructors', standings: result };
    constructorCache = { data, timestamp: Date.now() };
    return { data, cached: false };
  }

  const season = json.MRData?.StandingsTable?.season ?? 'latest';
  const standings = lists[0]?.ConstructorStandings ?? [];
  const result = standings.slice(0, 11).map((s: Record<string, any>) => ({
    position: parseInt(s.position) || 99,
    constructorId: s.Constructor.constructorId,
    name: s.Constructor.name,
    nationality: s.Constructor.nationality,
    points: parseFloat(s.points),
    wins: parseInt(s.wins),
  }));

  const data = { season, type: 'constructors', standings: result };
  constructorCache = { data, timestamp: Date.now() };
  return { data, cached: false };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') ?? 'drivers';

  try {
    if (type === 'constructors') {
      const { data } = await fetchLatestConstructorStandings();
      return NextResponse.json(data);
    } else {
      const { data } = await fetchLatestDriverStandings();
      return NextResponse.json(data);
    }
  } catch (error) {
    console.error('Standings API Error:', error);
    const cached = type === 'constructors' ? constructorCache : standingsCache;
    if (cached) return NextResponse.json(cached.data);
    return NextResponse.json({ error: 'Failed to fetch standings' }, { status: 500 });
  }
}
