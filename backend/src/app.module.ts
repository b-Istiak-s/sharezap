import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WsGateway } from './ws/ws.gateway';
import { TurnController } from './turn/turn.controller';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
    }),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: parseInt(process.env.GLOBAL_THROTTLE_TTL || '60', 10), // seconds
          limit: parseInt(process.env.GLOBAL_THROTTLE_LIMIT || '30', 10), // max requests per IP per window
        },
      ],
    }),
  ],
  controllers: [AppController, TurnController],
  providers: [AppService, WsGateway],
})
export class AppModule {}
