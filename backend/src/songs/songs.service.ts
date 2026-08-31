import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const MAX_SONGS_PER_DATE = 4;

function dayRange(dateStr: string): { start: Date; end: Date } {
  const start = new Date(`${dateStr}T00:00:00.000Z`);
  if (Number.isNaN(start.getTime())) {
    throw new BadRequestException('Neplatné datum.');
  }
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

@Injectable()
export class SongsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const songs = await this.prisma.song.findMany({
      include: { history: { select: { date: true } } },
    });

    return songs
      .map((song) => ({
        id: song.id,
        name: song.name,
        dates: song.history.map((entry) => entry.date.toISOString()),
      }))
      .sort((a, b) => b.dates.length - a.dates.length);
  }

  async getDateRange() {
    const { _min, _max } = await this.prisma.songHistory.aggregate({
      _min: { date: true },
      _max: { date: true },
    });

    return { from: _min.date, to: _max.date };
  }

  async getHistoryForDate(dateStr: string) {
    const { start, end } = dayRange(dateStr);
    const entries = await this.prisma.songHistory.findMany({
      where: { date: { gte: start, lt: end } },
      include: { song: true },
      orderBy: { id: 'asc' },
    });

    return entries.map((entry) => ({
      id: entry.id,
      songId: entry.songId,
      songName: entry.song.name,
    }));
  }

  async addHistoryEntry(songId: number, dateStr: string) {
    const { start, end } = dayRange(dateStr);

    const existingCount = await this.prisma.songHistory.count({
      where: { date: { gte: start, lt: end } },
    });
    if (existingCount >= MAX_SONGS_PER_DATE) {
      throw new BadRequestException(`Na jedno datum lze přidat max. ${MAX_SONGS_PER_DATE} písně.`);
    }

    const song = await this.prisma.song.findUnique({ where: { id: songId } });
    if (!song) {
      throw new NotFoundException('Píseň nenalezena.');
    }

    const alreadyOnDate = await this.prisma.songHistory.findFirst({
      where: { songId, date: { gte: start, lt: end } },
    });
    if (alreadyOnDate) {
      throw new BadRequestException('Tahle píseň už je na tomto datu přidaná.');
    }

    const entry = await this.prisma.songHistory.create({ data: { songId, date: start } });
    return { id: entry.id, songId, songName: song.name };
  }

  async removeHistoryEntry(id: number) {
    const entry = await this.prisma.songHistory.findUnique({ where: { id } });
    if (!entry) {
      throw new NotFoundException('Záznam nenalezen.');
    }
    await this.prisma.songHistory.delete({ where: { id } });
    return { success: true };
  }
}
