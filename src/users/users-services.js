//UsersServices are some base table query functions for the PostgreSQL live_alert_users table 
const UsersServices = {
  //adds user to user database live_alert_users
  insertUser(knex, newUser) {
    return knex
      .insert(newUser)
      .into('live_alert_users')
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },
  //gets user by user.id from live_alert_users database
  getById(knex, id) {
    return knex
      .from('live_alert_users')
      .select('*')
      .where('id', id)
      .first();
  },
  //deletes user by user.id from live_alert_users database
  deleteUser(knex, id) {
    return knex('live_alert_users')
      .where({ id })
      .delete();
  },
};

module.exports = UsersServices;
