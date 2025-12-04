const mysql = require("mysql2");
require("dotenv").config();

// Create Connection to DB
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Test Connect to DB
db.getConnection((err, connection) => {
  if (err) {
    console.error("❌  Error connecting to the database:", err.message);
    return;
  }
  console.log("✅  Successfully connected to the database (MySQL).");

  // Create stock_movements table if not exists
  const createStockTableQuery = `
    CREATE TABLE IF NOT EXISTS stock_movements (
      id INT AUTO_INCREMENT PRIMARY KEY,
      product_id INT NOT NULL,
      quantity INT NOT NULL,
      cost_per_unit DECIMAL(10, 2) NOT NULL,
      type ENUM('in', 'out', 'adjust') NOT NULL DEFAULT 'in',
      reason VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
    )
  `;
  connection.query(createStockTableQuery, (err) => {
    if (err) console.error("❌ Error creating stock_movements table:", err);
    else console.log("✅ Table stock_movements ready.");
  });

  connection.release(); // คืน connection กลับเข้า Pool
});

module.exports = db;


