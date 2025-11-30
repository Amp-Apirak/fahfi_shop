const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

const checkSchema = async () => {
  try {
    const [columns] = await connection.promise().query(`SHOW COLUMNS FROM sales`);
    console.log(columns);
    
    // Check SUM
    const [sumResult] = await connection.promise().query(`SELECT SUM(discount) AS totalDiscount FROM sales WHERE 1=1`);
    console.log('SUM(discount):', sumResult);

    // Check SUM with date filter (Today)
    const today = new Date().toISOString().split('T')[0];
    const [sumToday] = await connection.promise().query(`SELECT SUM(discount) AS totalDiscount FROM sales WHERE DATE(sale_date) BETWEEN ? AND ?`, [today, today]);
    console.log(`SUM(discount) for ${today}:`, sumToday);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

checkSchema();
