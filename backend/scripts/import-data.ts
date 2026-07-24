import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';
import { PrismaClient } from '@prisma/client';
import { createTursoAdapter } from '../src/prisma/turso-adapter';

const adapter = createTursoAdapter();
const prisma = new PrismaClient(adapter ? { adapter } : undefined);

const DICTIONARY_PATH = path.join(__dirname, '../data/song-names-dictionary.txt');
const SOURCE_XLSX_PATH = path.join(__dirname, '../data/songs-source-06-2026.xlsx');

const COMBINING_DIACRITICS = new RegExp('[\\u0300-\\u036f]', 'g');

function normalize(name: string): string {
  return name.normalize('NFD').replace(COMBINING_DIACRITICS, '').toLowerCase().trim();
}

function readDictionaryNames(): string[] {
  const raw = fs.readFileSync(DICTIONARY_PATH, 'utf-8');
  return raw
    .split('\n')
    .map((line) => line.trim())
    .filter((name) => name.length > 0);
}

function readSourceRows(): { date: Date; name: string }[] {
  const workbook = XLSX.readFile(SOURCE_XLSX_PATH, { cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<[Date, string]>(sheet, { header: 1 });

  return rows
    .filter((row) => row[0] && row[1])
    .map(([date, name]) => ({ date, name: String(name).trim() }));
}

async function main() {
  const dictionaryNames = readDictionaryNames();

  for (const name of dictionaryNames) {
    await prisma.song.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const songs = await prisma.song.findMany();
  const songIdByNormalizedName = new Map(songs.map((song) => [normalize(song.name), song.id]));

  const sourceRows = readSourceRows();

  let matched = 0;
  let unknown = 0;

  for (const row of sourceRows) {
    const songId = songIdByNormalizedName.get(normalize(row.name));

    if (songId) {
      await prisma.songHistory.create({ data: { date: row.date, songId } });
      matched++;
    } else {
      await prisma.unknownSong.create({ data: { date: row.date, name: row.name } });
      unknown++;
    }
  }

  console.log(`Songs in dictionary: ${dictionaryNames.length}`);
  console.log(`Source rows matched: ${matched}`);
  console.log(`Source rows unknown: ${unknown}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
