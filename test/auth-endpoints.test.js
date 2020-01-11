const knex = require('knex');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe('Auth Endpoints', function () {
  let db;

  const { testUsers } = helpers.makeTablesFixture();
  const testUser = testUsers[0];

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());
  //cleans all 3 tables before and after each testsuite
  before('cleanup', () => db.raw('TRUNCATE live_alert_users, live_alert_alerts, live_alert_contacts RESTART IDENTITY CASCADE'));
  afterEach('cleanup', () => db.raw('TRUNCATE live_alert_users, live_alert_alerts, live_alert_contacts RESTART IDENTITY CASCADE'));

  describe('POST /api/auth/login', () => {

    beforeEach('insert users', () =>
      helpers.seedUsers(db, testUsers)
    );

    const requiredFields = ['email', 'password'];

    requiredFields.forEach(field => {
      const loginAttemptBody = {
        email: testUser.email,
        password: testUsers.password
      };

      it(`Responds with a 400 required error when '${field}' is missing`, () => {
        delete loginAttemptBody[field];

        return supertest(app)
          .post('/api/auth/login')
          .send(loginAttemptBody)
          .expect(400, {
            error: `Missing '${field}' in request body`,
          });
      });
    });

    it('responds 400 \'invalid user_name or password\' when bad email', () => {
      const userInvalidEmail = { email: 'email-not', password: 'existy' };
      return supertest(app)
        .post('/api/auth/login')
        .send(userInvalidEmail)
        .expect(400, { error: 'Incorrect email or password' });
    });

    it('responds 400 \'invalid email or password\' when bad password', () => {
      const userInvalidPass = { email: testUser.email, password: 'incorrect' };
      return supertest(app)
        .post('/api/auth/login')
        .send(userInvalidPass)
        .expect(400, { error: 'Incorrect email or password' });
    });

    it('responds 200 and JWT auth token using secret when valid credentials', () => {
      const userValidCreds = {
        email: testUser.email,
        password: testUser.password,
      };
      const expectedToken = jwt.sign(
        { user_id: testUser.id }, // payload
        process.env.JWT_SECRET,
        {
          subject: testUser.email,
          algorithm: 'HS256',
        }
      );
      return supertest(app)
        .post('/api/auth/login')
        .send(userValidCreds)
        .expect(200, {
          authToken: expectedToken, user_id: testUser.id
        });
    });

  });

  describe('POST /api/auth/sign-up', () => {
    it('responds 201 when user is created valid credentials', () => {
      const newUserInputs = {
        nick_name: 'test',
        email: 'test1@test.com',
        password: 'Password',
        safeword: 'safe'
      };
      return supertest(app)
        .post('/api/auth/sign-up')
        .send(newUserInputs)
        .expect(201);
    });
  });

});