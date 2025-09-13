import {NextResponse} from 'next/server';
import fs from 'fs-extra';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');

// Ensure data directory exists
fs.ensureDirSync(DATA_DIR);

async function saveJSON(filePath: string, data: any) {
  await fs.writeJson(filePath, data, {spaces: 2});
}

async function appendWeeklyData(filePath: string, data: any, date: Date) {
  let weekData: any[] = [];
  if (await fs.pathExists(filePath)) {
    weekData = await fs.readJson(filePath);
  }
  weekData.push({date: date.toISOString(), data});
  await fs.writeJson(filePath, weekData, {spaces: 2});
}

function getWeekNumber(d: Date) {
  const date = new Date(d.getTime());
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() + 4 - (date.getDay() || 7));
  const yearStart = new Date(date.getFullYear(), 0, 1);
  const weekNo = Math.ceil(
    ((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  );
  return weekNo;
}

export async function GET(request: Request) {
  const {searchParams} = new URL(request.url);
  const ids = searchParams.get('ids') || 'bitcoin';
  const vs_currencies = searchParams.get('vs_currencies') || 'usd';

  const params = new URLSearchParams({
    ids,
    vs_currencies,
    include_market_cap: 'true',
    include_24hr_vol: 'true',
    include_24hr_change: 'true',
    include_last_updated_at: 'true',
  });

  const url = `https://api.coingecko.com/api/v3/simple/price?${params.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch from CoinGecko: ${response.statusText}`);
    }
    const data = await response.json();

    const date = new Date();
    const dayFile = path.join(
      DATA_DIR,
      `${date.toISOString().slice(0, 10)}.json`
    );
    const weekFile = path.join(
      DATA_DIR,
      `week-${getWeekNumber(date)}.json`
    );

    // Save daily data
    await saveJSON(dayFile, data);

    // Append weekly data
    await appendWeeklyData(weekFile, data, date);

    return NextResponse.json({success: true, data});
  } catch (error: any) {
    return NextResponse.json(
      {error: error.message},
      {status: 500}
    );
  }
}
