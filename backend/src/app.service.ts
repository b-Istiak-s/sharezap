/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import { Socket } from 'socket.io';

interface CodeEntry {
  socket: Socket;
  code: string;
  expiresAt: number;
}

@Injectable()
export class AppService {
  private codes: CodeEntry[] = [];

  constructor() {
    // Cleanup expired codes every 10 seconds
    setInterval(() => {
      const now = Date.now();
      this.codes = this.codes.filter((c) => c.expiresAt > now);
    }, 10_000);
  }

  generateCode(socket: Socket): { code: string; expiresAt: number } {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 30_000;
    this.codes.push({ socket, code, expiresAt });
    return { code, expiresAt };
  }

  verifyCode(code: string): CodeEntry | null {
    const now = Date.now();
    const index = this.codes.findIndex(
      (c) => c.code === code && c.expiresAt > now,
    );
    if (index === -1) return null;

    const entry = this.codes[index];
    // Remove after verification
    this.codes.splice(index, 1);
    return entry;
  }
}
