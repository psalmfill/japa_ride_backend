import { JwtModule } from '@nestjs/jwt';
import { UsersService } from './../users/users.service';
import { WsGuard } from 'src/auth/guards/ws-guard';
import { PrismaService } from './../prisma/prisma.service';
import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [ChatGateway, ChatService, PrismaService, WsGuard, UsersService],
  controllers: [ChatController],
})
export class ChatModule {}
