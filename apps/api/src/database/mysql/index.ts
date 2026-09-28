import mysql from 'mysql2/promise';

import { config } from '../../config/index.js';

export const mysqldb = mysql.createPool({
  host: config.database.turnstile.host,
  user: config.database.turnstile.user,
  password: config.database.turnstile.password,
  database: config.database.turnstile.db,
  waitForConnections: true,
  connectionLimit: 50,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  multipleStatements: false,
});

export async function verifyMySqlConnection() {
  const connection = await mysqldb.getConnection();

  try {
    await connection.ping();
    console.log('MySQL connection verified successfully.');
  } catch (error) {
    console.error('Error verifying MySQL connection:', error);
  } finally {
    connection.release();
  }
}

export function closeMySqlPool() {
  return mysqldb.end();
}
