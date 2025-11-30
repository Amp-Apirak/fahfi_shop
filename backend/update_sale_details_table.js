require('dotenv').config();
const mysql = require('mysql2');

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
});

db.connect(async (err) => {
    if (err) {
        console.error('❌ Database connection failed:', err);
        process.exit(1);
    }
    console.log('✅ Connected to database.');

    try {
        // Check if column exists
        const [columns] = await db.promise().query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'sale_details' AND COLUMN_NAME = 'cost_at_sale'
        `, [process.env.DB_DATABASE]);

        if (columns.length > 0) {
            console.log('⚠️ Column "cost_at_sale" already exists in "sale_details". Skipping.');
        } else {
            // Add column
            await db.promise().query(`
                ALTER TABLE sale_details
                ADD COLUMN cost_at_sale DECIMAL(10, 2) NOT NULL DEFAULT 0.00 AFTER price_at_sale
            `);
            console.log('✅ Column "cost_at_sale" added to "sale_details" successfully.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating table:', error);
        process.exit(1);
    }
});
