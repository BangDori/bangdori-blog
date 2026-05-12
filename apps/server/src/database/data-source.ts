import 'dotenv/config';
import { entities } from '@database/entities';
import { DataSource } from 'typeorm';

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities,
  migrations: ['src/database/migration/*.ts'],
  synchronize: false,
  installExtensions: false,
});
