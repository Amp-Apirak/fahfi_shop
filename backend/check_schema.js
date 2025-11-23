const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

connection.query("SHOW COLUMNS FROM sales LIKE 'discount'", (err, results) => {
  if (err) {
    console.error('Error checking schema:', err);
  } else {
    if (results.length > 0) {
      console.log('Column discount EXISTS.');
    } else {
      console.log('Column discount DOES NOT EXIST.');
    }
  }
  connection.end();
});
