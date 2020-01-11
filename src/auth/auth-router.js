const express = require('express');
const AuthServices = require('./auth-services');
const UsersServices = require('../users/users-services');
const xss = require('xss');
const path = require('path');
const authRouter = express.Router();
const jsonParser = express.json();
//tidy serialize function that also prevents xss attacks
const serializeUser = user => ({
  id: user.id,
  nick_name: xss(user.nick_name),
  email: xss(user.email),
  // password: xss(user.password),
  safeword: xss(user.safeword),
});
//Router for sign-up page
authRouter
  .post('/sign-up', jsonParser, (req, res, next) => {
    const { nick_name, email, password, safeword } = req.body;
    const newUser = { nick_name, email, password, safeword };

    for (const [key, value] of Object.entries(newUser)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });
      }
    }
    //validates password
    const passwordError = UsersServices.validatePassword(password);

    if (passwordError)
      return res.status(400).json({ error: passwordError });

    UsersServices.hasUserWithEmail(
      req.app.get('db'),
      email
    )
      .then(hasUserWithEmail => {//verifies user doesnt already exist
        if (hasUserWithEmail)
          return res.status(400).json({ error: 'Email already taken' });
        //hashs the password
        return UsersServices.hashPassword(password)
          .then(hashedPassword => {
            const newUser = {
              nick_name,
              email,
              password: hashedPassword,
              safeword,
            };
            //inserts new user into user database
            UsersServices.insertUser(
              req.app.get('db'),
              newUser
            )
              .then(user => {
                res
                  .status(201)
                  .json(serializeUser(user));
              })
              .catch(next);
          });
      });
  });
//Router for login
authRouter
  .post('/login', jsonParser, (req, res, next) => {
    const { email, password } = req.body;
    const loginUser = { email, password };

    for (const [key, value] of Object.entries(loginUser))
      if (value == null)
        return res.status(400).json({
          error: `Missing '${key}' in request body`
        });
    //checks user database for login email
    AuthServices.getUserWithEmail(
      req.app.get('db'),
      loginUser.email
    )
      .then(dbUser => {
        if (!dbUser) //verifies user
          return res.status(400).json({
            error: 'Incorrect email or password',
          });
        //compares login pass with hashed pass
        return AuthServices.comparePasswords(loginUser.password, dbUser.password)
          .then(compareMatch => {
            if (!compareMatch)
              return res.status(400).json({
                error: 'Incorrect email or password',
              });
            //creates JWT Token
            const sub = dbUser.email;
            const payload = { user_id: dbUser.id };
            res.send({
              authToken: AuthServices.createJwt(sub, payload),
              user_id: dbUser.id
            });
          });
      })
      .catch(next);
  });




module.exports = authRouter;