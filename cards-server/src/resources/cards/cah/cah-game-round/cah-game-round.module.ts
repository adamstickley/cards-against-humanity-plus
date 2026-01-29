import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  CahGameSessionEntity,
  CahSessionPlayerEntity,
  CahGameRoundEntity,
  CahRoundSubmissionEntity,
  CahSubmissionCardEntity,
  CahPlayerHandEntity,
  CahCardEntity,
  CahSessionCustomCardEntity,
} from '../../../../entities';
import { CahGameRoundController } from './cah-game-round.controller';
import { CahGameRoundService } from './cah-game-round.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CahGameSessionEntity,
      CahSessionPlayerEntity,
      CahGameRoundEntity,
      CahRoundSubmissionEntity,
      CahSubmissionCardEntity,
      CahPlayerHandEntity,
      CahCardEntity,
      CahSessionCustomCardEntity,
    ]),
  ],
  controllers: [CahGameRoundController],
  providers: [CahGameRoundService],
  exports: [CahGameRoundService],
})
export class CahGameRoundModule {}
