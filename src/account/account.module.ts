import { AuthModule } from './../auth/auth.module';
import { AuthService } from './../auth/auth.service';
import { PrismaService } from './../prisma/prisma.service';
import { UsersService } from './../users/users.service';
import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { AccountController } from './account.controller';

@Module({
  imports: [AuthModule],
  providers: [AccountService, UsersService, PrismaService,],
  controllers: [AccountController]
})
export class AccountModule {}
