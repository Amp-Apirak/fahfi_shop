# บันทึกโครงการ: ระบบจัดการร้านเสื้อผ้า (fahfe_shop)

นี่คือบันทึกขั้นตอนการพัฒนา, โค้ด, และคำอธิบายต่างๆ สำหรับโปรเจกต์นี้

## 🚀 ขั้นตอนที่ 0: การออกแบบและสร้างฐานข้อมูล (Database Design)
*(สถานะ: ดำเนินการเสร็จสิ้น)*

เราได้ออกแบบและสร้างฐานข้อมูลใน MySQL (ผ่าน XAMPP)
* **ชื่อฐานข้อมูล:** `fahfe_shop_db`
* **Collation:** `utf8mb4_unicode_ci` (รองรับภาษาไทย)

### โครงสร้างตาราง (SQL Schema)

โค้ด SQL ที่ใช้ในการสร้างตารางทั้งหมด 7 ตาราง:

```sql
-- 1. ตารางผู้ใช้งาน (Users)
CREATE TABLE `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL COMMENT 'ต้องเก็บแบบ Hashed',
  `role` ENUM('Admin', 'Staff') NOT NULL DEFAULT 'Staff',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. ตารางสินค้า (Products)
CREATE TABLE `products` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `category` VARCHAR(100),
  `grade` VARCHAR(50),
  `details` TEXT,
  `cost_price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `sell_price` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  `stock_quantity` INT NOT NULL DEFAULT 0,
  `product_image_url` VARCHAR(500),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `last_updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_updated_by` INT COMMENT 'เก็บ User ID ที่แก้ไขล่าสุด'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. ตารางรายจ่าย (Expenses)
CREATE TABLE `expenses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `expense_date` DATE NOT NULL,
  `category` VARCHAR(100),
  `details` TEXT NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `receipt_image_url` VARCHAR(500),
  `created_by` INT NOT NULL COMMENT 'User ID ที่บันทึก',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `last_updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_updated_by` INT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. ตารางบิลขาย (Sales)
CREATE TABLE `sales` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `sale_date` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `total_amount` DECIMAL(10, 2) NOT NULL COMMENT 'ยอดรวมสุทธิหลังหักส่วนลด',
  `created_by` INT NOT NULL COMMENT 'User ID ที่ขาย',
  `last_updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `last_updated_by` INT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. ตารางรายละเอียดการขาย (SaleDetails)
CREATE TABLE `sale_details` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `sale_id` INT NOT NULL COMMENT 'เชื่อมโยงกับตาราง sales',
  `product_id` INT NOT NULL COMMENT 'เชื่อมโยงกับตาราง products',
  `quantity` INT NOT NULL,
  `price_at_sale` DECIMAL(10, 2) NOT NULL COMMENT 'ราคาขาย ณ ตอนนั้น',
  `discount_amount` DECIMAL(10, 2) NOT NULL DEFAULT 0.00 COMMENT 'ส่วนลด (บาท) เฉพาะรายการนี้',
  `line_total` DECIMAL(10, 2) NOT NULL COMMENT '(Price * Qty) - Discount',
  FOREIGN KEY (`sale_id`) REFERENCES `sales`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`product_id`) REFERENCES `products`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. ตารางบันทึกการกระทำ (ActionLogs)
CREATE TABLE `action_logs` (
  `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `action_type` VARCHAR(50) NOT NULL COMMENT 'เช่น CREATE, UPDATE, DELETE, LOGIN',
  `target_table` VARCHAR(100) COMMENT 'เช่น products, sales',
  `target_id` INT COMMENT 'ID ของแถวที่ถูกกระทำ',
  `details` TEXT COMMENT 'รายละเอียด เช่น ข้อมูลเก่า/ใหม่ (JSON)',
  `timestamp` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. ตารางหมวดหมู่สินค้า (ProductCategories)
CREATE TABLE `product_categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ตัวอย่างข้อมูลผู้ใช้เริ่มต้น (Password ยังไม่ Hashed)
INSERT INTO `users` (`username`, `password`, `role`) VALUES
('admin', 'admin1234', 'Admin'), 
('staff', 'staff1234', 'Staff');


## 🚀 ขั้นตอนที่ 1: การตั้งค่าโปรเจกต์ Backend (Node.js)
*(สถานะ: ดำเนินการเสร็จสิ้น)*

เราได้เริ่มต้นโปรเจกต์ Node.js ในโฟลเดอร์ `D:\12. Dev\fahfi_shop\backend`

1.  **เริ่มต้นโปรเจกต์:**
    * ใช้คำสั่ง `npm init -y`
    * ได้ไฟล์ `package.json` สำหรับจัดการโปรเจกต์

2.  **ติดตั้ง Dependencies (เครื่องมือที่จำเป็น):**
    * ใช้คำสั่ง `npm install express mysql2 bcryptjs jsonwebtoken cors dotenv`

3.  **ติดตั้ง Dev Dependencies (เครื่องมือช่วยพัฒนา):**
    * ใช้คำสั่ง `npm install nodemon --save-dev`

### คำอธิบาย Packages ที่ติดตั้ง:
* **express:** Framework หลักสำหรับสร้าง API
* **mysql2:** ไดรเวอร์สำหรับเชื่อมต่อ Node.js กับ MySQL
* **bcryptjs:** สำหรับเข้ารหัส (Hash) รหัสผ่าน
* **jsonwebtoken (jwt):** สำหรับสร้าง Token ยืนยันตัวตนตอน Login
* **cors:** สำหรับอนุญาตให้ Frontend (Nuxt) เรียกใช้ API นี้ได้
* **dotenv:** สำหรับเก็บค่าลับ (เช่น รหัสผ่าน DB) แยกจากโค้ด
* **nodemon:** สำหรับ Restart Server อัตโนมัติเมื่อมีการแก้ไขโค้ด

## 🚀 ขั้นตอนที่ 2: สร้าง Server และเชื่อมต่อฐานข้อมูล
*(สถานะ: ดำเนินการเสร็จสิ้น)*

เราได้สร้างไฟล์ Server หลัก (`index.js`) และไฟล์เก็บค่าความลับ (`.env`) และทดสอบการเชื่อมต่อกับฐานข้อมูล MySQL สำเร็จแล้ว

### 1. ไฟล์ `.env`
สร้างไฟล์ `.env` สำหรับเก็บข้อมูลลับ (Credentials)

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_DATABASE=fahfe_shop_db

# Server Configuration
PORT=3001

# JWT Secret Key
JWT_SECRET=mysecretkey12345

2. ไฟล์ package.json
อัปเดตส่วน "scripts" เพื่อให้รัน nodemon ได้:

"scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "node index.js",
    "dev": "nodemon index.js"
  },

  3. ไฟล์ index.js (โค้ดหลัก)
นี่คือโค้ดฉบับสมบูรณ์ของ index.js (ที่แก้ไขข้อผิดพลาด createPool และ DB_DATABASE เรียบร้อยแล้ว) ที่ใช้ในการเชื่อมต่อฐานข้อมูลและเริ่ม Server:

// --- 1. Import Packages ---
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

// --- 2. Initial Setup ---
const app = express();
const port = process.env.PORT || 3001;

// --- 3. Middlewares ---
app.use(cors());
app.use(express.json()); // ทำให้ Express อ่าน JSON ได้

// --- 4. Database Connection ---
// (แก้ไข: ใช้ .DB_DATABASE และแก้ , (จุลภาค))
const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE, // <--- แก้ไข
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// ทดสอบการเชื่อมต่อฐานข้อมูล
db.getConnection((err, connection) => {
    if (err) {
        console.error('❌  Error connecting to the database:', err.message);
        return;
    }
    console.log('✅  Successfully connected to the database (MySQL).');
    connection.release(); // คืน connection
});

// --- 5. Basic Routes (ทดสอบ Server) ---
app.get('/', (req, res) => {
    res.json({ message: 'ยินดีต้อนรับสู่ Backend API ของ fahfe_shop!' });
});

// --- 6. Start the Server ---
app.listen(port, () => {
    console.log(`🚀 Server is running on http://localhost:${port}`);
});

4. การรัน Server
ใช้คำสั่ง: npm run dev

ผลลัพธ์ที่ถูกต้อง: ✅ Successfully connected to the database (MySQL).



## 🚀 ขั้นตอนที่ 3: สร้าง API สำหรับลงทะเบียน (Register)
*(สถานะ: ดำเนินการเสร็จสิ้น)*

เราได้สร้าง API endpoint (`/api/register`) สำหรับระบบผู้ใช้งาน และทดสอบผ่าน Thunder Client (Method: POST) สำเร็จแล้ว

### 1. (แก้ไข) Import `bcryptjs`
ในไฟล์ `index.js` เราได้เพิ่ม `bcryptjs` สำหรับการเข้ารหัสรหัสผ่าน:

```javascript
const bcrypt = require('bcryptjs'); // สำหรับเข้ารหัสรหัสผ่าน


2. (แก้ไข) Database Connection
เราได้แก้ไขการตั้งค่า createPool ให้ใช้ตัวแปรที่ถูกต้อง:

JavaScript

const db = mysql.createPool({
    // ...
    database: process.env.DB_DATABASE, // <--- แก้ไขจาก DB_NAME
    // ...
});

3. (เพิ่ม) โค้ด API สำหรับ Register
เราได้เพิ่มโค้ดนี้ "ก่อน" ส่วน // --- 6. Start the Server --- ใน index.js
// --- 5. Auth Routes (Register) ---

// (เราใช้ async/await เพื่อจัดการกับการเชื่อมต่อ DB และ Hashing ที่ต้องใช้เวลา)
app.post('/api/register', async (req, res) => {
    try {
        // 1. รับข้อมูลจาก Frontend (req.body)
        const { username, password, role } = req.body;

        // 2. ตรวจสอบข้อมูลเบื้องต้น
        if (!username || !password) {
            return res.status(400).json({ message: 'กรุณากรอก Username และ Password' });
        }

        // 3. (สำคัญ) เข้ารหัสรหัสผ่าน
        const hashedPassword = await bcrypt.hash(password, 10);

        // 4. บันทึกผู้ใช้ใหม่ลงฐานข้อมูล
        const [results] = await db.promise().query(
            'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
            [username, hashedPassword, role || 'Staff'] // ค่าเริ่มต้นคือ 'Staff'
        );

        const newUserId = results.insertId; // ดึง ID ของ User ที่เพิ่งสร้าง

        // 5. (สำคัญ) บันทึก Log การกระทำ
        await db.promise().query(
            'INSERT INTO action_logs (user_id, action_type, target_table, target_id, details) VALUES (?, ?, ?, ?, ?)',
            [newUserId, 'REGISTER', 'users', newUserId, `User ${username} registered.`]
        );

        // 6. ส่งคำตอบกลับไป
        console.log(`✅ User '${username}' registered successfully.`);
        res.status(201).json({ message: 'ลงทะเบียนผู้ใช้สำเร็จ!', userId: newUserId });

    } catch (error) {
        // 7. จัดการ Error (เช่น Username ซ้ำ)
        if (error.code === 'ER_DUP_ENTRY') {
            console.error('Error: Username already exists.');
            return res.status(409).json({ message: 'Username นี้มีผู้ใช้งานแล้ว' });
        }
        
        console.error('❌ Error during registration:', error.message);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดที่ Server' });
    }
});

## 🚀 ขั้นตอนที่ 4: สร้าง API สำหรับเข้าสู่ระบบ (Login)
*(สถานะ: ดำเนินการเสร็จสิ้น)*

เราได้สร้าง API endpoint (`/api/login`) สำหรับการยืนยันตัวตน และทดสอบการรับ JWT Token (ตั๋ว) สำเร็จแล้ว

### 1. (แก้ไข) Import `jsonwebtoken`
เราได้เพิ่ม `jsonwebtoken` ในกลุ่ม import ด้านบนสุดของ `index.js` เพื่อแก้ไขข้อผิดพลาด `jwt is not defined`

```javascript
//import Packages
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // 👈 เพิ่มบรรทัดนี้
require('dotenv').config();

Coding partner
ยอดเยี่ยมครับ! ดีใจที่คุณทดสอบ API Login ผ่านเรียบร้อย

📝 บันทึกความคืบหน้า (สำหรับ how_to.md)
(คุณสามารถคัดลอกเนื้อหาส่วนนี้ไป ต่อท้าย สิ่งที่คุณมีอยู่แล้วในไฟล์ how_to.md ครับ)

Markdown
## 🚀 ขั้นตอนที่ 4: สร้าง API สำหรับเข้าสู่ระบบ (Login)
*(สถานะ: ดำเนินการเสร็จสิ้น)*

เราได้สร้าง API endpoint (`/api/login`) สำหรับการยืนยันตัวตน และทดสอบการรับ JWT Token (ตั๋ว) สำเร็จแล้ว

### 1. (แก้ไข) Import `jsonwebtoken`
เราได้เพิ่ม `jsonwebtoken` ในกลุ่ม import ด้านบนสุดของ `index.js` เพื่อแก้ไขข้อผิดพลาด `jwt is not defined`

```javascript
//import Packages
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken'); // 👈 เพิ่มบรรทัดนี้
require('dotenv').config();


2. (เพิ่ม) โค้ด API สำหรับ Login
เราได้เพิ่มโค้ดนี้ต่อท้าย /api/register เพื่อจัดการการเข้าสู่ระบบ

// --- 5. Auth Routes (Login) ---

app.post('/api/login', async (req, res) => {
    try {
        // 1. รับข้อมูลจาก Frontend
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'กรุณากรอก Username และ Password' });
        }

        // 2. ค้นหาผู้ใช้ในฐานข้อมูล
        const [users] = await db.promise().query(
            'SELECT * FROM users WHERE username = ?',
            [username]
        );

        // 3. ตรวจสอบว่ามีผู้ใช้นี้หรือไม่
        if (users.length === 0) {
            return res.status(401).json({ message: 'Username หรือ Password ไม่ถูกต้อง' });
        }

        const user = users[0]; // ข้อมูลผู้ใช้ที่พบ

        // 4. (สำคัญ) เปรียบเทียบรหัสผ่าน
        const isPasswordMatch = await bcrypt.compare(password, user.password);

        if (!isPasswordMatch) {
            return res.status(401).json({ message: 'Username หรือ Password ไม่ถูกต้อง' });
        }

        // --- Login สำเร็จ ---

        // 5. (สำคัญ) สร้าง JWT Token (ตั๋ว)
        const token = jwt.sign(
            { 
                userId: user.id, 
                username: user.username,
                role: user.role 
            },  // ข้อมูลที่เราอยากเก็บใน "ตั๋ว"
            process.env.JWT_SECRET, // กุญแจลับ (จากไฟล์ .env)
            { expiresIn: '8h' } // Token นี้มีอายุ 8 ชั่วโมง
        );

        // 6. (สำคัญ) บันทึก Log การ Login
        await db.promise().query(
            'INSERT INTO action_logs (user_id, action_type, details) VALUES (?, ?, ?)',
            [user.id, 'LOGIN', `User ${user.username} logged in.`]
        );

        // 7. ส่ง Token กลับไปให้ Frontend
        console.log(`✅ User '${user.username}' logged in successfully.`);
        res.status(200).json({ 
            message: 'เข้าสู่ระบบสำเร็จ', 
            token: token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role
            }
        });

    } catch (error) {
        console.error('❌ Error during login:', error.message);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดที่ Server' });
    }
});

## 🚀 ขั้นตอนที่ 5: สร้าง "ด่านตรวจตั๋ว" (Authentication Middleware)
*(สถานะ: ดำเนินการเสร็จสิ้น)*

เราได้สร้าง "Middleware" (ฟังก์ชันคั่นกลาง) ชื่อ `authenticateToken` เพื่อใช้ป้องกัน API routes ที่ต้องการการยืนยันตัวตน (ต้อง Login ก่อน)

### 1. (เพิ่ม) โค้ด Middleware `authenticateToken`
เราได้เพิ่มโค้ดนี้ใน `index.js` โดยวางไว้ "หลัง" ส่วน `// --- 4. Database Connection ---` และ "ก่อน" ส่วน `// --- 5. Auth Routes (Register) ---`

```javascript
// --- 5. Authentication Middleware (ด่านตรวจตั๋ว) ---
const authenticateToken = (req, res, next) => {
    // 1. ดึง Token จาก Header
    const authHeader = req.headers['authorization'];
    // Format ที่ส่งมาจะเป็น "Bearer <TOKEN>"
    const token = authHeader && authHeader.split(' ')[1]; 

    // 2. ตรวจสอบว่ามี Token ส่งมาหรือไม่
    if (token == null) {
        return res.status(401).json({ message: 'ไม่ได้รับ Token (Access Denied)' });
    }

    // 3. ตรวจสอบ Token
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            // ถ้า Token หมดอายุ หรือไม่ถูกต้อง
            return res.status(403).json({ message: 'Token ไม่ถูกต้อง (Forbidden)' });
        }

        // 4. (สำคัญ) ถ้า Token ถูกต้อง
        // ให้แนบข้อมูลผู้ใช้ (ที่ถอดรหัสได้จาก Token) ไปกับ "req"
        // เพื่อให้ API ปลายทางรู้ว่า "ใคร" กำลังร้องขอ
        req.user = user; 
        
        next(); // ปล่อยให้คำขอไปทำงานต่อ
    });
};

คำอธิบายการทำงาน:
Middleware นี้จะถูกเรียกใช้ "ก่อน" ที่ API หลักจะทำงาน

มันจะตรวจสอบ "ตั๋ว" (Token) ที่ส่งมาใน Header Authorization

ถ้า "ตั๋ว" ถูกต้อง มันจะแนบข้อมูลผู้ใช้ (เช่น userId, role) เข้าไปใน req.user แล้วเรียก next() เพื่อให้ API ทำงานต่อ

ถ้า "ตั๋ว" ไม่มี หรือ "ปลอม" มันจะปัดตกคำขอ (ส่ง 401 หรือ 403) ทันที

## 🚀 ขั้นตอนที่ 6: สร้าง API สำหรับ "เพิ่มสินค้า" (Create Product)
*(สถานะ: ดำเนินการเสร็จสิ้น)*

เราได้เริ่มโมดูลที่ 1 (Inventory Management) และสร้าง API แรก (`POST /api/products`) สำหรับการเพิ่มสินค้าใหม่ นี่คือ API แรกที่เรานำ `authenticateToken` (ด่านตรวจต๋ว) มาใช้งานจริง

### 1. (เพิ่ม) โค้ด API สำหรับ "เพิ่มสินค้า"
เราได้เพิ่มโค้ดนี้ต่อท้ายส่วน "Auth Routes" ใน `index.js`

```javascript
// --- 6. Product Routes (Inventory Management) ---

// @route   POST /api/products
// @desc    สร้างสินค้าใหม่ (Create new product)
// @access  Private (ต้อง Login โดยใช้ authenticateToken)

app.post('/api/products', authenticateToken, async (req, res) => {
    // -----------------------------------------------------------------
    // (สำคัญ) เรา "แทรก" authenticateToken เข้าไป
    // ทำให้เราสามารถเข้าถึง "ข้อมูลผู้ใช้" ได้จาก req.user
    // -----------------------------------------------------------------
    const { userId, username } = req.user; 

    try {
        // 1. รับข้อมูลสินค้าจาก Frontend (req.body)
        const { 
            name, 
            category, 
            grade, 
            details, 
            cost_price, 
            sell_price, 
            stock_quantity, 
            product_image_url 
        } = req.body;

        // 2. ตรวจสอบข้อมูลเบื้องต้น
        if (!name || !sell_price) {
            return res.status(400).json({ message: 'กรุณากรอกชื่อสินค้า และ ราคาขาย' });
        }

        // 3. บันทึกลงฐานข้อมูล
        const [results] = await db.promise().query(
            'INSERT INTO products (name, category, grade, details, cost_price, sell_price, stock_quantity, product_image_url, last_updated_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                name, 
                category, 
                grade, 
                details, 
                cost_price || 0.00,
                sell_price, 
                stock_quantity || 0,
                product_image_url,
                userId // บันทึกว่าใครเป็นคนสร้าง
            ]
        );
        
        const newProductId = results.insertId;

        // 4. (สำคัญ) บันทึก Log การกระทำ
        await db.promise().query(
            'INSERT INTO action_logs (user_id, action_type, target_table, target_id, details) VALUES (?, ?, ?, ?, ?)',
            [userId, 'CREATE', 'products', newProductId, `User ${username} created product: ${name}`]
        );

        // 5. ส่งคำตอบกลับไป
        console.log(`✅ Product '${name}' created by user '${username}'.`);
        res.status(201).json({ message: 'เพิ่มสินค้าสำเร็จ!', productId: newProductId });

    } catch (error) {
        console.error('❌ Error creating product:', error.message);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดที่ Server' });
    }
});

Coding partner
เยี่ยมครับ! เรามาสรุปขั้นตอนที่ 6 และลุยกันต่อเลยครับ

📝 บันทึกความคืบหน้า (สำหรับ how_to.md)
(คุณสามารถคัดลอกเนื้อหาส่วนนี้ไป ต่อท้าย สิ่งที่คุณมีอยู่แล้วในไฟล์ how_to.md ครับ)

Markdown
## 🚀 ขั้นตอนที่ 6: สร้าง API สำหรับ "เพิ่มสินค้า" (Create Product)
*(สถานะ: ดำเนินการเสร็จสิ้น)*

เราได้เริ่มโมดูลที่ 1 (Inventory Management) และสร้าง API แรก (`POST /api/products`) สำหรับการเพิ่มสินค้าใหม่ นี่คือ API แรกที่เรานำ `authenticateToken` (ด่านตรวจต๋ว) มาใช้งานจริง

### 1. (เพิ่ม) โค้ด API สำหรับ "เพิ่มสินค้า"
เราได้เพิ่มโค้ดนี้ต่อท้ายส่วน "Auth Routes" ใน `index.js`

```javascript
// --- 6. Product Routes (Inventory Management) ---

// @route   POST /api/products
// @desc    สร้างสินค้าใหม่ (Create new product)
// @access  Private (ต้อง Login โดยใช้ authenticateToken)

app.post('/api/products', authenticateToken, async (req, res) => {
    // -----------------------------------------------------------------
    // (สำคัญ) เรา "แทรก" authenticateToken เข้าไป
    // ทำให้เราสามารถเข้าถึง "ข้อมูลผู้ใช้" ได้จาก req.user
    // -----------------------------------------------------------------
    const { userId, username } = req.user; 

    try {
        // 1. รับข้อมูลสินค้าจาก Frontend (req.body)
        const { 
            name, 
            category, 
            grade, 
            details, 
            cost_price, 
            sell_price, 
            stock_quantity, 
            product_image_url 
        } = req.body;

        // 2. ตรวจสอบข้อมูลเบื้องต้น
        if (!name || !sell_price) {
            return res.status(400).json({ message: 'กรุณากรอกชื่อสินค้า และ ราคาขาย' });
        }

        // 3. บันทึกลงฐานข้อมูล
        const [results] = await db.promise().query(
            'INSERT INTO products (name, category, grade, details, cost_price, sell_price, stock_quantity, product_image_url, last_updated_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                name, 
                category, 
                grade, 
                details, 
                cost_price || 0.00,
                sell_price, 
                stock_quantity || 0,
                product_image_url,
                userId // บันทึกว่าใครเป็นคนสร้าง
            ]
        );
        
        const newProductId = results.insertId;

        // 4. (สำคัญ) บันทึก Log การกระทำ
        await db.promise().query(
            'INSERT INTO action_logs (user_id, action_type, target_table, target_id, details) VALUES (?, ?, ?, ?, ?)',
            [userId, 'CREATE', 'products', newProductId, `User ${username} created product: ${name}`]
        );

        // 5. ส่งคำตอบกลับไป
        console.log(`✅ Product '${name}' created by user '${username}'.`);
        res.status(201).json({ message: 'เพิ่มสินค้าสำเร็จ!', productId: newProductId });

    } catch (error) {
        console.error('❌ Error creating product:', error.message);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดที่ Server' });
    }
});
2. การทดสอบ
เราได้ทดสอบ API นี้โดยใช้ Method POST ใน Thunder Client

สำคัญ: เราต้องไปที่แท็บ Auth > Bearer และวาง Token ที่ได้จากการ Login

เราได้ทดสอบแล้วว่าถ้า "ไม่" ส่ง Token ไปด้วย API จะ trả về 401 Unauthorized ซึ่งยืนยันว่า Middleware ของเราทำงานถูกต้อง

## 🚀 ขั้นตอนที่ 7: สร้าง API สำหรับ "ดึงข้อมูลสินค้าทั้งหมด" (Read Products)
*(สถานะ: ดำเนินการเสร็จสิ้น)*

เราได้สร้าง API endpoint (`GET /api/products`) สำหรับการดึงข้อมูลสินค้าทั้งหมดในระบบ (Read ใน CRUD) โดย API นี้จำเป็นต้อง Login ก่อน (ใช้ `authenticateToken`)

### 1. (เพิ่ม) โค้ด API สำหรับ "ดึงข้อมูลสินค้าทั้งหมด"
เราได้เพิ่มโค้ดนี้ต่อท้าย `POST /api/products` ใน `index.js`

```javascript
// @route   GET /api/products
// @desc    ดึงข้อมูลสินค้าทั้งหมด (Get all products)
// @access  Private

app.get('/api/products', authenticateToken, async (req, res) => {
    try {
        // 1. ดึงข้อมูลสินค้าทั้งหมดจากฐานข้อมูล
        const [products] = await db.promise().query(
            'SELECT * FROM products ORDER BY created_at DESC' // เรียงจากใหม่สุดไปเก่าสุด
        );

        // 2. ส่งข้อมูลกลับไป
        res.status(200).json(products); // ส่งข้อมูลสินค้าทั้งหมดกลับไปเป็น Array

    } catch (error) {
        console.error('❌ Error getting products:', error.message);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดที่ Server' });
    }
});

2. การทดสอบ
เราได้ทดสอบ API นี้โดยใช้ Method GET ใน Thunder Client

เราส่ง Token ผ่าน Auth > Bearer

ผลลัพธ์ที่ได้คือ Status 200 OK พร้อมกับ JSON Array ของสินค้าทั้งหมดในฐานข้อมูล

## 🚀 ขั้นตอนที่ 8: สร้าง API สำหรับ "ดึงข้อมูลสินค้า 1 ชิ้น" (Read Single Product)
*(สถานะ: ดำเนินการเสร็จสิ้น)*

เราได้สร้าง API endpoint (`GET /api/products/:id`) สำหรับการดึงข้อมูลสินค้า 1 ชิ้น โดยระบุ ID ผ่าน URL (Read Single ใน CRUD)

### 1. (เพิ่ม) โค้ด API สำหรับ "ดึงข้อมูลสินค้า 1 ชิ้น"
เราได้เพิ่มโค้ดนี้ต่อท้าย `GET /api/products` ใน `index.js`

```javascript
// @route   GET /api/products/:id
// @desc    ดึงข้อมูลสินค้า 1 ชิ้น (Get single product by ID)
// @access  Private

app.get('/api/products/:id', authenticateToken, async (req, res) => {
    try {
        // 1. ดึง "id" ที่ผู้ใช้ส่งมาทาง URL (เรียกว่า "params")
        const productId = req.params.id;

        // 2. ค้นหาสินค้า ID นั้นในฐานข้อมูล
        const [products] = await db.promise().query(
            'SELECT * FROM products WHERE id = ?',
            [productId]
        );

        // 3. ตรวจสอบว่าหาสินค้าเจอหรือไม่
        if (products.length === 0) {
            return res.status(404).json({ message: 'ไม่พบสินค้านี้ (Not Found)' });
        }

        // 4. ส่งข้อมูลสินค้าชิ้นนั้น (products[0]) กลับไป
        res.status(200).json(products[0]);

    } catch (error) {
        console.error('❌ Error getting single product:', error.message);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดที่ Server' });
    }
});

2. การทดสอบ
เราได้ทดสอบ API นี้โดยใช้ Method GET และระบุ ID ใน URL (เช่น /api/products/1)

เราส่ง Token ผ่าน Auth > Bearer

ผลลัพธ์ที่ได้คือ Status 200 OK (ถ้าพบ) หรือ 404 Not Found (ถ้าไม่พบ)

## 🚀 ขั้นตอนที่ 9: สร้าง API สำหรับ "แก้ไขสินค้า" (Update Product)
*(สถานะ: ดำเนินการเสร็จสิ้น)*

เราได้สร้าง API endpoint (`PUT /api/products/:id`) สำหรับการอัปเดตข้อมูลสินค้าที่มีอยู่ (Update ใน CRUD) และมีการบันทึก Log การแก้ไขตามข้อกำหนด

### 1. (เพิ่ม) โค้ด API สำหรับ "แก้ไขสินค้า"
เราได้เพิ่มโค้ดนี้ต่อท้าย `GET /api/products/:id` ใน `index.js`

```javascript
// @route   PUT /api/products/:id
// @desc    แก้ไขข้อมูลสินค้า (Update a product)
// @access  Private

app.put('/api/products/:id', authenticateToken, async (req, res) => {
    // ดึงข้อมูลผู้ใช้ที่กำลังแก้ไข (จาก Token)
    const { userId, username } = req.user; 
    
    // ดึง ID สินค้าที่จะแก้ไข (จาก URL)
    const productId = req.params.id;

    try {
        // 1. ตรวจสอบก่อนว่ามีสินค้านี้อยู่จริงหรือไม่
        const [products] = await db.promise().query(
            'SELECT * FROM products WHERE id = ?',
            [productId]
        );

        if (products.length === 0) {
            return res.status(404).json({ message: 'ไม่พบสินค้านี้ (Not Found)' });
        }

        // 2. รับข้อมูล "ใหม่" ที่ส่งมาจาก Frontend (req.body)
        const { 
            name, 
            category, 
            grade, 
            details, 
            cost_price, 
            sell_price, 
            stock_quantity 
        } = req.body;

        // 3. ตรวจสอบข้อมูลเบื้องต้น
        if (!name || !sell_price) {
            return res.status(400).json({ message: 'กรุณากรอกชื่อสินค้า และ ราคาขาย' });
        }

        // 4. อัปเดตข้อมูลลงฐานข้อมูล
        await db.promise().query(
            `UPDATE products SET 
                name = ?, category = ?, grade = ?, details = ?, 
                cost_price = ?, sell_price = ?, stock_quantity = ?, 
                last_updated_by = ? 
            WHERE id = ?`,
            [
                name, 
                category, 
                grade, 
                details, 
                cost_price, 
                sell_price, 
                stock_quantity,
                userId, // (สำคัญ) บันทึกว่าใครอัปเดต
                productId
            ]
        );

        // 5. (สำคัญ) บันทึก Log การกระทำ
        await db.promise().query(
            'INSERT INTO action_logs (user_id, action_type, target_table, target_id, details) VALUES (?, ?, ?, ?, ?)',
            [userId, 'UPDATE', 'products', productId, `User ${username} updated product ID: ${productId} (Name: ${name})`]
        );

        // 6. ส่งคำตอบกลับไป
        console.log(`✅ Product ID ${productId} ('${name}') updated by user '${username}'.`);
        res.status(200).json({ message: 'อัปเดตสินค้าสำเร็จ!' });

    } catch (error) {
        console.error('❌ Error updating product:', error.message);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดที่ Server' });
    }
});

Coding partner
เยี่ยมครับ! เรามาสรุปขั้นตอนที่ 9 และจัดการส่วนสุดท้ายของ CRUD สินค้ากันครับ

📝 บันทึกความคืบหน้า (สำหรับ how_to.md)
(คุณสามารถคัดลอกเนื้อหาส่วนนี้ไป ต่อท้าย สิ่งที่คุณมีอยู่แล้วในไฟล์ how_to.md ครับ)

Markdown
## 🚀 ขั้นตอนที่ 9: สร้าง API สำหรับ "แก้ไขสินค้า" (Update Product)
*(สถานะ: ดำเนินการเสร็จสิ้น)*

เราได้สร้าง API endpoint (`PUT /api/products/:id`) สำหรับการอัปเดตข้อมูลสินค้าที่มีอยู่ (Update ใน CRUD) และมีการบันทึก Log การแก้ไขตามข้อกำหนด

### 1. (เพิ่ม) โค้ด API สำหรับ "แก้ไขสินค้า"
เราได้เพิ่มโค้ดนี้ต่อท้าย `GET /api/products/:id` ใน `index.js`

```javascript
// @route   PUT /api/products/:id
// @desc    แก้ไขข้อมูลสินค้า (Update a product)
// @access  Private

app.put('/api/products/:id', authenticateToken, async (req, res) => {
    // ดึงข้อมูลผู้ใช้ที่กำลังแก้ไข (จาก Token)
    const { userId, username } = req.user; 
    
    // ดึง ID สินค้าที่จะแก้ไข (จาก URL)
    const productId = req.params.id;

    try {
        // 1. ตรวจสอบก่อนว่ามีสินค้านี้อยู่จริงหรือไม่
        const [products] = await db.promise().query(
            'SELECT * FROM products WHERE id = ?',
            [productId]
        );

        if (products.length === 0) {
            return res.status(404).json({ message: 'ไม่พบสินค้านี้ (Not Found)' });
        }

        // 2. รับข้อมูล "ใหม่" ที่ส่งมาจาก Frontend (req.body)
        const { 
            name, 
            category, 
            grade, 
            details, 
            cost_price, 
            sell_price, 
            stock_quantity 
        } = req.body;

        // 3. ตรวจสอบข้อมูลเบื้องต้น
        if (!name || !sell_price) {
            return res.status(400).json({ message: 'กรุณากรอกชื่อสินค้า และ ราคาขาย' });
        }

        // 4. อัปเดตข้อมูลลงฐานข้อมูล
        await db.promise().query(
            `UPDATE products SET 
                name = ?, category = ?, grade = ?, details = ?, 
                cost_price = ?, sell_price = ?, stock_quantity = ?, 
                last_updated_by = ? 
            WHERE id = ?`,
            [
                name, 
                category, 
                grade, 
                details, 
                cost_price, 
                sell_price, 
                stock_quantity,
                userId, // (สำคัญ) บันทึกว่าใครอัปเดต
                productId
            ]
        );

        // 5. (สำคัญ) บันทึก Log การกระทำ
        await db.promise().query(
            'INSERT INTO action_logs (user_id, action_type, target_table, target_id, details) VALUES (?, ?, ?, ?, ?)',
            [userId, 'UPDATE', 'products', productId, `User ${username} updated product ID: ${productId} (Name: ${name})`]
        );

        // 6. ส่งคำตอบกลับไป
        console.log(`✅ Product ID ${productId} ('${name}') updated by user '${username}'.`);
        res.status(200).json({ message: 'อัปเดตสินค้าสำเร็จ!' });

    } catch (error) {
        console.error('❌ Error updating product:', error.message);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดที่ Server' });
    }
});
2. การทดสอบ
เราได้ทดสอบ API นี้โดยใช้ Method PUT ใน Thunder Client

เราส่ง Token ผ่าน Auth > Bearer และส่งข้อมูลใหม่ (JSON) ใน Body

ผลลัพธ์ที่ได้คือ Status 200 OK และข้อมูลในฐานข้อมูล products รวมถึง action_logs ได้รับการอัปเดต

## 🚀 ขั้นตอนที่ 10: สร้าง API สำหรับ "ลบสินค้า" (Delete Product)
*(สถานะ: ดำเนินการเสร็จสิ้น)*

เราได้สร้าง API endpoint (`DELETE /api/products/:id`) ซึ่งเป็นส่วนสุดท้ายของ CRUD สำหรับโมดูลสินค้า (Delete ใน CRUD) และมีการบันทึก Log การลบตามข้อกำหนด

### 1. (เพิ่ม) โค้ด API สำหรับ "ลบสินค้า"
เราได้เพิ่มโค้ดนี้ต่อท้าย `PUT /api/products/:id` ใน `index.js`

```javascript
// @route   DELETE /api/products/:id
// @desc    ลบสินค้า (Delete a product)
// @access  Private

app.delete('/api/products/:id', authenticateToken, async (req, res) => {
    // ดึงข้อมูลผู้ใช้ที่กำลังลบ (จาก Token)
    const { userId, username } = req.user; 
    
    // ดึง ID สินค้าที่จะลบ (จาก URL)
    const productId = req.params.id;

    try {
        // 1. ตรวจสอบก่อนว่ามีสินค้านี้อยู่จริงหรือไม่
        const [products] = await db.promise().query(
            'SELECT name FROM products WHERE id = ?', // ดึงมาแค่ชื่อเพื่อบันทึก Log
            [productId]
        );

        if (products.length === 0) {
            return res.status(404).json({ message: 'ไม่พบสินค้านี้ (Not Found)' });
        }
        
        const productName = products[0].name; // เก็บชื่อไว้ก่อนลบ

        // 2. สั่งลบข้อมูล
        await db.promise().query(
            'DELETE FROM products WHERE id = ?',
            [productId]
        );

        // 3. (สำคัญ) บันทึก Log การกระทำ
        await db.promise().query(
            'INSERT INTO action_logs (user_id, action_type, target_table, target_id, details) VALUES (?, ?, ?, ?, ?)',
            [userId, 'DELETE', 'products', productId, `User ${username} DELETED product ID: ${productId} (Name: ${productName})`]
        );

        // 4. ส่งคำตอบกลับไป
        console.log(`✅ Product ID ${productId} ('${productName}') DELETED by user '${username}'.`);
        res.status(200).json({ message: 'ลบสินค้าสำเร็จ!' });

    } catch (error) {
        // 5. (สำคัญ) จัดการ Error กรณีลบไม่ได้
        if (error.code === 'ER_ROW_IS_REFERENCED_2') {
            // (ER_ROW_IS_REFERENCED_2 คือ Error Code ของ MySQL ที่บอกว่า "ลบไม่ได้ เพราะมีตารางอื่นอ้างอิงอยู่")
            console.warn(`Failed to delete product ID ${productId}: It is referenced in sale_details.`);
            return res.status(409).json({ message: 'ลบสินค้าไม่ได้! สินค้านี้มีประวัติการขาย' });
        }
        
        console.error('❌ Error deleting product:', error.message);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดที่ Server' });
    }
});

2. การทดสอบ
เราได้ทดสอบ API นี้โดยใช้ Method DELETE ใน Thunder Client

เราส่ง Token ผ่าน Auth > Bearer

ผลลัพธ์ที่ได้คือ 200 OK (ถ้าลบได้) หรือ 409 Conflict (ถ้าลบไม่ได้เพราะมีประวัติการขาย) ซึ่งเป็นการป้องกันข้อมูลที่ถูกต้อง

## 🚀 ขั้นตอนที่ 11: (โมดูล 2) สร้าง API สำหรับ "บันทึกรายจ่าย" (Create Expense)
*(สถานะ: ดำเนินการเสร็จสิ้น)*

เราได้เริ่มต้นโมดูลที่ 2 (Expense Tracking) โดยการสร้าง API endpoint (`POST /api/expenses`) สำหรับการบันทึกรายจ่ายใหม่ (Create ใน CRUD) และมีการบันทึก Log การสร้าง

### 1. (เพิ่ม) โค้ด API สำหรับ "บันทึกรายจ่าย"
เราได้เพิ่มโค้ดนี้ (กลุ่ม `--- 7. Expense Routes ---`) ต่อท้าย API ของ Product ใน `index.js`

```javascript
// --- 7. Expense Routes (Expense Tracking) ---

// @route   POST /api/expenses
// @desc    บันทึกรายจ่ายใหม่ (Create new expense)
// @access  Private

app.post('/api/expenses', authenticateToken, async (req, res) => {
    // ดึงข้อมูลผู้ใช้ที่กำลังบันทึก (จาก Token)
    const { userId, username } = req.user;

    try {
        // 1. รับข้อมูลรายจ่ายจาก Frontend (req.body)
        const { expense_date, category, details, amount, receipt_image_url } = req.body;

        // 2. ตรวจสอบข้อมูลเบื้องต้น
        if (!expense_date || !details || !amount) {
            return res.status(400).json({ message: 'กรุณากรอก วันที่, รายละเอียด และ จำนวนเงิน' });
        }

        // 3. บันทึกลงฐานข้อมูล
        const [results] = await db.promise().query(
            'INSERT INTO expenses (expense_date, category, details, amount, receipt_image_url, created_by, last_updated_by) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [
                expense_date, // (format 'YYYY-MM-DD')
                category,
                details,
                amount,
                receipt_image_url,
                userId, // created_by
                userId  // last_updated_by
            ]
        );
        
        const newExpenseId = results.insertId;

        // 4. (สำคัญ) บันทึก Log การกระทำ
        await db.promise().query(
            'INSERT INTO action_logs (user_id, action_type, target_table, target_id, details) VALUES (?, ?, ?, ?, ?)',
            [userId, 'CREATE', 'expenses', newExpenseId, `User ${username} created expense: ${details} (Amount: ${amount})`]
        );

        // 5. ส่งคำตอบกลับไป
        console.log(`✅ Expense '${details}' created by user '${username}'.`);
        res.status(201).json({ message: 'บันทึกรายจ่ายสำเร็จ!', expenseId: newExpenseId });

    } catch (error) {
        console.error('❌ Error creating expense:', error.message);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดที่ Server' });
    }
});

2. การทดสอบ
เราได้ทดสอบ API นี้โดยใช้ Method POST ใน Thunder Client พร้อม Bearer Token

เราส่งข้อมูล JSON ของรายจ่ายไปใน Body

ผลลัพธ์ที่ได้คือ Status 201 Created และข้อมูลถูกบันทึกลงตาราง expenses และ action_logs


## 🚀 ขั้นตอนที่ 12: สร้าง API สำหรับ "ดึงข้อมูลรายจ่ายทั้งหมด" (Read Expenses)
*(สถานะ: ดำเนินการเสร็จสิ้น)*

เราได้สร้าง API endpoint (`GET /api/expenses`) สำหรับการดึงข้อมูลรายจ่ายทั้งหมด (Read All ใน CRUD) เพื่อใช้ในหน้าประวัติรายจ่ายย้อนหลัง

### 1. (เพิ่ม) โค้ด API สำหรับ "ดึงข้อมูลรายจ่ายทั้งหมด"
เราได้เพิ่มโค้ดนี้ต่อท้าย `POST /api/expenses` ใน `index.js`

```javascript
// @route   GET /api/expenses
// @desc    ดึงข้อมูลรายจ่ายทั้งหมด (Get all expenses)
// @access  Private

app.get('/api/expenses', authenticateToken, async (req, res) => {
    try {
        // 1. ดึงข้อมูลรายจ่ายทั้งหมดจากฐานข้อมูล
        // เรา Join ตาราง users (u) เพื่อดึง 'username' ของผู้บันทึก (created_by) มาด้วย
        const [expenses] = await db.promise().query(
            `SELECT 
                e.*, 
                u.username AS created_by_username 
            FROM expenses e
            LEFT JOIN users u ON e.created_by = u.id
            ORDER BY e.expense_date DESC, e.created_at DESC` // เรียงจากวันที่ล่าสุด
        );

        // 2. ส่งข้อมูลกลับไป
        res.status(200).json(expenses); // ส่งข้อมูลรายจ่ายทั้งหมดกลับไปเป็น Array

    } catch (error) {
        console.error('❌ Error getting expenses:', error.message);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดที่ Server' });
    }
});

2. การทดสอบ
เราได้ทดสอบ API นี้โดยใช้ Method GET ใน Thunder Client พร้อม Bearer Token

ผลลัพธ์ที่ได้คือ Status 200 OK พร้อมกับ JSON Array ของรายจ่ายทั้งหมด และมี created_by_username ติดมาด้วย

## 🚀 ขั้นตอนที่ 13: สร้าง API สำหรับ "แก้ไขรายจ่าย" (Update Expense)
*(สถานะ: ดำเนินการเสร็จสิ้น)*

เราได้สร้าง API endpoint (`PUT /api/expenses/:id`) สำหรับการอัปเดตข้อมูลรายจ่ายที่มีอยู่ (Update ใน CRUD) และมีการบันทึก Log การแก้ไขตามข้อกำหนด

### 1. (เพิ่ม) โค้ด API สำหรับ "แก้ไขรายจ่าย"
เราได้เพิ่มโค้ดนี้ต่อท้าย `GET /api/expenses` ใน `index.js`

```javascript
// @route   PUT /api/expenses/:id
// @desc    แก้ไขข้อมูลรายจ่าย (Update an expense)
// @access  Private

app.put('/api/expenses/:id', authenticateToken, async (req, res) => {
    // ดึงข้อมูลผู้ใช้ที่กำลังแก้ไข (จาก Token)
    const { userId, username } = req.user; 
    
    // ดึง ID รายจ่ายที่จะแก้ไข (จาก URL)
    const expenseId = req.params.id;

    try {
        // 1. ตรวจสอบก่อนว่ามีรายจ่ายนี้อยู่จริงหรือไม่
        const [expenses] = await db.promise().query(
            'SELECT * FROM expenses WHERE id = ?',
            [expenseId]
        );

        if (expenses.length === 0) {
            return res.status(404).json({ message: 'ไม่พบรายการรายจ่ายนี้ (Not Found)' });
        }

        // 2. รับข้อมูล "ใหม่" ที่ส่งมาจาก Frontend (req.body)
        const { expense_date, category, details, amount, receipt_image_url } = req.body;

        // 3. ตรวจสอบข้อมูลเบื้องต้น
        if (!expense_date || !details || !amount) {
            return res.status(400).json({ message: 'กรุณากรอก วันที่, รายละเอียด และ จำนวนเงิน' });
        }

        // 4. อัปเดตข้อมูลลงฐานข้อมูล
        await db.promise().query(
            `UPDATE expenses SET 
                expense_date = ?, category = ?, details = ?, amount = ?, 
                receipt_image_url = ?, last_updated_by = ? 
            WHERE id = ?`,
            [
                expense_date, 
                category, 
                details, 
                amount,
                receipt_image_url,
                userId, // (สำคัญ) บันทึกว่าใครอัปเดต
                expenseId // ID ของรายจ่ายที่จะอัปเดต
            ]
        );

        // 5. (สำคัญ) บันทึก Log การกระทำ
        await db.promise().query(
            'INSERT INTO action_logs (user_id, action_type, target_table, target_id, details) VALUES (?, ?, ?, ?, ?)',
            [userId, 'UPDATE', 'expenses', expenseId, `User ${username} updated expense ID: ${expenseId} (Details: ${details})`]
        );

        // 6. ส่งคำตอบกลับไป
        console.log(`✅ Expense ID ${expenseId} ('${details}') updated by user '${username}'.`);
        res.status(200).json({ message: 'อัปเดตรายจ่ายสำเร็จ!' });

    } catch (error) {
        console.error('❌ Error updating expense:', error.message);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดที่ Server' });
    }
});

## 🚀 ขั้นตอนที่ 14: สร้าง API สำหรับ "ลบรายจ่าย" (Delete Expense)
*(สถานะ: ดำเนินการเสร็จสิ้น)*

เราได้สร้าง API endpoint (`DELETE /api/expenses/:id`) ซึ่งเป็นส่วนสุดท้ายของ CRUD สำหรับโมดูลรายจ่าย (Delete ใน CRUD) และมีการบันทึก Log การลบ

### 1. (เพิ่ม) โค้ด API สำหรับ "ลบรายจ่าย"
เราได้เพิ่มโค้ดนี้ต่อท้าย `PUT /api/expenses/:id` ใน `index.js`

```javascript
// @route   DELETE /api/expenses/:id
// @desc    ลบรายจ่าย (Delete an expense)
// @access  Private

app.delete('/api/expenses/:id', authenticateToken, async (req, res) => {
    // ดึงข้อมูลผู้ใช้ที่กำลังลบ (จาก Token)
    const { userId, username } = req.user; 
    
    // ดึง ID รายจ่ายที่จะลบ (จาก URL)
    const expenseId = req.params.id;

    try {
        // 1. ตรวจสอบก่อนว่ามีรายจ่ายนี้อยู่จริงหรือไม่ (เพื่อเอาข้อมูลมาบันทึก Log)
        const [expenses] = await db.promise().query(
            'SELECT details FROM expenses WHERE id = ?',
            [expenseId]
        );

        if (expenses.length === 0) {
            return res.status(404).json({ message: 'ไม่พบรายการรายจ่ายนี้ (Not Found)' });
        }
        
        const expenseDetails = expenses[0].details; // เก็บรายละเอียดไว้ก่อนลบ

        // 2. สั่งลบข้อมูล
        await db.promise().query(
            'DELETE FROM expenses WHERE id = ?',
            [expenseId]
        );

        // 3. (สำคัญ) บันทึก Log การกระทำ
        await db.promise().query(
            'INSERT INTO action_logs (user_id, action_type, target_table, target_id, details) VALUES (?, ?, ?, ?, ?)',
            [userId, 'DELETE', 'expenses', expenseId, `User ${username} DELETED expense ID: ${expenseId} (Details: ${expenseDetails})`]
        );

        // 4. ส่งคำตอบกลับไป
        console.log(`✅ Expense ID ${expenseId} ('${expenseDetails}') DELETED by user '${username}'.`);
        res.status(200).json({ message: 'ลบรายจ่ายสำเร็จ!' });

    } catch (error) {
        console.error('❌ Error deleting expense:', error.message);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดที่ Server' });
    }
});

2. การทดสอบ
เราได้ทดสอบ API นี้โดยใช้ Method DELETE ใน Thunder Client พร้อม Bearer Token

ผลลัพธ์ที่ได้คือ Status 200 OK และข้อมูลถูกลบออกจาก expenses และ action_logs ได้รับการอัปเดต

## 🚀 ขั้นตอนที่ 15: (โมดูล 3) สร้าง API "ยืนยันการขาย" (POS - Create Sale)
*(สถานะ: ดำเนินการเสร็จสิ้น)*

เราได้สร้าง API endpoint (`POST /api/sales`) ซึ่งเป็นหัวใจของระบบ POS (ข้อกำหนด 3 และ 5.1) API นี้ใช้ **Database Transaction** เพื่อรับประกันความถูกต้องของข้อมูล (Data Integrity)

### 💡 แนวคิดหลัก: Transaction
เราใช้ `Transaction` เพื่อ "รวบ" การทำงาน 3 อย่างให้เป็น "กลุ่มเดียว":
1.  **บันทึกหัวบิล** (ตาราง `sales`)
2.  **บันทึกรายละเอียดบิล** (ตาราง `sale_details`)
3.  **ตัดสต็อก** (ตาราง `products`)

ถ้าขั้นตอนใดขั้นตอนหนึ่งล้มเหลว (เช่น สต็อกไม่พอ) ระบบจะ `ROLLBACK` (ยกเลิก) ทั้งหมด เพื่อป้องกันข้อมูลพัง (เช่น บิลออกแต่สต็อกไม่ตัด)

### 1. (เพิ่ม) โค้ด API สำหรับ "ยืนยันการขาย"
เราได้เพิ่มโค้ดนี้ (กลุ่ม `--- 8. Sales Routes ---`) ต่อท้าย API ของ Expense ใน `index.js`

```javascript
// --- 8. Sales Routes (Point of Sale) ---

// @route   POST /api/sales
// @desc    สร้างการขายใหม่ (ยืนยันการขายจาก POS)
// @access  Private

app.post('/api/sales', authenticateToken, async (req, res) => {
    const { userId, username } = req.user;
    const { cart, totalAmount } = req.body;

    if (!cart || cart.length === 0 || totalAmount === undefined) {
        return res.status(400).json({ message: 'ข้อมูลตะกร้าสินค้าไม่ถูกต้อง' });
    }

    let connection;
    try {
        // 3. ดึง Connection และเริ่ม Transaction
        connection = await db.promise().getConnection();
        await connection.beginTransaction();
        console.log("Transaction Started.");

        // 5. ตรวจสอบสต็อก (Pre-check)
        for (const item of cart) {
            const [products] = await connection.query(
                'SELECT name, stock_quantity FROM products WHERE id = ? FOR UPDATE',
                [item.product_id]
            );
            if (products.length === 0) {
                throw new Error(`ไม่พบสินค้า ID: ${item.product_id}`);
            }
            if (products[0].stock_quantity < item.quantity) {
                throw new Error(`สต็อกสินค้า "${products[0].name}" ไม่เพียงพอ (มี ${products[0].stock_quantity} ชิ้น)`);
            }
        }

        // 6. บันทึกหัวบิล (sales)
        const [saleResult] = await connection.query(
            'INSERT INTO sales (total_amount, created_by, last_updated_by) VALUES (?, ?, ?)',
            [totalAmount, userId, userId]
        );
        const newSaleId = saleResult.insertId;
        console.log(`Sale Header created (ID: ${newSaleId})`);

        // 7. บันทึกรายละเอียดบิล (sale_details) และตัดสต็อก
        let logDetails = []; 
        for (const item of cart) {
            const [products] = await connection.query('SELECT sell_price FROM products WHERE id = ?', [item.product_id]);
            const priceAtSale = products[0].sell_price;
            const lineTotal = (priceAtSale * item.quantity) - (item.discount_amount || 0);
            
            await connection.query(
                'INSERT INTO sale_details (sale_id, product_id, quantity, price_at_sale, discount_amount, line_total) VALUES (?, ?, ?, ?, ?, ?)',
                [newSaleId, item.product_id, item.quantity, priceAtSale, item.discount_amount || 0, lineTotal]
            );

            // (สำคัญ) ตัดสต็อก
            await connection.query(
                'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
                [item.quantity, item.product_id]
            );
            logDetails.push(`(ID ${item.product_id}: ${item.quantity} ชิ้น)`);
        }
        console.log("Sale Details saved and Stock updated.");

        // 8. บันทึก Log
        await connection.query(
            'INSERT INTO action_logs (user_id, action_type, target_table, target_id, details) VALUES (?, ?, ?, ?, ?)',
            [userId, 'CREATE_SALE', 'sales', newSaleId, `User ${username} created Sale ID: ${newSaleId}. Items: ${logDetails.join(', ')}`]
        );
        console.log("Action Logged.");

        // 9. (สำคัญ) ยืนยัน Transaction
        await connection.commit();
        console.log("Transaction Committed.");

        res.status(201).json({ message: 'บันทึกการขายสำเร็จ!', saleId: newSaleId });

    } catch (error) {
        // 11. (สำคัญ) หากเกิดข้อผิดพลาด ให้ Rollback
        if (connection) {
            await connection.rollback();
            console.error("Transaction Rolled Back.");
        }
        console.error('❌ Error during sale transaction:', error.message);
        res.status(500).json({ message: 'เกิดข้อผิดพลาด: ' + error.message });

    } finally {
        // 12. (สำคัญ) คืน Connection
        if (connection) {
            connection.release();
            console.log("Connection Released.");
        }
    }
});

2. การทดสอบ
เราได้ทดสอบ API นี้โดยใช้ Method POST พร้อม Bearer Token

เราส่ง cart (Array) และ totalAmount ไปใน Body

เรายืนยันว่า:

ถ้าสำเร็จ: สต็อก (products) ถูกตัด, ข้อมูลถูกบันทึกลง sales และ sale_details

ถ้าล้มเหลว (เช่น สต็อกไม่พอ): ข้อมูลไม่เปลี่ยนแปลง (Rollback)

## 🚀 ขั้นตอนที่ 16: สร้าง API สำหรับ "ดึงประวัติการขาย" (Read Sales History)
*(สถานะ: ดำเนินการเสร็จสิ้น)*

เราได้สร้าง API endpoint (ข้อกำหนด 4) สำหรับการ "อ่าน" (Read) ประวัติการขาย โดยแบ่งเป็น 2 ส่วน:

### 1. (เพิ่ม) โค้ด API สำหรับ "ดึงประวัติบิลทั้งหมด"
เราได้เพิ่มโค้ดนี้ต่อท้าย `POST /api/sales` ใน `index.js` เพื่อดึง "หัวบิล" ทั้งหมด

```javascript
// @route   GET /api/sales
// @desc    ดึงประวัติการขาย (หัวบิล) ทั้งหมด (Get all sales)
// @access  Private

app.get('/api/sales', authenticateToken, async (req, res) => {
    try {
        // Join ตาราง users เพื่อดึง "ชื่อ" ผู้ขาย (created_by)
        const [sales] = await db.promise().query(
            `SELECT 
                s.*, 
                u.username AS created_by_username 
            FROM sales s
            LEFT JOIN users u ON s.created_by = u.id
            ORDER BY s.sale_date DESC`
        );
        res.status(200).json(sales);
    } catch (error) {
        console.error('❌ Error getting sales history:', error.message);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดที่ Server' });
    }
});

2. (เพิ่ม) โค้ด API สำหรับ "ดึงรายละเอียดบิล 1 ใบ"
เราได้เพิ่มโค้ดนี้ต่อท้าย GET /api/sales เพื่อดึง "ไส้ใน" (รายละเอียด) ของบิล

// @route   GET /api/sales/:id
// @desc    ดึงข้อมูลบิล 1 ใบ พร้อมรายละเอียดสินค้า (Get single sale details)
// @access  Private

app.get('/api/sales/:id', authenticateToken, async (req, res) => {
    const saleId = req.params.id;
    try {
        // 1. ดึงข้อมูล "หัวบิล"
        const [sales] = await db.promise().query(
            `SELECT s.*, u.username AS created_by_username 
            FROM sales s
            LEFT JOIN users u ON s.created_by = u.id
            WHERE s.id = ?`,
            [saleId]
        );

        if (sales.length === 0) {
            return res.status(404).json({ message: 'ไม่พบบิลนี้ (Not Found)' });
        }

        // 2. ดึงข้อมูล "รายการสินค้า" (ไส้ในบิล)
        const [details] = await db.promise().query(
            `SELECT 
                sd.*, 
                p.name AS product_name 
            FROM sale_details sd
            LEFT JOIN products p ON sd.product_id = p.id
            WHERE sd.sale_id = ?`,
            [saleId]
        );

        // 3. ประกอบร่าง (หัวบิล + รายการสินค้า) ส่งกลับไป
        const result = {
            saleHeader: sales[0],
            saleDetails: details
        };
        res.status(200).json(result);
    } catch (error) {
        console.error('❌ Error getting sale details:', error.message);
        res.status(500).json({ message: 'เกิดข้อผิดพลาดที่ Server' });
    }
});

การทดสอบ
เราได้ทดสอบ API ทั้งสอง (GET /api/sales และ GET /api/sales/1) ด้วย Bearer Token และได้รับผลลัพธ์เป็น JSON ที่ถูกต้อง

## 🚀 ขั้นตอนที่ 17: สร้าง API "ลบบิล (ยกเลิกบิล) และ คืนสต็อก"
*(สถานะ: ดำเนินการเสร็จสิ้น)*

เราได้สร้าง API endpoint (`DELETE /api/sales/:id`) เพื่อจัดการการยกเลิกบิล (ข้อกำหนด 4) ซึ่งเป็นไปตาม **ข้อกำหนด 5.2** คือต้อง **"คืนสต็อก"** อัตโนมัติ

เราใช้ **Database Transaction** อีกครั้ง เพื่อรับประกันว่า "การคืนสต็อก" (UPDATE `products`) และ "การลบบิล" (DELETE `sales`) จะต้องสำเร็จพร้อมกันเท่านั้น

### 1. (เพิ่ม) โค้ด API สำหรับ "ลบบิลและคืนสต็อก"
เราได้เพิ่มโค้ดนี้ต่อท้าย `GET /api/sales/:id` ใน `index.js`

```javascript
// @route   DELETE /api/sales/:id
// @desc    ลบบิล (ยกเลิกบิล) และ "คืนสต็อก" อัตโนมัติ
// @access  Private

app.delete('/api/sales/:id', authenticateToken, async (req, res) => {
    const { userId, username } = req.user;
    const saleId = req.params.id;

    let connection;
    try {
        // 1. (สำคัญ) เริ่ม Transaction
        connection = await db.promise().getConnection();
        await connection.beginTransaction();
        console.log("Delete Sale Transaction Started.");

        // 2. ค้นหารายการสินค้า "ทั้งหมด" ในบิลนี้ (จาก sale_details)
        const [details] = await connection.query(
            'SELECT product_id, quantity FROM sale_details WHERE sale_id = ?',
            [saleId]
        );

        let logDetails = [];

        // 3. (สำคัญ) วน Loop เพื่อ "คืนสต็อก" ทีละรายการ
        for (const item of details) {
            await connection.query(
                'UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?',
                [item.quantity, item.product_id]
            );
            logDetails.push(`(ProductID ${item.product_id}: Restored ${item.quantity} units)`);
        }
        console.log(`Stock restored for Sale ID ${saleId}.`);

        // 4. ลบ "หัวบิล" (จากตาราง sales)
        // (sale_details จะถูกลบอัตโนมัติเพราะ "ON DELETE CASCADE")
        await connection.query(
            'DELETE FROM sales WHERE id = ?',
            [saleId]
        );
        console.log(`Sale Header (ID: ${saleId}) and Details deleted.`);

        // 5. บันทึก Log การกระทำ
        await connection.query(
            'INSERT INTO action_logs (user_id, action_type, target_table, target_id, details) VALUES (?, ?, ?, ?, ?)',
            [userId, 'DELETE_SALE', 'sales', saleId, `User ${username} DELETED Sale ID: ${saleId}. Stock restored: ${logDetails.join(', ')}`]
        );
        console.log("Action Logged.");

        // 6. (สำคัญ) ยืนยัน Transaction
        await connection.commit();
        console.log("Transaction Committed.");

        res.status(200).json({ message: `ยกเลิกบิล (ID: ${saleId}) และ คืนสต็อกสินค้าสำเร็จ!` });

    } catch (error) {
        // 7. (สำคัญ) หากเกิดข้อผิดพลาด ให้ Rollback
        if (connection) {
            await connection.rollback();
            console.error("Transaction Rolled Back.");
        }
        console.error('❌ Error during sale deletion (restock):', error.message);
        res.status(500).json({ message: 'เกิดข้อผิดพลาด: ' + error.message });

    } finally {
        // 8. (สำคัญ) คืน Connection
        if (connection) {
            connection.release();
            console.log("Connection Released.");
        }
    }
});

2. การทดสอบ
เราได้ทดสอบ API นี้โดยใช้ Method DELETE (/api/sales/1) พร้อม Bearer Token

เรายืนยันว่า (ถ้าสำเร็จ) บิลใน sales และ sale_details ถูกลบ และ stock_quantity ใน products ถูก "บวกคืน"

## 🚀 ขั้นตอนที่ 18: สร้าง API "แก้ไขบิล และ ปรับปรุงสต็อก"
*(สถานะ: ดำเนินการเสร็จสิ้น)*

เราได้สร้าง API endpoint (`PUT /api/sales/:id`) ซึ่งเป็นส่วนที่ซับซ้อนที่สุดของระบบ (ข้อกำหนด 4 และ **5.3**) เพื่อจัดการการแก้ไขบิลย้อนหลัง โดยต้อง **"ปรับปรุงสต็อก"** อัตโนมัติ

### 💡 แนวคิดหลัก: Transaction (Rollback + Deduct)
API นี้เปรียบเสมือนการ "ลบ" (Delete) และ "สร้าง" (Create) พร้อมกันใน Transaction เดียว:
1.  **เริ่ม Transaction**
2.  ค้นหา "ตะกร้าเก่า" (Old Cart)
3.  **Rollback:** "คืนสต็อก" ทั้งหมดตาม "ตะกร้าเก่า"
4.  รับ "ตะกร้าใหม่" (New Cart) จากผู้ใช้
5.  **Pre-check:** ตรวจสอบสต็อกสำหรับ "ตะกร้าใหม่" (ถ้าไม่พอ = Rollback ทั้งหมด)
6.  ลบ `sale_details` เก่า
7.  **Deduct:** เพิ่ม `sale_details` ใหม่ และ "ตัดสต็อก" ตาม "ตะกร้าใหม่"
8.  อัปเดต `sales` (หัวบิล) ด้วยยอดรวมใหม่
9.  บันทึก Log และ `Commit`

### 1. (เพิ่ม) โค้ด API สำหรับ "แก้ไขบิลและปรับปรุงสต็อก"
เราได้เพิ่มโค้ดนี้ต่อท้าย `DELETE /api/sales/:id` ใน `index.js`

```javascript
// @route   PUT /api/sales/:id
// @desc    แก้ไขบิล และ "ปรับปรุงสต็อก" อัตโนมัติ (Update Sale & Adjust Stock)
// @access  Private (Admin Only)

app.put('/api/sales/:id', authenticateToken, async (req, res) => {
    // (หมายเหตุ: เราสามารถเพิ่มการตรวจสอบ req.user.role === 'Admin' ที่นี่)
    
    const { userId, username } = req.user;
    const saleId = req.params.id;
    const { cart: newCart, totalAmount: newTotalAmount } = req.body;

    if (!newCart || newCart.length === 0 || newTotalAmount === undefined) {
        return res.status(400).json({ message: 'ข้อมูลตะกร้าสินค้าใหม่ไม่ถูกต้อง' });
    }

    let connection;
    try {
        // 2. เริ่ม Transaction
        connection = await db.promise().getConnection();
        await connection.beginTransaction();
        console.log("Update Sale Transaction Started.");

        // --- 3: (Rollback) คืนสต็อกตาม "บิลเก่า" ---
        const [oldDetails] = await connection.query(
            'SELECT product_id, quantity FROM sale_details WHERE sale_id = ?',
            [saleId]
        );
        if (oldDetails.length === 0) throw new Error(`ไม่พบรายละเอียดบิลเดิม (ID: ${saleId})`);

        for (const item of oldDetails) {
            await connection.query(
                'UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?',
                [item.quantity, item.product_id]
            );
        }
        console.log(`Stock restored (Rollback) for Sale ID ${saleId}.`);

        // --- 4: (Pre-check) ตรวจสอบสต็อกสำหรับ "ตะกร้าใหม่" ---
        for (const item of newCart) {
            const [products] = await connection.query('SELECT name, stock_quantity FROM products WHERE id = ? FOR UPDATE', [item.product_id]);
            if (products.length === 0) throw new Error(`(New Cart) ไม่พบสินค้า ID: ${item.product_id}`);
            if (products[0].stock_quantity < item.quantity) {
                throw new Error(`(New Cart) สต็อกสินค้า "${products[0].name}" ไม่เพียงพอ (มี ${products[0].stock_quantity} ชิ้น)`);
            }
        }

        // --- 5: ลบ "รายละเอียดบิลเก่า" ---
        await connection.query('DELETE FROM sale_details WHERE sale_id = ?', [saleId]);

        // --- 6: (Deduct) เพิ่ม "รายละเอียดบิลใหม่" และ "ตัดสต็อก" ---
        let logDetails = [];
        for (const item of newCart) {
            const [products] = await connection.query('SELECT sell_price FROM products WHERE id = ?', [item.product_id]);
            const priceAtSale = products[0].sell_price;
            const lineTotal = (priceAtSale * item.quantity) - (item.discount_amount || 0);
            
            await connection.query(
                'INSERT INTO sale_details (sale_id, product_id, quantity, price_at_sale, discount_amount, line_total) VALUES (?, ?, ?, ?, ?, ?)',
                [saleId, item.product_id, item.quantity, priceAtSale, item.discount_amount || 0, lineTotal]
            );
            await connection.query(
                'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
                [item.quantity, item.product_id]
            );
            logDetails.push(`(ID ${item.product_id}: ${item.quantity} ชิ้น)`);
        }

        // --- 7: อัปเดต "หัวบิล" (ยอดรวมใหม่) ---
        await connection.query('UPDATE sales SET total_amount = ?, last_updated_by = ? WHERE id = ?', [newTotalAmount, userId, saleId]);

        // --- 8: บันทึก Log ---
        await connection.query('INSERT INTO action_logs (user_id, action_type, target_table, target_id, details) VALUES (?, ?, ?, ?, ?)',
            [userId, 'UPDATE_SALE', 'sales', saleId, `User ${username} UPDATED Sale ID: ${saleId}. New Items: ${logDetails.join(', ')}`]
        );

        // 9. ยืนยัน Transaction
        await connection.commit();
        console.log("Transaction Committed.");
        res.status(200).json({ message: `แก้ไขบิล (ID: ${saleId}) และ ปรับปรุงสต็อกสำเร็จ!` });

    } catch (error) {
        // 10. หากเกิดข้อผิดพลาด ให้ Rollback
        if (connection) {
            await connection.rollback();
            console.error("Transaction Rolled Back.");
        }
        console.error('❌ Error during sale update (adjust stock):', error.message);
        res.status(500).json({ message: 'เกิดข้อผิดพลาด: ' + error.message });

    } finally {
        // 11. คืน Connection
        if (connection) {
            connection.release();
            console.log("Connection Released.");
        }
    }
});

2. การทดสอบ
เราได้ทดสอบ API นี้ (PUT /api/sales/1) โดยส่ง "ตะกร้าใหม่" (New Cart)

เรายืนยันว่า (ถ้าสำเร็จ) สต็อก (products) จะถูก "ปรับปรุง" (เพิ่ม/ลด) อย่างถูกต้องตามผลต่างของบิลเก่าและบิลใหม่



