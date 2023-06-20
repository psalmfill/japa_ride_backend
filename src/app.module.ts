import { PrismaService } from './prisma/prisma.service';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { AccountModule } from './account/account.module';
import { EmailService } from './services/email.service';
import { ScheduleModule } from '@nestjs/schedule';
import { EmailSchedulingService } from './services/email-scheduling.service';
import { ChatModule } from './chat/chat.module';
import { RidesService } from './services/rides.service';
import { PaymentsService } from './services/payments.service';
import { TransactionsService } from './services/transactions.service';
import { ReviewsService } from './services/reviews.service';
import { ConfigsService } from './services/configs.service';
import { CurrenciesService } from './services/currencies.service';
import { LocationsService } from './services/locations.service';
import { VehicleCategoriesService } from './services/vehicle-categories.service';
import { VehiclesService } from './services/vehicles.service';
import { RolesService } from './services/roles.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { BullModule } from '@nestjs/bull';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
    AuthModule,
    PrismaModule,
    AccountModule,
    ScheduleModule.forRoot(),
    ChatModule,
    BullModule.forRoot({
      // redis: {
      //   host: 'localhost',
      //   port: 6379,
      // },
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        transport: {
          service: configService.get('EMAIL_SERVICE'),
          host: configService.get('EMAIL_HOST'),
          port: configService.get<number>('EMAIL_PORT'),
          secure: configService.get('EMAIL_PORT') == 'true' ? true : false, // true for 465, false for other ports
          ignoreTLS:
            configService.get('EMAIL_IGNORE_TLS') == 'true' ? true : false, // true for 465, false for other ports
          auth: {
            user: configService.get('EMAIL_ID'), //  user
            pass: configService.get('EMAIL_PASSWORD'), //  password
            // api_key: 'e8c008fe26aaeedfa212ec61e6f86295-81bd92f8-b25d282c',
            // domain: 'https://api.mailgun.net/v3/pi2p.co',
          },
        },
        defaults: {
          from: configService.get('EMAIL_FROM'), // outgoing email ID
        },
        template: {
          dir: process.cwd() + '/templates/emails/',
          adapter: new HandlebarsAdapter(), // or new PugAdapter()
          options: {
            strict: true,
          },
        },
      }),
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    EmailService,
    EmailSchedulingService,
    RidesService,
    PaymentsService,
    TransactionsService,
    ReviewsService,
    ConfigsService,
    CurrenciesService,
    LocationsService,
    VehicleCategoriesService,
    VehiclesService,
    RolesService,
  ],
  exports: [PrismaService],
})
export class AppModule {}
