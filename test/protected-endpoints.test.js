const knex = require('knex');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Protected Enpoints', function () {
  let db;

  const {
    testUsers,
    testContacts,
    testAlerts
  } = helpers.makeTablesFixture();

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });

    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());
  before('cleanup', () => db.raw('TRUNCATE live_alert_users, live_alert_alerts, live_alert_contacts RESTART IDENTITY CASCADE'));
  afterEach('cleanup', () => db.raw('TRUNCATE live_alert_users, live_alert_alerts, live_alert_contacts RESTART IDENTITY CASCADE'));
  beforeEach('insert data to tables', () =>
    helpers.seedTables(
      db,
      testUsers,
      testContacts,
      testAlerts
    )
  );

  const protectedEndpoints = [
    // {
    //   name: 'GET /api/users',
    //   path: '/api/users',
    //   method: supertest(app).get,
    // },
    {
      name: 'DELETE /api/users',
      path: '/api/users',
      method: supertest(app).get,
    },
    // {
    //   name: 'GET /api/users/:user_id',
    //   path: '/api/users/1',
    //   method: supertest(app).get,
    // },
    // {
    //   name: 'DELETE /api/users/:user_id',
    //   path: '/api/users/1',
    //   method: supertest(app).get,
    // },
    // {
    //   name: 'PATCH /api/users/:user_id',
    //   path: '/api/users/1',
    //   method: supertest(app).get,
    // },
    {
      name: 'GET /api/users/home',
      path: '/api/users/home',
      method: supertest(app).get,
    },
    {
      name: 'GET /api/contacts',
      path: '/api/contacts',
      method: supertest(app).get,
    },
    // {
    //   name: 'GET /api/contacts/:contact_id',
    //   path: '/api/contacts/2',
    //   method: supertest(app).get,
    // },
    {
      name: 'GET /api/alerts',
      path: '/api/alerts',
      method: supertest(app).get,
    },
    {
      name: 'POST /api/alerts',
      path: '/api/alerts',
      method: supertest(app).get,
    },
    {
      name: 'PATCH /api/alerts/:alert_id',
      path: '/api/alerts/1',
      method: supertest(app).get,
    },
    {
      name: 'GET /api/alerts/contact-alerts',
      path: '/api/alerts/contact-alerts',
      method: supertest(app).get,
    },
  ];


  protectedEndpoints.forEach(endpoint => {
    describe(endpoint.name, () => {

      it('responds 401 \'Missing basic token\' when no basic token', () => {
        return endpoint.method(endpoint.path)
          .expect(401, { error: 'Missing bearer token' });
      });

      it('responds 401 \'Unauthorized request\' when no credentials in token', () => {
        const userNoCreds = { email: '', password: '' };
        return endpoint.method(endpoint.path)
          .set('Authorization', helpers.makeAuthHeader(userNoCreds))
          .expect(401, { error: 'Unauthorized request' });
      });

      it('responds 401 \'Unauthorized request\' when invalid email', () => {
        const userInvalidCreds = { email: 'email-not', password: 'existy' };
        return endpoint.method(endpoint.path)
          .set('Authorization', helpers.makeAuthHeader(userInvalidCreds))
          .expect(401, { error: 'Unauthorized request' });
      });

      // it.only('responds 401 \'Unauthorized request\' when invalid password', () => {
      //   const userInvalidPass = { email: testUsers[0].email, password: 'wrong' };
      //   return endpoint.method(endpoint.path)
      //     .set('Authorization', helpers.makeAuthHeader(userInvalidPass))
      //     .expect(401, { error: 'Unauthorized request' });
      // });

      it('responds 200 \'OK\' when valid credentials', () => {
        const userValidCreds = { email: testUsers[0].email, password: testUsers[0].password };
        return endpoint.method(endpoint.path)
          .set('Authorization', helpers.makeAuthHeader(userValidCreds))
          .expect(200);
      });

    });
  });
});