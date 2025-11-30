const mysql = require('mysql2');
require('dotenv').config();

const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

const alterTable = async () => {
  try {
    const [columns] = await connection.promise().query(`SHOW COLUMNS FROM sales LIKE 'payment_method'`);
    
    if (columns.length === 0) {
      await connection.promise().query(`
        ALTER TABLE sales 
        ADD COLUMN payment_method VARCHAR(50) DEFAULT 'cash'
      `);
      console.log('✅ Added payment_method column to sales table.');
    } else {
      console.log('ℹ️ Column payment_method already exists.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error altering table:', error);
    process.exit(1);
  }
};

alterTable();
