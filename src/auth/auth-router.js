const express = require('express');
const AuthServices = require('./auth-services');
const UsersServices = require('../users/users-services');
const xss = require('xss');
const path = require('path');


const authRouter = express.Router();
const jsonParser = express.json();

const serializeUser = user => ({
  id: user.id,
  nick_name: xss(user.nick_name),
  email: xss(user.email),
  password: xss(user.password),
  safeword: xss(user.safeword),
});

authRouter
  .post('/sign-up', jsonParser, (req, res, next) => {
    const { nick_name, email, password, safeword } = req.body;
    const newUser = { nick_name, email, password, safeword };
    console.log(newUser);

    for (const [key, value] of Object.entries(newUser)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });
      }
    }
    // const passwordError = UsersServices.validatePassword(password);

    // if (passwordError)
    //   return res.status(400).json({ error: passwordError });

    UsersServices.hasUserWithEmail(
      req.app.get('db'),
      email
    )
      .then(hasUserWithEmail => {
        if (hasUserWithEmail)
          return res.status(400).json({ error: 'Email already taken' });

        return UsersServices.hashPassword(password)
          .then(hashedPassword => {
            const newUser = {
              nick_name,
              email,
              password: hashedPassword,
              safeword,
            };
            UsersServices.insertUser(
              req.app.get('db'),
              newUser
            )
              .then(user => {
                res
                  .status(201)
                  .location(path.posix.join(req.originalUrl + `/${user.id}`))
                  .json(serializeUser(user));
              })
              .catch(next);
          });
      });
  });

authRouter
  .post('/login', jsonParser, (req, res, next) => {
    const { email, password } = req.body;
    const loginUser = { email, password };

    for (const [key, value] of Object.entries(loginUser))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        });

    AuthServices.getUserWithEmail(
      req.app.get('db'),
      loginUser.email
    )
      .then(dbUser => {
        if (!dbUser)
          return res.status(400).json({
            error: 'Incorrect email or password',
          });

        return AuthServices.comparePasswords(loginUser.password, dbUser.password)
          .then(compareMatch => {
            if (!compareMatch)
              return res.status(400).json({
                error: 'Incorrect email or password',
              });

            const sub = dbUser.email;
            const payload = { user_id: dbUser.id }; //might have to change user_id
            res.send({
              authToken: AuthServices.createJwt(sub, payload),
              user_id: dbUser.id
            });
          });
      })
      .catch(next);
  });




module.exports = authRouter;