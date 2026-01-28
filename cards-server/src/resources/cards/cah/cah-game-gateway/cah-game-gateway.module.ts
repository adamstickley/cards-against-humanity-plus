import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CahSessionPlayerEntity } from '../../../../entities';
import { CahGameGateway } from './cah-game.gateway';
import { PlayerPresenceService } from './player-presence.service';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([CahSessionPlayerEntity])],
  providers: [CahGameGateway, PlayerPresenceService],
  exports: [CahGameGateway, PlayerPresenceService],
})
export class CahGameGatewayModule {}
