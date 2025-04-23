const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const useSSL = process.env.SSL === 'true';
const connectionString = process.env.NODE_ENV === 'test'
  ? process.env.TEST_DATABASE_URL
  : process.env.DATABASE_URL || 'postgresql://alert:123@localhost/live-alert';

const client = new Client({
  connectionString,
  ssl: useSSL ? { rejectUnauthorized: false } : false,
});

const seedFilePath = path.join(__dirname, 'seeds', 'seed.tables.sql');

async function runSeed() {
  try {
    await client.connect();
    console.log(`🌱 Seeding database: ${connectionString}`);
    const seedSQL = fs.readFileSync(seedFilePath, 'utf8');
    await client.query(seedSQL);
    console.log('✅ Seed complete!');
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await client.end();
  }
}

runSeed();