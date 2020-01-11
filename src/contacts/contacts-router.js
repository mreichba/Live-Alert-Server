const express = require('express');
const xss = require('xss');
const ContactsServices = require('./contacts-services');
const UsersServices = require('../users/users-services');
const jwt = require('../middleware/jwt-auth');
const contactsRouter = express.Router();
const jsonParser = express.json();

//tidy serialize function that also blocks xss attacks
const serializeContact = contact => ({
  id: contact.id,
  user_id: xss(contact.user_id),
  user_contacts: xss(contact.user_contacts),
});
//checks for contact email in contact database before adding it to contacts list preventing duplication
function checkContact(req, res, next) {
  const { email } = req.body;

  if (!email) {//verifies email exists
    return res.status(400).json({
      error: { message: 'ERROR: Missing email in request body' }
    });
  }
  //gets user using email from user database
  UsersServices.getUserWithEmail(req.app.get('db'), email)
    .then(user => {
      if (!user) {
        return res.status(400).json({
          error: { message: 'ERROR: User does not exist' }
        });
      }
      //gets contacts from contacts database using user id
      ContactsServices.getById(req.app.get('db'), user.id, req.user.id)
        .then(contact => {
          if (contact) {
            return res.status(400).json({
              error: { message: 'ERROR: Contact already exists' }
            });
          }
          req.contact = user;
          next();
        });

    });
}
//Router for contacts (/api/contacts)
contactsRouter
  .route('/')
  .all(jwt)//protects all / endpoints with JWT
  .get((req, res, next) => {
    //gets all the contacts for signed in user
    ContactsServices.getAllContacts(req.app.get('db'), req.user.id)
      .then(contacts => {
        res.json(contacts);
      })
      .catch(next);
  })
  //POST utilizes a json parser and the checkContact feature from above for every post request
  .post(jsonParser, checkContact, (req, res, next) => {
    const user_id = req.user.id;
    const contact_id = req.contact.id;
    //inserts new contact into contacts database
    ContactsServices.insertContact(
      req.app.get('db'),
      contact_id,
      user_id
    )
      .then(contact => {
        res
          .status(201)
          .json(serializeContact(contact));
      })
      .catch(next);
  });
//*******FOR WHEN ADMIN PAGE IS ADDED */
// contactsRouter
//   .route('/:contact_id')
//   .all(jwt)//protects all / endpoints with JWT
//   .all((req, res, next) => {
//     ContactsServices.getById(
//       req.app.get('db'),
//       req.params.contact_id,
//       req.user.id
//     )
//       .then(contact => {
//         if (!contact) {
//           return res.status(404).json({
//             error: { message: `Contact doesn't exist` }
//           });
//         }
//         res.contact = contact;
//         next();
//       })
//       .catch(next);
//   })

//   .get((req, res, next) => {
//     res.json(serializeContact(res.contact));
//   })

//   .delete((req, res, next) => {
//     ContactsServices.deleteContact(
//       req.app.get('db'),
//       req.params.contact_id
//     )
//       .then(() => {
//         res.status(204).end();
//       })
//       .catch(next);
//   });

module.exports = contactsRouter;