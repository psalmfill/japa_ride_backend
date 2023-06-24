import { PrismaService } from './prisma/prisma.service';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { PrismaClientExceptionFilter } from './utils/filters/prisma-exception-filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService: ConfigService = app.get(ConfigService);
  const config = new DocumentBuilder()
    .setTitle('Jappa Ride')
    .setDescription('The Jappa Ride API description')
    .setVersion('1.0')
    .addTag('Jappa_ride')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(
    //  new AllExceptionsFilter(),
    new PrismaClientExceptionFilter(httpAdapter),
  );
  await app.listen(configService.get<number>('PORT', 3000));
}
bootstrap();
