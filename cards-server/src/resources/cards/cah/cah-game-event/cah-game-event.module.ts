import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CahGameEventEntity, CahGameSessionEntity } from '../../../../entities';
import { CahGameEventService } from './cah-game-event.service';
import { CahGameEventController } from './cah-game-event.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([CahGameEventEntity, CahGameSessionEntity]),
  ],
  controllers: [CahGameEventController],
  providers: [CahGameEventService],
  exports: [CahGameEventService],
})
export class CahGameEventModule {}
