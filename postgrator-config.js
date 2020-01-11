require('dotenv').config();
//sets PostgreSQL for migration of tables and equips an SSL header needed for PostgreSQL
module.exports = {
  'migrationsDirectory': 'migrations',
  'driver': 'pg',
  'connectionString': (process.env.NODE_ENV === 'test')
    ? process.env.TEST_DATABASE_URL
    : process.env.DATABASE_URL,
  'ssl': !!process.env.SSL,
};