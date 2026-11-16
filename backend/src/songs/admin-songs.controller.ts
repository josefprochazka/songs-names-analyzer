import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { SongsService } from './songs.service';

@Controller('admin/songs')
@UseGuards(AuthGuard)
export class AdminSongsController {
  constructor(private readonly songsService: SongsService) {}

  @Post()
  create(@Body('name') name: string) {
    return this.songsService.createSong(name);
  }
}
