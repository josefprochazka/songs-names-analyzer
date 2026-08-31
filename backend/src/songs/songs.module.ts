import { Module } from '@nestjs/common';
import { SongsController } from './songs.controller';
import { SongsService } from './songs.service';
import { AdminSongHistoryController } from './admin-song-history.controller';

@Module({
  controllers: [SongsController, AdminSongHistoryController],
  providers: [SongsService],
})
export class SongsModule {}
