import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { SongsService } from './songs.service';

@Controller('admin/song-history')
@UseGuards(AuthGuard)
export class AdminSongHistoryController {
  constructor(private readonly songsService: SongsService) {}

  @Get()
  getForDate(@Query('date') date: string) {
    return this.songsService.getHistoryForDate(date);
  }

  @Post()
  add(@Body('songId', ParseIntPipe) songId: number, @Body('date') date: string) {
    return this.songsService.addHistoryEntry(songId, date);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.songsService.removeHistoryEntry(id);
  }
}
