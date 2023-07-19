const mysql = require("mysql");

exports.pool = mysql.createPool({
  connectionLimit: 50,
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DB,
  multipleStatements: true,
});
