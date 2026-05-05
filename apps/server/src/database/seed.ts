import { AppDataSource } from './data-source';

async function seed() {
  await AppDataSource.initialize();
  console.log('Seeding database...');
  // Seed logic will be added here
  console.log('Done.');
  await AppDataSource.destroy();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
