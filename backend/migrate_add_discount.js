const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE
});

const alterQuery = "ALTER TABLE sales ADD COLUMN discount DECIMAL(10,2) NOT NULL DEFAULT 0.00 AFTER total_amount";

connection.query(alterQuery, (err, results) => {
  if (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('Column already exists.');
    } else {
      console.error('Error adding column:', err);
      process.exit(1);
    }
  } else {
    console.log('Successfully added discount column to sales table.');
  }
  connection.end();
});
