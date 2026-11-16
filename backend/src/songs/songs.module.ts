import { Module } from '@nestjs/common';
import { SongsController } from './songs.controller';
import { SongsService } from './songs.service';
import { AdminSongHistoryController } from './admin-song-history.controller';
import { AdminSongsController } from './admin-songs.controller';

@Module({
  controllers: [SongsController, AdminSongHistoryController, AdminSongsController],
  providers: [SongsService],
})
export class SongsModule {}
