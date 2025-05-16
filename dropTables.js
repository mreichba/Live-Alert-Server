// dropTables.js
require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const useSSL = process.env.SSL === 'true';
const connectionString = process.env.NODE_ENV === 'test'
  ? process.env.TEST_DATABASE_URL
  : process.env.DATABASE_URL || 'postgresql://alert:123@localhost/live-alert';

const client = new Client({
  connectionString,
  ssl: useSSL ? { rejectUnauthorized: false } : false
});

const migrationsPath = path.join(__dirname, 'migrations');

async function dropTables() {
  try {
    await client.connect();
    console.log(`\n🧨 Dropping tables for ${process.env.NODE_ENV || 'development'} using:\n${connectionString}\n`);

    const files = fs.readdirSync(migrationsPath)
      .filter(f => f.endsWith('.sql'))
      .sort()
      .reverse(); // IMPORTANT: Drop in reverse order

    for (const file of files) {
      const filePath = path.join(migrationsPath, file);
      const sqlContent = fs.readFileSync(filePath, 'utf8');
      const downSql = sqlContent.split('-- +migration Down')[1]?.trim();

      if (!downSql) {
        console.warn(`⚠️ Skipping ${file} — no valid '-- +migration Down' section`);
        continue;
      }

      console.log(`🧹 Dropping from: ${file}`);
      await client.query(downSql);
      console.log(`✅ Dropped: ${file}\n`);
    }

    console.log('💥 All tables dropped.\n');
  } catch (err) {
    console.error('❌ Drop failed:', err.message);
  } finally {
    await client.end();
  }
}

dropTables();