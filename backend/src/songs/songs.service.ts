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
}
