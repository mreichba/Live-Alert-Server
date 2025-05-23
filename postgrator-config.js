require('dotenv').config();
//sets PostgreSQL for migration of tables and equips an SSL header needed for PostgreSQL

console.log('Postgrator is using:', process.env.NODE_ENV, process.env.DATABASE_URL);

module.exports = {
  migrationsDirectory: 'migrations',
  driver: 'pg',
  connectionString: 
    process.env.NODE_ENV === 'test'
    ? process.env.TEST_DATABASE_URL
    : process.env.DATABASE_URL,
  ssl: !!process.env.SSL
};