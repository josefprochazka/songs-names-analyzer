import * as fs from 'fs';
import * as path from 'path';
import { PrismaClient } from '@prisma/client';
import { createTursoAdapter } from '../src/prisma/turso-adapter';

const MAX_BACKUPS = 10;
const BACKUP_FILE_PATTERN = /^songs-backup-\d{4}-\d{2}-\d{2}\.json$/;

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

  verifyBackup(outputPath);
  pruneOldBackups(outputPath);
}

// Throws if the written file isn't a valid backup, so nothing gets pruned.
function verifyBackup(filePath: string) {
  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  if (!Array.isArray(parsed.songs) || !Array.isArray(parsed.history)) {
    throw new Error(`Invalid backup file ${filePath}, skipping prune`);
  }
}

// Keeps only the newest MAX_BACKUPS files (by date in the file name), including the new one.
function pruneOldBackups(newFilePath: string) {
  const dir = path.dirname(newFilePath);
  const newFile = path.basename(newFilePath);
  if (!BACKUP_FILE_PATTERN.test(newFile)) return;

  const olderBackups = fs
    .readdirSync(dir)
    .filter((name) => BACKUP_FILE_PATTERN.test(name) && name !== newFile)
    .sort();
  const toDelete = olderBackups.slice(0, Math.max(0, olderBackups.length - (MAX_BACKUPS - 1)));

  for (const name of toDelete) {
    fs.unlinkSync(path.join(dir, name));
  }

  console.log(
    toDelete.length
      ? `Pruned ${toDelete.length} old backup(s), keeping ${MAX_BACKUPS}: ${toDelete.join(', ')}`
      : `Nothing to prune (keeping up to ${MAX_BACKUPS})`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
