import { Module, Global } from '@nestjs/common';
import { CahGameGateway } from './cah-game.gateway';

@Global()
@Module({
  providers: [CahGameGateway],
  exports: [CahGameGateway],
})
export class CahGameGatewayModule {}
