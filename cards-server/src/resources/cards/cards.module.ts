import { Module } from '@nestjs/common';
import { CahModule } from './cah';

@Module({
  controllers: [],
  providers: [],
  imports: [CahModule],
})
export class CardsModule {}
