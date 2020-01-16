//ContactsServices are some base table query functions for the PostgreSQL live_alert_contacts table 

const ContactsServices = {
  //joins users and contacts tables to get variable values in ".select()" field
  getAllContacts(knex, user_id) {
    return knex('live_alert_contacts')
      .join('live_alert_users', 'live_alert_users.id', '=', 'live_alert_contacts.user_contacts')
      .select('nick_name', 'email', 'user_contacts')
      .where('live_alert_contacts.user_id', user_id);
  },
  //inserts new contact into contacts database using user_id as the logged in users id and the contact_id as the user_id of the contact.
  insertContact(knex, contact_id, user_id) {
    const newContact = {
      user_id,
      user_contacts: contact_id
    };
    return knex
      .insert(newContact)
      .into('live_alert_contacts')
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },
  //uses contacts and users tables to check if the current user.id(user_id) has a contact with contacts user.id (contact_id)
  getById(knex, contact_id, user_id) {
    return knex
      .from('live_alert_contacts')
      .select('*')
      .innerJoin('live_alert_users', 'live_alert_contacts.user_contacts', '=', 'live_alert_users.id')
      .where({ user_id, user_contacts: contact_id })
      .first();
  },
  //deletes a contact where its contact.id (user_contacts) is id
  deleteContact(knex, id) {
    return knex('live_alert_contacts')
      .where('user_contacts', id)
      .delete();
  },
};

module.exports = ContactsServices;
