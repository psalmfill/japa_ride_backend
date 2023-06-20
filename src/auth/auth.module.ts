import { EmailService } from './../services/email.service';
import { EmailConfirmationService } from './../services/email-confirmation.service';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { UsersService } from './../users/users.service';
import { PrismaService } from './../prisma/prisma.service';
import { UsersModule } from './../users/users.module';
import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './guards/jwt-strategy';
import { GoogleStrategy } from './guards/google.strategy';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get('JWT_SECRET'),
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  exports: [AuthService, JwtModule],
  providers: [
    AuthService,
    PrismaService,
    JwtStrategy,
    GoogleStrategy,
    UsersService,
    EmailConfirmationService,
    EmailService,
  ],
})
export class AuthModule {}
