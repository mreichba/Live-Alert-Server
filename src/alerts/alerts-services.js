//AlertsServices are some base table query functions for the PostgreSQL live_alert_alerts table 

const AlertsServices = {
  //gets only the users alerts
  getAllMyAlerts(knex, user_id) {
    return knex('live_alert_alerts')
      .select('*')
      .where('user_id', user_id)
      .orderBy('id', 'desc');

  },
  //gets only the contacts alerts, joins all 3 tables so that we can provide the users contacts info utilizing user_id, 
  getAllMyContactAlerts(knex, user_id) {
    return knex('live_alert_contacts')
      .join('live_alert_alerts', 'live_alert_contacts.user_contacts', '=', 'live_alert_alerts.user_id')
      .join('live_alert_users', 'live_alert_contacts.user_contacts', '=', 'live_alert_users.id')
      .where('live_alert_contacts.user_id', user_id)
      .orderBy('live_alert_alerts.alert_time', 'desc');
  },

  insertAlert(knex, newAlert) {
    return knex
      .insert(newAlert)
      .into('live_alert_alerts')
      .returning('*')
      .then(rows => {
        return rows[0];
      });
  },

  getById(knex, id) {
    return knex
      .from('live_alert_alerts')
      .select('*')
      .where('id', id)
      .first();
  },

  deleteAlert(knex, id) {
    return knex('live_alert_alerts')
      .where({ id })
      .delete();
  },
  //used to mark someone safe, only changes active_alert field
  updateAlert(knex, id, newAlertFields) {
    return knex('live_alert_alerts')
      .where({ id })
      .update(newAlertFields);
  }
};

module.exports = AlertsServices;
