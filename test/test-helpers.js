const AuthServices = require('../src/auth/auth-services')
const bcrypt = require('bcryptjs')


function makeUsersArray() {
  return [
    {
      id: 1,
      email: 'mreichba@mail.usf.edu',
      nick_name: 'mason',
      password: '$2a$12$bLw1pKMVWyu1NHvbpN80/eoMeC63X.oGnR1H4hWr6K4CgWSDk5chu',
      safeword: 'apex',
    },
    {
      id: 2,
      email: 'gz32drift@gmail.com',
      nick_name: 'mace',
      password: '$2a$12$bLw1pKMVWyu1NHvbpN80/eoMeC63X.oGnR1H4hWr6K4CgWSDk5chu',
      safeword: 'drifter',
    },
    {
      id: 3,
      email: 'test@test.com',
      nick_name: 'nick',
      password: '$2a$12$bLw1pKMVWyu1NHvbpN80/eoMeC63X.oGnR1H4hWr6K4CgWSDk5chu',
      safeword: 'test',
    },
  ];
}


function makeContactsArray(users) {
  return [
    {
      id: 1,
      user_id: users[0].id,
      user_contacts: users[1].id,
    },
    {
      id: 2,
      user_id: users[0].id,
      user_contacts: users[2].id,
    },
    {
      id: 3,
      user_id: users[1].id,
      user_contacts: users[0].id,
    },
    {
      id: 4,
      user_id: users[1].id,
      user_contacts: users[2].id,
    },
    {
      id: 5,
      user_id: users[2].id,
      user_contacts: users[0].id,
    },
    {
      id: 6,
      user_id: users[2].id,
      user_contacts: users[1].id,
    },

  ];
}


function makeAlertsArray(users) {
  return [
    {
      id: 1,
      user_id: users[0].id,
      alert_time: '2019-01-03T05:00:00.000Z',
      latitude: 27.933448799999997,
      longitude: -82.34280249999999,
      alert_active: 'true'
    },
    {
      id: 2,
      user_id: users[1].id,
      alert_time: '2019-01-03T05:00:00.000Z',
      latitude: 27.933448799999997,
      longitude: -82.34280249999999,
      alert_active: 'false'
    },

  ];
}

function makeTablesFixture() {
  const testUsers = makeUsersArray();
  const testAlerts = makeAlertsArray(testUsers);
  const testContacts = makeContactsArray(testUsers);
  return { testUsers, testAlerts, testContacts };
}

function seedTables(db, users, contacts, alerts) {
  // uses a transaction to group the queries and auto rollback on any failure
  return db.transaction(async trx => {
    await trx.into('live_alert_users').insert(users)
    await trx.into('live_alert_contacts').insert(contacts)
    // update the auto sequence to match the forced id values
    await Promise.all([
      trx.raw(
        `SELECT setval('live_alert_users_id_seq', ?)`,
        [users[users.length - 1].id],
      ),
      trx.raw(
        `SELECT setval('live_alert_contacts_id_seq', ?)`,
        [contacts[contacts.length - 1].id],
      ),
    ])
    // only insert alerts if there are some, also update the sequence counter
    if (alerts.length) {
      await trx.into('live_alert_alerts').insert(alerts)
      await trx.raw(
        `SELECT setval('live_alert_alerts_id_seq', ?)`,
        [alerts[alerts.length - 1].id],
      )
    }
  })
}

function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }))
  return db.into('live_alert_users').insert(preppedUsers)
    .then(() =>
      // update the auto sequence to stay in sync
      db.raw(
        `SELECT setval('live_alert_users_id_seq', ?)`,
        [users[users.length - 1].id],
      )
    )
}

function makeAuthHeader(user) {
  const sub = user.email;
  const payload = { user_id: user.id };
  const token = AuthServices.createJwt(sub, payload);
  return `Bearer ${token}`;
}

module.exports = {
  makeUsersArray,
  makeAlertsArray,
  makeContactsArray,
  makeTablesFixture,
  seedTables,
  seedUsers,
  makeAuthHeader,

};