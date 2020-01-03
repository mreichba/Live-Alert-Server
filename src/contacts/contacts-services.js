const ContactsServices = {

  getAllContacts(knex, user_id) {
    return knex.select('*').from('live_alert_contacts')
      .where('user_id', user_id);
  },

  insertContact(knex, newContact) {
    return knex
      .insert(newContact)
      .into('live_alert_contacts')
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },

  getById(knex, contact_id, user_id) {
    console.log(contact_id);
    console.log(user_id);
    return knex
      .from('live_alert_contacts')
      .select('*')
      // .innerJoin('live_alert_users', 'live_alert_contacts.user_contacts', '=', 'live_alert_users.id')
      .where({ user_id, user_contacts: contact_id })
      .first();
  },

  deleteContact(knex, id) {
    return knex('live_alert_contacts')
      .where({ id })
      .delete();
  },

  updateContact(knex, id, newContactFields) {
    return knex('live_alert_contacts')
      .where({ id })
      .update(newContactFields);
  }
};

module.exports = ContactsServices;
