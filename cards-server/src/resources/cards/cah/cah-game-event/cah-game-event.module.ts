import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CahGameEventEntity } from '../../../../entities';
import { CahGameEventService } from './cah-game-event.service';

@Module({
  imports: [TypeOrmModule.forFeature([CahGameEventEntity])],
  providers: [CahGameEventService],
  exports: [CahGameEventService],
})
export class CahGameEventModule {}
