import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  CahGameSessionEntity,
  CahSessionPlayerEntity,
  CahSessionCardPackEntity,
  CahCardSetEntity,
} from '../../../../entities';
import { CahGameSessionController } from './cah-game-session.controller';
import { CahGameSessionService } from './cah-game-session.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CahGameSessionEntity,
      CahSessionPlayerEntity,
      CahSessionCardPackEntity,
      CahCardSetEntity,
    ]),
  ],
  controllers: [CahGameSessionController],
  providers: [CahGameSessionService],
  exports: [CahGameSessionService],
})
export class CahGameSessionModule {}
