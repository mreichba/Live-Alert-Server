const express = require('express');
const xss = require('xss');
const UsersServices = require('./users-services');
const bcrypt = require('bcryptjs');
const jwt = require('../middleware/jwt-auth');
const usersRouter = express.Router();
const jsonParser = express.json();

//tidy serialize function that also prevents xss attacks
const serializeUser = user => ({
  id: user.id,
  nick_name: xss(user.nick_name),
  email: xss(user.email),
  password: xss(user.password),
  safeword: xss(user.safeword),
});

//Router for user home that shows nick_name in nav (/api/users/home)
usersRouter
  .route('/home')
  .all(jwt)//protects all ../home endpoints with JWT
  .get((req, res) => {
    return res.json(
      { nick_name: req.user.nick_name }
    );
  });

//Router for users (/api/users)
usersRouter
  .route('/')
  .all(jwt) //protects all / endpoints with JWT
  //deletes current user account
  .delete(jsonParser, (req, res, next) => {
    const userId = req.user.id;
    const password = req.body.password;
    const email = req.body.email;
    //gets current user by user id
    UsersServices.getById(req.app.get('db'), userId)
      .then(user => {
        //compares current user credentials with account being deleted credentials
        if (user.email === email && bcrypt.compareSync(password, user.password)) {
          //deletes current user id from user database
          UsersServices.deleteUser(
            req.app.get('db'),
            req.user.id
          )
            .then(() => {
              res.status(204).end();
            })
            .catch(next);
        } else {
          res.status(401)
            .end();
        }
      });
  });

module.exports = usersRouter;