import { Module } from '@nestjs/common';
import { CahCardController, CahCardService } from './cah-card';
import { CahCardSetController, CahCardSetService } from './cah-card-set';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CahCardEntity, CahCardSetEntity } from '../../../entities';

@Module({
  imports: [TypeOrmModule.forFeature([CahCardEntity, CahCardSetEntity])],
  controllers: [CahCardController, CahCardSetController],
  providers: [CahCardService, CahCardSetService],
})
export class CahModule {}
