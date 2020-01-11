require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const app = express();
const alertsRouter = require('./alerts/alerts-router');
const usersRouter = require('./users/users-router');
const contactsRouter = require('./contacts/contacts-router');
const authRouter = require('./auth/auth-router');
//logger options that change based on environment
const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption));
app.use(helmet());//helps secure http headers
app.use(cors());//allows cross origin resource sharing
//enables routers for use
app.use('/api/auth', authRouter);
app.use('/api/alerts', alertsRouter);
app.use('/api/users', usersRouter);
app.use('/api/contacts', contactsRouter);

app.get('/', (req, res) => {
  res.send('Hello, world!');
});
//middleware that catches errors from app
app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } };
  } else {
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;