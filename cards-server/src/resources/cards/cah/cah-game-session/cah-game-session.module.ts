import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  CahGameSessionEntity,
  CahSessionPlayerEntity,
  CahSessionCardPackEntity,
  CahCardSetEntity,
  CahCardEntity,
  CahPlayerHandEntity,
  CahGameRoundEntity,
  CahSessionCustomCardEntity,
} from '../../../../entities';
import { CahGameSessionController } from './cah-game-session.controller';
import { CahGameSessionService } from './cah-game-session.service';
import { CahCardDealerService } from './cah-card-dealer.service';
import { CahGameEventModule } from '../cah-game-event';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CahGameSessionEntity,
      CahSessionPlayerEntity,
      CahSessionCardPackEntity,
      CahCardSetEntity,
      CahCardEntity,
      CahPlayerHandEntity,
      CahGameRoundEntity,
      CahSessionCustomCardEntity,
    ]),
    CahGameEventModule,
  ],
  controllers: [CahGameSessionController],
  providers: [CahGameSessionService, CahCardDealerService],
  exports: [CahGameSessionService, CahCardDealerService],
})
export class CahGameSessionModule {}
