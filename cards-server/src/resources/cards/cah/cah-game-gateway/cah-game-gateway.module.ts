import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  CahSessionPlayerEntity,
  CahGameSessionEntity,
  CahGameRoundEntity,
  CahPlayerHandEntity,
} from '../../../../entities';
import { CahGameGateway } from './cah-game.gateway';
import { PlayerPresenceService } from './player-presence.service';
import { GameStateSyncService } from './game-state-sync.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([
      CahSessionPlayerEntity,
      CahGameSessionEntity,
      CahGameRoundEntity,
      CahPlayerHandEntity,
    ]),
  ],
  providers: [CahGameGateway, PlayerPresenceService, GameStateSyncService],
  exports: [CahGameGateway, PlayerPresenceService, GameStateSyncService],
})
export class CahGameGatewayModule {}
