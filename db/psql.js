const { Pool }  = require('pg');

const {
  PSQL_USER,
  PSQL_HOST,
  PSQL_DB,
  PSQL_PASSWORD,
  PSQL_PORT
} = process.env;

const pool = new Pool({
  user: PSQL_USER,
  host: PSQL_HOST,
  database: PSQL_DB,
  password: PSQL_PASSWORD,
  port: PSQL_PORT,
  ssl: true,
  max: 20,
  min: 4,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 10000
});

module.exports = { psql: pool };



