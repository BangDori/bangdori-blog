import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';
import { Logger } from 'nestjs-pino';
import { AppModule } from '@/app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ forbidNonWhitelisted: true, whitelist: true }));
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',').map((s) => s.trim()),
    credentials: true,
  });
  await app.listen(Number(process.env.PORT ?? 4000));
}

bootstrap();
