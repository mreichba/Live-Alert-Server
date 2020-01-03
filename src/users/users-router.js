const path = require('path');
const express = require('express');
const xss = require('xss');
const UsersServices = require('./users-services');

const usersRouter = express.Router();
const jsonParser = express.json();
const jwt = require('../middleware/jwt-auth');

const serializeUser = user => ({
  id: user.id,
  nick_name: user.nick_name,
  email: user.email,
  password: user.password,
  safeword: user.safeword,
});

usersRouter
  .route('/')
  .all(jwt)
  .get((req, res, next) => {
    UsersServices.getAllUsers(req.app.get('db')) //equals knexInstance
      .then(users => {
        res.json(users.map(serializeUser));
      })
      .catch(next);
  });

usersRouter
  .route('/:user_id')
  .all((req, res, next) => {
    UsersServices.getById(
      req.app.get('db'),
      req.params.user_id
    )
      .then(user => {
        if (!user) {
          return res.status(404).json({
            error: { message: `User doesn't exist` }
          });
        }
        res.user = user;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(serializeUser(res.user));
  })
  .delete((req, res, next) => {
    UsersServices.deleteUser(
      req.app.get('db'),
      req.params.user_id
    )
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const { nick_name, password, safeword } = req.body;
    const userToUpdate = { nick_name, password, safeword };
    const numberOfValues = Object.values(userToUpdate).filter(Boolean).length;
    if (numberOfValues === 0) {
      return res.status(400).json({
        error: {
          message: `Request body must contain either 'nick_name', 'password' or 'safeword'`
        }
      });
    }
    UsersServices.updateUser(
      req.app.get('db'),
      req.params.user_id,
      userToUpdate
    )
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = usersRouter;