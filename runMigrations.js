require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const useSSL = process.env.SSL === 'true';
const connectionString = process.env.NODE_ENV === 'test'
  ? process.env.TEST_DATABASE_URL
  : process.env.DATABASE_URL;

const client = new Client({
  connectionString,
  ssl: useSSL ? { rejectUnauthorized: false } : false
});

const migrationsPath = path.join(__dirname, 'migrations');

async function runMigrations() {
  try {
    await client.connect();
    console.log(`\n🚀 Running migrations for ${process.env.NODE_ENV || 'development'} using:\n${connectionString}\n`);

    const files = fs.readdirSync(migrationsPath)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of files) {
      const filePath = path.join(migrationsPath, file);
      const sqlContent = fs.readFileSync(filePath, 'utf8');
      const upSql = sqlContent.split('-- +migration Up')[1]?.split('-- +migration Down')[0]?.trim();

      if (!upSql) {
        console.warn(`⚠️ Skipping ${file} — no valid '-- +migration Up' section`);
        continue;
      }

      console.log(`📄 Applying: ${file}`);
      await client.query(upSql);
      console.log(`✅ Applied: ${file}\n`);
    }

    console.log('🎉 All migrations complete.\n');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
  } finally {
    await client.end();
  }
}

runMigrations();