const bcrypt = require('bcryptjs');
const REGEX_UPPER_LOWER_NUMBER_SPECIAL = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&])[\S]+/;

const UsersServices = {

  getAllUsers(knex) {
    return knex
      .from('live_alert_users')
      .select('*');
  },

  insertUser(knex, newUser) {
    return knex
      .insert(newUser)
      .into('live_alert_users')
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },

  getById(knex, id) {
    return knex
      .from('live_alert_users')
      .select('*')
      .where('id', id)
      .first();
  },

  deleteUser(knex, id) {
    return knex('live_alert_users')
      .where({ id })
      .delete();
  },

  updateUser(knex, id, newUserFields) {
    return knex('live_alert_users')
      .where({ id })
      .update(newUserFields);
  },
  //used to validate create account password
  validatePassword(password) {
    if (password.length < 8) {
      return 'Password be longer than 8 characters';
    }
    if (password.length > 72) {
      return 'Password be less than 72 characters';
    }
    if (password.startsWith(' ') || password.endsWith(' ')) {
      return 'Password must not start or end with empty spaces';
    }
    if (!REGEX_UPPER_LOWER_NUMBER_SPECIAL.test(password)) {
      return 'Password must contain one upper case, lower case, number and special character';
    }
    return null;
  },

  hashPassword(password) {
    return bcrypt.hash(password, 12);
  },

  hasUserWithEmail(db, email) {
    return db('live_alert_users')
      .where({ email })
      .first()
      .then(user => !!user);
  },
  getUserWithEmail(db, email) {
    return db('live_alert_users')
      .where({ email })
      .first();
  },
};

module.exports = UsersServices;
