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
} from '../../../../entities';
import { CahGameSessionController } from './cah-game-session.controller';
import { CahGameSessionService } from './cah-game-session.service';
import { CahCardDealerService } from './cah-card-dealer.service';

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
    ]),
  ],
  controllers: [CahGameSessionController],
  providers: [CahGameSessionService, CahCardDealerService],
  exports: [CahGameSessionService, CahCardDealerService],
})
export class CahGameSessionModule {}
