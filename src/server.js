const knex = require('knex');
const app = require('./app');
const { PORT, DATABASE_URL } = require('./config');
//sets database client as PostgreSQL (db)
const db = knex({
  client: 'pg',
  connection: DATABASE_URL,
});

app.set('db', db);
//server listens on directed port
app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});