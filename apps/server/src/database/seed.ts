import { AppDataSource } from '@database/data-source';

async function seed() {
  await AppDataSource.initialize();
  console.log('Seeding database...');
  console.log('Done.');
  await AppDataSource.destroy();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
