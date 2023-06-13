import { PrismaService } from './prisma/prisma.service';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';

import { ConfigModule } from '@nestjs/config';
import { AccountModule } from './account/account.module';
import { EmailService } from './services/email.service';
import { ScheduleModule } from '@nestjs/schedule';
import { EmailSchedulingService } from './services/email-scheduling.service';
import { ChatModule } from './chat/chat.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
    AuthModule,
    PrismaModule,
    AccountModule,
    ScheduleModule.forRoot(),
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, EmailService, EmailSchedulingService],
  exports: [PrismaService],
})
export class AppModule {}
