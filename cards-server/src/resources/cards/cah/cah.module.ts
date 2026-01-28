import { Module } from '@nestjs/common';
import { CahCardController, CahCardService } from './cah-card';
import { CahCardSetController, CahCardSetService } from './cah-card-set';
import { CahGameSessionModule } from './cah-game-session';
import { CahGameRoundModule } from './cah-game-round';
import { CahGameGatewayModule } from './cah-game-gateway';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CahCardEntity, CahCardSetEntity } from '../../../entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([CahCardEntity, CahCardSetEntity]),
    CahGameSessionModule,
    CahGameRoundModule,
    CahGameGatewayModule,
  ],
  controllers: [CahCardController, CahCardSetController],
  providers: [CahCardService, CahCardSetService],
})
export class CahModule {}
