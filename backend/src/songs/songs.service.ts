import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
}
