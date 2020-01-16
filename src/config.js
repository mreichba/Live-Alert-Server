//these config variables will be set in .env or default option if none exist in .env
module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://alert@localhost/live-alert',
  TEST_DATABASE_URL: process.env.DATABASE_URL || 'postgresql://alert@localhost/live-alert-test',
  JWT_SECRET: process.env.JWT_SECRET || 'change-this-secret',
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'https://localhost:3000'
};
