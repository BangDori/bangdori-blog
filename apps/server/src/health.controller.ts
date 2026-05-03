import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from './database/database.service';

@Controller('health')
export class HealthController {
  constructor(private db: DatabaseService) {}

  @Get()
  async check() {
    const dbHealthy = await this.db.isHealthy();

    return {
      ok: dbHealthy,
      service: 'server',
      db: dbHealthy ? 'ok' : 'error',
    };
  }
}
