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
  .get((req, res, next) => {
    UsersServices.getAllUsers(req.app.get('db'))
      .then(users => {
        res.json(users.map(serializeUser));
      })
      .catch(next);
  })
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
//******FOR WHEN ADMIN PAGE IS ADDED */
// usersRouter
//   .route('/:user_id')
//   .all(jwt)//protects all ../user_id endpoints with JWT
//   .all((req, res, next) => {
//     UsersServices.getById(
//       req.app.get('db'),
//       req.params.user_id
//     )
//       .then(user => {
//         if (!user) {
//           return res.status(404).json({
//             error: { message: 'User doesn\'t exist' }
//           });
//         }
//         res.user = user;
//         next();
//       })
//       .catch(next);
//   })
//   .get((req, res, next) => {
//     res.json(serializeUser(res.user));
//   })
//   .delete((req, res, next) => {
//     UsersServices.deleteUser(
//       req.app.get('db'),
//       req.params.user_id
//     )
//       .then(() => {
//         res.status(204).end();
//       })
//       .catch(next);
//   })
//   .patch(jsonParser, (req, res, next) => {
//     const { nick_name, password, safeword } = req.body;
//     const userToUpdate = { nick_name, password, safeword };
//     const numberOfValues = Object.values(userToUpdate).filter(Boolean).length;
//     if (numberOfValues === 0) {
//       return res.status(400).json({
//         error: {
//           message: 'Request body must contain either \'nick_name\', \'password\' or \'safeword\''
//         }
//       });
//     }
//     UsersServices.updateUser(
//       req.app.get('db'),
//       req.params.user_id,
//       userToUpdate
//     )
//       .then(() => {
//         res.status(204).end();
//       })
//       .catch(next);
//   });

module.exports = usersRouter;