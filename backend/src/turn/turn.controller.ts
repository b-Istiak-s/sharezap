import { Controller, Get, BadRequestException } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

interface IceServer {
  urls: string[];
  username?: string;
  credential?: string;
}

@Controller('turn')
export class TurnController {
  private readonly TURN_API = process.env.TURN_API_URL;
  private readonly API_KEY: string;

  constructor() {
    if (!process.env.TURN_API_KEY) {
      throw new Error('TURN_API_KEY is not set in environment variables');
    }
    this.API_KEY = process.env.TURN_API_KEY;
  }

  @Throttle({
    default: {
      limit: parseInt(process.env.TURN_THROTTLE_LIMIT || '10', 10),
      ttl: parseInt(process.env.TURN_THROTTLE_TTL || '3', 10),
    },
  })
  @Get('credentials')
  async getTurnCredentials(): Promise<{
    success: true;
    iceServers: IceServer[];
  }> {
    const response = await fetch(`${this.TURN_API}?apiKey=${this.API_KEY}`);

    if (!response.ok) {
      throw new BadRequestException('TURN server returned an error');
    }

    const iceServers = (await response.json()) as IceServer[];

    if (!Array.isArray(iceServers)) {
      throw new BadRequestException('Invalid TURN server response format');
    }

    const filteredIceServers = iceServers.filter((server, index) => index < 4);
    return { success: true, iceServers: filteredIceServers };
  }
}
