import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { SongsModule } from './songs/songs.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PrismaModule, SongsModule, AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
