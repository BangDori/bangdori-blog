import { Module } from '@nestjs/common';
import { LoggerModule as PinoLoggerModule } from 'nestjs-pino';

const isDev = process.env.NODE_ENV !== 'production';

@Module({
  imports: [
    PinoLoggerModule.forRoot({
      pinoHttp: {
        level: isDev ? 'debug' : 'info',
        transport: isDev ? { target: 'pino-pretty' } : undefined,
      },
    }),
  ],
})
export class LoggerModule {}
