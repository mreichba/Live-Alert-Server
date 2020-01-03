const path = require('path');
const express = require('express');
const xss = require('xss');
const ContactsServices = require('./contacts-services');
const jwt = require('../middleware/jwt-auth');

const contactsRouter = express.Router();
const jsonParser = express.json();

const serializeContact = contact => ({
  id: contact.id,
  user_id: contact.user_id,
  user_contacts: contact.user_contacts,
});

contactsRouter
  .route('/')
  .all(jwt)
  .get((req, res, next) => {
    ContactsServices.getAllContacts(req.app.get('db'), req.user.id) //equals knexInstance
      .then(contacts => {
        res.json(contacts.map(serializeContact));
      })
      .catch(next);
  })

  .post(jsonParser, (req, res, next) => {
    const { user_id, user_contacts } = req.body;
    const newContact = { user_id, user_contacts };
    for (const [key, value] of Object.entries(newContact)) {
      if (value == null) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });
      }
    }
    ContactsServices.insertContact(
      req.app.get('db'),
      newContact
    )

      .then(contact => {
        res
          .status(201)
          .location(path.posix.join(req.originalUrl + `/${contact.id}`))
          .json(serializeContact(contact));
      })
      .catch(next);
  });

contactsRouter
  .route('/:contact_id')
  .all(jwt)
  .all((req, res, next) => {
    ContactsServices.getById(
      req.app.get('db'),
      req.params.contact_id,
      req.user.id
    )
      .then(contact => {
        if (!contact) {
          return res.status(404).json({
            error: { message: `Contact doesn't exist` }
          });
        }
        res.contact = contact;
        next();
      })
      .catch(next);
  })

  .get((req, res, next) => {
    res.json(serializeContact(res.contact));
  })

  .delete((req, res, next) => {
    ContactsServices.deleteContact(
      req.app.get('db'),
      req.params.contact_id
    )
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = contactsRouter;