import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import { createTursoAdapter } from '../src/prisma/turso-adapter';

const adapter = createTursoAdapter();
const prisma = new PrismaClient(adapter ? { adapter } : undefined);

async function main() {
  const [songs, history] = await Promise.all([
    prisma.song.findMany(),
    prisma.songHistory.findMany(),
  ]);

  const backup = {
    createdAt: new Date().toISOString(),
    songs,
    history,
  };

  const outputPath = process.argv[2] ?? path.join(__dirname, '../backup.json');
  fs.writeFileSync(outputPath, JSON.stringify(backup, null, 2));

  console.log(`Backup written to ${outputPath}: ${songs.length} songs, ${history.length} history rows`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
