import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  BadRequestException,
  NotFoundException,
  Headers,
} from '@nestjs/common';
import { WsGateway } from './ws/ws.gateway';
import { AppService } from './app.service';

@Controller('codes')
export class AppController {
  constructor(
    private wsGateway: WsGateway,
    private codeService: AppService,
  ) {}

  @Post('generate')
  generate(@Body('wsId') wsId: string) {
    if (!wsId) throw new BadRequestException('wsId is required');

    const socket = this.wsGateway.getClient(wsId);
    if (!socket) throw new BadRequestException('WebSocket not connected');

    const { code, expiresAt } = this.codeService.generateCode(socket);
    return { success: true, code, expiresAt };
  }

  @Get('verify')
  verify(
    @Query('code') code: string,
    @Headers('user-agent') userAgent: string,
    @Headers('ws-id') requesterId: string,
  ) {
    if (!code) throw new BadRequestException('Missing parameters');

    const entry = this.codeService.verifyCode(code);
    if (!entry) throw new NotFoundException('Invalid or expired code');

    entry.socket.emit('request', { userAgent, requesterId });
    return { success: true, message: 'Request sent' };
  }
}
