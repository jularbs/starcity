import mysql from 'mysql';
import { config } from '../../config/index.js';

export const pool = mysql.createPool({
  connectionLimit: 50,
  host: config.database.turnstile.host,
  user: config.database.turnstile.user,
  password: config.database.turnstile.password,
  database: config.database.turnstile.db,
  multipleStatements: true,
});
