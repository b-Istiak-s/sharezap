import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

@WebSocketGateway({ cors: true })
export class WsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private clients = new Map<string, Socket>();

  handleConnection(socket: Socket) {
    const wsId = uuidv4();
    this.clients.set(wsId, socket);
    socket.emit('register', { wsId });

    socket.on('disconnect', () => this.removeClient(socket));
  }

  handleDisconnect(socket: Socket) {
    this.removeClient(socket);
  }

  private removeClient(socket: Socket) {
    for (const [key, value] of this.clients.entries()) {
      if (value === socket) this.clients.delete(key);
    }
  }

  getClient(wsId: string): Socket | undefined {
    return this.clients.get(wsId);
  }

  private getClientId(socket: Socket): string | undefined {
    for (const [key, value] of this.clients.entries()) {
      if (value === socket) return key;
    }
    return undefined;
  }

  @SubscribeMessage('offer')
  handleOffer(
    @MessageBody()
    data: {
      targetId: string;
      offer: RTCSessionDescriptionInit;
      userAgent?: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const target = this.clients.get(data.targetId);

    if (target)
      target.emit('offer', {
        from: this.getClientId(client),
        offer: data.offer,
        userAgent: data.userAgent,
      });
  }

  @SubscribeMessage('answer')
  handleAnswer(
    @MessageBody()
    data: {
      targetId: string;
      answer: RTCSessionDescriptionInit;
      userAgent?: string;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const target = this.clients.get(data.targetId);
    if (target)
      target.emit('answer', {
        from: this.getClientId(client),
        answer: data.answer,
        userAgent: data.userAgent,
      });
  }

  @SubscribeMessage('ice-candidate')
  handleIceCandidate(
    @MessageBody()
    data: { targetId: string; candidate: RTCIceCandidateInit },
    @ConnectedSocket() client: Socket,
  ) {
    const target = this.clients.get(data.targetId);
    if (target)
      target.emit('ice-candidate', {
        from: this.getClientId(client),
        candidate: data.candidate,
      });
  }
}
