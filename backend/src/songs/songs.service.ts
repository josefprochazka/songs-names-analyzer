import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SongsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const songs = await this.prisma.song.findMany({
      include: { _count: { select: { history: true } } },
    });

    return songs
      .map((song) => ({
        id: song.id,
        name: song.name,
        timesSung: song._count.history,
      }))
      .sort((a, b) => b.timesSung - a.timesSung);
  }

  async getDateRange() {
    const { _min, _max } = await this.prisma.songHistory.aggregate({
      _min: { date: true },
      _max: { date: true },
    });

    return { from: _min.date, to: _max.date };
  }
}
