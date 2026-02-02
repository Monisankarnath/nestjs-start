import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: true })
export class ChatGateway implements OnGatewayConnection, OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() roomName: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(roomName);
    console.log(`Client ${client.id} joined room: ${roomName}`);

    // Notify ONLY the user who joined
    client.emit('joinedRoom', `You have joined ${roomName}`);
  }

  @SubscribeMessage('sendToRoom')
  handleMessageToRoom(
    @MessageBody() data: { room: string; message: string },
    @ConnectedSocket() client: Socket,
  ) {
    // Broadcast ONLY to that specific room
    // .to(room) -> targets the room
    // .except(client.id) -> optional: don't send it back to the sender
    this.server.to(data.room).emit('receiveMessage', {
      senderId: client.id,
      message: data.message,
    });

    console.log(`Message sent to ${data.room}`);
  }

  handleConnection(client: Socket) {
    console.log('Client connected: ', client.id);
  }

  handleDisconnect(client: Socket) {
    console.log(`🔌 Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('sendMessage')
  handleMessage(@MessageBody() data: any, @ConnectedSocket() client: Socket) {
    console.log(`Received message from ${client.id}:`, data);

    // BROADCAST: Send this message to EVERYONE connected
    // 'receiveMessage' is the event name the frontend listens for.
    this.server.emit('receiveMessage', {
      senderId: client.id,
      message: data.message,
    });
  }

  @SubscribeMessage('ping')
  handlePing(@MessageBody() data: any): string {
    // If you return a value, NestJS automatically sends it back as an Acknowledgement!
    return 'pong';
  }
}
