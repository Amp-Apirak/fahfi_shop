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
    // Check if columns exist
    const [columns] = await connection.promise().query(`SHOW COLUMNS FROM sales LIKE 'received_amount'`);
    
    if (columns.length === 0) {
      await connection.promise().query(`
        ALTER TABLE sales 
        ADD COLUMN received_amount DECIMAL(10,2) DEFAULT 0,
        ADD COLUMN change_amount DECIMAL(10,2) DEFAULT 0
      `);
      console.log('✅ Added received_amount and change_amount columns to sales table.');
    } else {
      console.log('ℹ️ Columns already exist.');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error altering table:', error);
    process.exit(1);
  }
};

alterTable();
