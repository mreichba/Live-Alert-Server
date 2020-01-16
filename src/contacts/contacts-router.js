const express = require('express');
const xss = require('xss');
const ContactsServices = require('./contacts-services');
const AuthService = require('../auth/auth-services');
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
  AuthService.getUserWithEmail(req.app.get('db'), email)
    //checks if user exists
    .then(user => {
      if (!user) {
        return res.status(400).json({
          error: { message: 'ERROR: User does not exist' }
        });
      }
      //checks users contacts database using current users id (req.user.id) and user.id from above for existing user contact
      ContactsServices.getById(req.app.get('db'), user.id, req.user.id)
        .then(contact => {
          //checks if contact already exists
          if (contact) {
            return res.status(400).json({
              error: { message: 'ERROR: Contact already exists' }
            });
          }
          req.contact = user; //sets req.contact to user which is used in POST request
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
      contact_id, //user.id of contact
      user_id//current users id
    )
      .then(contact => {
        res
          .status(201)
          .json(serializeContact(contact));
      })
      .catch(next);
  });

module.exports = contactsRouter;