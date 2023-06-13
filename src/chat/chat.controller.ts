import { formatPagination } from './../helpers';
import { ChatGateway } from './chat.gateway';
import { StartConversationDto } from './../dto/start-conversation.dto';
import { PaginationDto } from './../dto/pagination.dto';
import { ChatService } from './chat.service';
import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt-guard';

@ApiBearerAuth('JWT')
@Controller('chat')
export class ChatController {
  constructor(
    private chatService: ChatService,
    private chatGateway: ChatGateway,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Get('conversations')
  async getUserConversations(@Req() req, @Query() pagination: PaginationDto) {
    const result = await this.chatService.getUserConversations(
      req.user.id,
      +pagination.page <= 1 ? 0 : +pagination.page * +pagination.pageSize,
      +pagination.pageSize,
    );

    return formatPagination(result, pagination);
  }

  @UseGuards(JwtAuthGuard)
  @Get('conversations/:id')
  async getUserConversationMessage(
    @Req() req,
    @Param('id') id: string,
    @Query() pagination: PaginationDto,
  ) {
    const result = await this.chatService.getConversationMessages(
      id,
      +pagination.page <= 1 ? 0 : +pagination.page * +pagination.pageSize,
      +pagination.pageSize,
    );

    return formatPagination(result, pagination);
  }

  @UseGuards(JwtAuthGuard)
  @Post('conversations')
  async startConversation(
    @Req() req,
    @Body() startConversationDto: StartConversationDto,
  ) {
    startConversationDto.senderId = req.user.id;
    const conversation = await this.chatService.startConversations(
      startConversationDto,
    );

    const participants = await this.chatService.getConversationParticipants(
      conversation.id,
    );
    participants.forEach((e) => {
      if (e.id != req.user.id && e.websocketId) {
        this.chatGateway.server
          .to(e.websocketId)
          .emit('newConversation', conversation);
      }
    });

    return conversation;
  }
}
