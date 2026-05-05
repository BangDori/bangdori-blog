import 'dotenv/config';
import { DataSource } from 'typeorm';
import { entities } from './entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities,
  migrations: ['src/migration/*.ts'],
  synchronize: false,
});
