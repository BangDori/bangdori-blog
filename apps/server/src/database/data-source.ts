import 'dotenv/config';
import { DataSource } from 'typeorm';
import { entities } from '@database/entities';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities,
  migrations: ['src/database/migration/*.ts'],
  synchronize: false,
  installExtensions: false,
});
