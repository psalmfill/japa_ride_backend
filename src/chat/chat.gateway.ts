import { WsGetConversationsDto } from './../dto/ws-get-conversation.dto';
import { CreateMessageDto } from './../dto/create-message.dto';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { ChatService } from './chat.service';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { WsGuard } from 'src/auth/guards/ws-guard';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';

@WebSocketGateway()
export class ChatGateway {
  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
    private readonly userService: UsersService,
  ) {}
  async handleDisconnect(client: any) {
    if (client.handshake.headers.authorization) {
      const bearerToken = client.handshake.headers.authorization.split(' ')[1];

      const decoded = this.jwtService.verify(bearerToken) as any;
      if (decoded.user) {
        //  update the connected user in the session
        await this.userService.update(decoded.user.id, {
          websocketId: null,
          // isOnline: false,
        });
      }
    }
  }
  async handleConnection(client: any, ...args: any[]) {
    if (client.handshake.headers.authorization) {
      const bearerToken = client.handshake.headers.authorization.split(' ')[1];

      const decoded = this.jwtService.verify(bearerToken) as any;
      if (decoded.user) {
        //  store the connected user in the session
        await this.userService.update(decoded.user.id, {
          websocketId: client.id,
          // isOnline: true,
        });
      }
    }
  }
  @WebSocketServer()
  server: Server;

  @UseGuards(WsGuard)
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() data: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    const message = await this.chatService.createMessage({
      userId: data.user.id,
      content: data.content,
      conversationId: data.conversationId,
    });

    // emit a new messages to participants
    const participants = await this.chatService.getConversationParticipants(
      message.conversationId,
    );
    participants.forEach((e) => {
      if (e.id != message.userId && e.websocketId) {
        this.server.to(e.websocketId).emit('newMessage', message);
      }
    });

    return {
      event: 'sentMessage',
      data: message,
    };
  }
  @UseGuards(WsGuard)
  @SubscribeMessage('getConversations')
  async handleGetConversations(
    @MessageBody() data: WsGetConversationsDto,
    @ConnectedSocket() client: Socket,
  ) {
    const conversations = await this.chatService.getUserConversations(
      data.user.id,
      +data.page <= 1 ? 0 : +data.page * +data.pageSize,
      +data.pageSize,
    );

    return {
      event: 'receiveConversations',
      data: conversations,
    };
  }
  @UseGuards(WsGuard)
  @SubscribeMessage('getConversationMessages')
  async handleGetMessages(
    @MessageBody() data: WsGetConversationsDto,
    @ConnectedSocket() client: Socket,
  ) {
    const conversations = this.chatService.getConversationMessages(
      data.conversationId,
    );

    return {
      event: 'receiveConversationMessages',
      data: conversations,
    };
  }
}
