import { CreateMessageDto } from './../dto/create-message.dto';
import { StartConversationDto } from './../dto/start-conversation.dto';
import { PrismaService } from './../prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ChatService {
  constructor(private prismaService: PrismaService) {}

  async getUserConversations(
    userId: string,
    skip: number = 1,
    take: number = 20,
  ) {
    const conversations = await this.prismaService.conversation
      .findMany({
        where: {
          participants: {
            some: { id: userId },
          },
        },
        take,
        skip,
        orderBy: {
          updatedAt: 'desc',
        },
        include: {
          messages: {
            orderBy: {
              createdAt: 'desc',
            },
            take: 1,
          },
        },
      })
      .then((result) => {
        return result.map((item) => {
          const newItem = JSON.parse(JSON.stringify(item));
          delete newItem.messages;
          newItem.recentMessage = item.messages.pop();
          return newItem;
        });
      });
    return conversations;
  }

  startConversations(startConversationDto: StartConversationDto) {
    console.log(startConversationDto);
    const conversation = this.prismaService.conversation.create({
      data: {
        participants: {
          connect: [
            { id: startConversationDto.receiverId },
            { id: startConversationDto.senderId },
          ],
        },
        messages: {
          create: {
            content: startConversationDto.content,
            userId: startConversationDto.senderId,
          },
        },
      },
    });
    return conversation;
  }

  deleteConversation(conversationId: string) {
    const conversation = this.prismaService.conversation.delete({
      where: { id: conversationId },
    });
    return conversation;
  }

  async getConversationMessages(
    conversationId: string,
    skip: number = 1,
    take: number = 20,
  ) {
    const messages = await this.prismaService.message.findMany({
      where: {
        conversationId,
      },
      take,
      skip,
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        user: true,
      },
    });
    return messages.map((message) => {
      delete message.user.password;
      return message;
    });
  }

  async createMessage(createMessageDto: CreateMessageDto) {
    const conversation = await this.prismaService.conversation.update({
      where: { id: createMessageDto.conversationId },
      data: {
        updatedAt: new Date(),
        messages: {
          create: [
            {
              userId: createMessageDto.userId,
              content: createMessageDto.content,
            },
          ],
        },
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'desc',
          },
          take: 1,
          include: {
            user: true,
          },
        },
      },
    });
    const message = conversation.messages.pop();

    delete message.user.password; // delete the password from the object
    return message;
  }

  removeMessage(messageId: string) {
    const message = this.prismaService.message.delete({
      where: { id: messageId },
    });
    return message;
  }

  async getConversationParticipants(conversationId: string) {
    const conversation = await this.prismaService.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: true,
      },
    });
    const participants = conversation.participants;
    return participants;
  }
}
