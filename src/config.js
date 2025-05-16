//these config variables will be set in .env or default option if none exist in .env
module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres@localhost/live-alert',
  TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://postgres@localhost/live-alert-test',
  JWT_SECRET: process.env.JWT_SECRET || 'change-this-secret'
};
