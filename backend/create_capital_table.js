require('dotenv').config();
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'fahfi_shop_db'
});

const createTableQuery = `
CREATE TABLE IF NOT EXISTS capital_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  amount DECIMAL(10, 2) NOT NULL,
  type ENUM('deposit', 'withdraw') NOT NULL,
  description VARCHAR(255),
  transaction_date DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
`;

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database:', err);
    process.exit(1);
  }
  console.log('Connected to database.');

  connection.query(createTableQuery, (err, results) => {
    if (err) {
      console.error('Error creating table:', err);
      process.exit(1);
    }
    console.log('Table capital_logs created successfully.');
    connection.end();
  });
});
