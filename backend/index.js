//import Packages
const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const path = require("path");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Initial Setup
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());


// (เพิ่ม) สั่งให้ Express เปิดโฟลเดอร์ 'public' เป็นแบบ Static
// (เพื่อให้ Frontend สามารถ "อ่าน" รูปภาพจาก URL http://localhost:3001/uploads/...)
app.use(express.static("public"));

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

// --- (เพิ่ม) การตั้งค่า Multer (Storage Engine) ---
const storage = multer.diskStorage({
  // บอก Multer ว่าจะเก็บไฟล์ไว้ที่ไหน
  destination: (req, file, cb) => {
    cb(null, "public/uploads/");
  },
  // บอก Multer ว่าจะตั้งชื่อไฟล์ใหม่ (เพื่อป้องกันชื่อซ้ำ)
  filename: (req, file, cb) => {
    // (ชื่อไฟล์ใหม่ = วันที่ปัจจุบัน + นามสกุลไฟล์เดิม)
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// (ฟังก์ชันกรองไฟล์: อนุญาตเฉพาะ jpg, jpeg, png)
const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg"
  ) {
    cb(null, true);
  } else {
    cb(new Error("รองรับเฉพาะไฟล์ .jpg, .jpeg, .png เท่านั้น"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});


// Test Connect to DB
db.getConnection((err, connection) => {
  if (err) {
    console.error("❌  Error connecting to the database:", err.message);
    return;
  }
  console.log("✅  Successfully connected to the database (MySQL).");
  connection.release(); // คืน connection กลับเข้า Pool
});

// สร้าง Route (API Endpoint) พื้นฐาน
app.get("/", (req, res) => {
  res.json({ message: "ยินดีต้อนรับสู่ Backend API ของ fahfe_shop!" });
});

// ------------------ Authentication Middleware (ด่านตรวจตั๋ว) ------------------------------
const authenticateToken = (req, res, next) => {
  // 1. ดึง Token จาก Header
  const authHeader = req.headers["authorization"];
  // Format ที่ส่งมาจะเป็น "Bearer <TOKEN>"
  const token = authHeader && authHeader.split(" ")[1];

  // 2. ตรวจสอบว่ามี Token ส่งมาหรือไม่
  if (token == null) {
    return res.status(401).json({ message: "ไม่ได้รับ Token (Access Denied)" });
  }

  // 3. ตรวจสอบ Token
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      // ถ้า Token หมดอายุ หรือไม่ถูกต้อง
      return res.status(403).json({ message: "Token ไม่ถูกต้อง (Forbidden)" });
    }

    // 4. (สำคัญ) ถ้า Token ถูกต้อง
    // ให้แนบข้อมูลผู้ใช้ (ที่ถอดรหัสได้จาก Token) ไปกับ "req"
    // เพื่อให้ API ปลายทางรู้ว่า "ใคร" กำลังร้องขอ
    req.user = user;

    next(); // ปล่อยให้คำขอไปทำงานต่อ
  });
};

//----------------------Auth Routes (Register) ---------------------------
// (เราใช้ async/await เพื่อจัดการกับการเชื่อมต่อ DB และ Hashing ที่ต้องใช้เวลา)
app.post('/api/register', express.json(), async (req, res) => {
  try {
    // 1. รับข้อมูลจาก Frontend (req.body)
    const { username, password, role } = req.body;

    // 2. ตรวจสอบข้อมูลเบื้องต้น
    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "กรุณากรอก Username และ Password" });
    }

    // 3. (สำคัญ) เข้ารหัสรหัสผ่าน
    // เราใช้ "salt" (ความซับซ้อน) 10 รอบ
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. บันทึกผู้ใช้ใหม่ลงฐานข้อมูล
    // (เราใช้ .promise() เพื่อให้ db.query รองรับ async/await)
    const [results] = await db.promise().query(
      "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
      [username, hashedPassword, role || "Staff"] // ถ้าไม่ส่ง role มา ให้เป็น 'Staff'
    );

    const newUserId = results.insertId; // ดึง ID ของ User ที่เพิ่งสร้าง

    // 5. (สำคัญ) บันทึก Log การกระทำ
    await db
      .promise()
      .query(
        "INSERT INTO action_logs (user_id, action_type, target_table, target_id, details) VALUES (?, ?, ?, ?, ?)",
        [
          newUserId,
          "REGISTER",
          "users",
          newUserId,
          `User ${username} registered.`,
        ]
      );

    // 6. ส่งคำตอบกลับไป
    console.log(`✅ User '${username}' registered successfully.`);
    res
      .status(201)
      .json({ message: "ลงทะเบียนผู้ใช้สำเร็จ!", userId: newUserId });
  } catch (error) {
    // 7. จัดการ Error (เช่น Username ซ้ำ)
    if (error.code === "ER_DUP_ENTRY") {
      console.error("Error: Username already exists.");
      return res.status(409).json({ message: "Username นี้มีผู้ใช้งานแล้ว" });
    }

    console.error("❌ Error during registration:", error.message);
    res.status(500).json({ message: "เกิดข้อผิดพลาดที่ Server" });
  }
});

// ---------------------- Auth Routes (Login) ----------------------------

app.post('/api/login', express.json(), async (req, res) => {
  try {
    // 1. รับข้อมูลจาก Frontend
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "กรุณากรอก Username และ Password" });
    }

    // 2. ค้นหาผู้ใช้ในฐานข้อมูล
    const [users] = await db
      .promise()
      .query("SELECT * FROM users WHERE username = ?", [username]);

    // 3. ตรวจสอบว่ามีผู้ใช้นี้หรือไม่
    if (users.length === 0) {
      console.warn(`Login attempt failed: User '${username}' not found.`);
      return res
        .status(401)
        .json({ message: "Username หรือ Password ไม่ถูกต้อง" });
    }

    const user = users[0]; // ข้อมูลผู้ใช้ที่พบ

    // 4. (สำคัญ) เปรียบเทียบรหัสผ่าน
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      console.warn(
        `Login attempt failed: Incorrect password for user '${username}'.`
      );
      return res
        .status(401)
        .json({ message: "Username หรือ Password ไม่ถูกต้อง" });
    }

    // --- Login สำเร็จ ---

    // 5. (สำคัญ) สร้าง JWT Token (ตั๋ว)
    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        role: user.role,
      }, // ข้อมูลที่เราอยากเก็บใน "ตั๋ว"
      process.env.JWT_SECRET, // กุญแจลับ (จากไฟล์ .env)
      { expiresIn: "30d" } // Token นี้มีอายุ 30 วัน (สำหรับ Dev)
    );

    // 6. (สำคัญ) บันทึก Log การ Login
    await db
      .promise()
      .query(
        "INSERT INTO action_logs (user_id, action_type, details) VALUES (?, ?, ?)",
        [user.id, "LOGIN", `User ${user.username} logged in.`]
      );

    // 7. ส่ง Token กลับไปให้ Frontend
    console.log(`✅ User '${user.username}' logged in successfully.`);
    res.status(200).json({
      message: "เข้าสู่ระบบสำเร็จ",
      token: token,
      user: {
        // เราอาจจะส่งข้อมูลผู้ใช้ (ที่ไม่ใช่รหัสผ่าน) กลับไปด้วย
        id: user.id,
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("❌ Error during login:", error.message);
    res.status(500).json({ message: "เกิดข้อผิดพลาดที่ Server" });
  }
});

// --- (เพิ่ม) API สำหรับ Upload รูปภาพ ---
// (เราใช้ 'upload.single('image')' - 'image' คือชื่อ key ที่ Frontend ต้องส่งมา)
app.post(
  "/api/upload",
  authenticateToken,
  upload.single("image"),
  (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "ไม่ได้แนบไฟล์" });
      }

      // (สำคัญ) สร้าง URL ที่ Frontend จะใช้
      // (req.file.filename คือชื่อใหม่ที่ Multer ตั้งให้ เช่น 123456789.jpg)
      const fileUrl = `http://localhost:3001/uploads/${req.file.filename}`;

      // ส่ง URL กลับไปให้ Frontend
      res.status(200).json({
        message: "อัปโหลดไฟล์สำเร็จ",
        imageUrl: fileUrl,
      });
    } catch (error) {
      res.status(500).json({ message: "เกิดข้อผิดพลาด: " + error.message });
    }
  }
);

// --------------------- Product Routes (Inventory Management) -----------------------

// @route   POST /api/products
// @desc    สร้างสินค้าใหม่ (Create new product)
// @access  Private (ต้อง Login โดยใช้ authenticateToken)

app.post('/api/products', authenticateToken, express.json(), async (req, res) => {
  // -----------------------------------------------------------------
  // (สำคัญ) สังเกตว่าเรา "แทรก" authenticateToken เข้าไป
  // ถ้า Token ถูกต้อง เราจะสามารถเข้าถึง "ข้อมูลผู้ใช้" ได้จาก req.user
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
      product_image_url,
    } = req.body;

    // 2. ตรวจสอบข้อมูลเบื้องต้น
    if (!name || !sell_price) {
      // เราอาจกำหนดว่า 'ชื่อ' กับ 'ราคาขาย' ห้ามว่าง
      return res
        .status(400)
        .json({ message: "กรุณากรอกชื่อสินค้า และ ราคาขาย" });
    }

    // 3. บันทึกลงฐานข้อมูล
    const [results] = await db
      .promise()
      .query(
        "INSERT INTO products (name, category, grade, details, cost_price, sell_price, stock_quantity, product_image_url, last_updated_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        [
          name,
          category,
          grade,
          details,
          cost_price || 0.0, // ถ้าไม่ส่งมา ให้เป็น 0
          sell_price,
          stock_quantity || 0, // ถ้าไม่ส่งมา ให้เป็น 0
          product_image_url,
          userId, // (สำคัญ) บันทึกว่าใครเป็นคนสร้าง
        ]
      );

    const newProductId = results.insertId; // ดึง ID ของสินค้าที่เพิ่งสร้าง

    // 4. (สำคัญ) บันทึก Log การกระทำ (ตามข้อกำหนด 0.)
    await db
      .promise()
      .query(
        "INSERT INTO action_logs (user_id, action_type, target_table, target_id, details) VALUES (?, ?, ?, ?, ?)",
        [
          userId,
          "CREATE",
          "products",
          newProductId,
          `User ${username} created product: ${name}`,
        ]
      );

    // 5. ส่งคำตอบกลับไป
    console.log(`✅ Product '${name}' created by user '${username}'.`);
    res
      .status(201)
      .json({ message: "เพิ่มสินค้าสำเร็จ!", productId: newProductId });
  } catch (error) {
    console.error("❌ Error creating product:", error.message);
    res.status(500).json({ message: "เกิดข้อผิดพลาดที่ Server" });
  }
});

// @route   GET /api/products
// @desc    ดึงข้อมูลสินค้าทั้งหมด (Get all products)
// @access  Private

app.get('/api/products', authenticateToken, async (req, res) => {
  try {
    // 1. ดึงข้อมูลสินค้าทั้งหมดจากฐานข้อมูล
    // เราสั่ง .promise() ก่อน แล้วค่อย .query()
    const [products] = await db.promise().query(
      "SELECT * FROM products ORDER BY created_at DESC" // ดึงมาทั้งหมด โดยเรียงจากใหม่สุดไปเก่าสุด
    );

    // 2. ส่งข้อมูลกลับไป
    res.status(200).json(products); // ส่งข้อมูลสินค้าทั้งหมดกลับไปเป็น Array
  } catch (error) {
    console.error("❌ Error getting products:", error.message);
    res.status(500).json({ message: "เกิดข้อผิดพลาดที่ Server" });
  }
});

// @route   GET /api/products/:id
// @desc    ดึงข้อมูลสินค้า 1 ชิ้น (Get single product by ID)
// @access  Private

app.get("/api/products/:id", authenticateToken, async (req, res) => {
  try {
    // 1. ดึง "id" ที่ผู้ใช้ส่งมาทาง URL (เรียกว่า "params")
    const productId = req.params.id;

    // 2. ค้นหาสินค้า ID นั้นในฐานข้อมูล
    const [products] = await db
      .promise()
      .query("SELECT * FROM products WHERE id = ?", [productId]);

    // 3. ตรวจสอบว่าหาสินค้าเจอหรือไม่
    if (products.length === 0) {
      return res.status(404).json({ message: "ไม่พบสินค้านี้ (Not Found)" });
    }

    // 4. ส่งข้อมูลสินค้าชิ้นนั้น (ซึ่งมีแค่ 1 ชิ้น, products[0]) กลับไป
    res.status(200).json(products[0]);
  } catch (error) {
    console.error("❌ Error getting single product:", error.message);
    res.status(500).json({ message: "เกิดข้อผิดพลาดที่ Server" });
  }
});

// @route   PUT /api/products/:id
// @desc    แก้ไขข้อมูลสินค้า (Update a product)
// @access  Private

app.put("/api/products/:id", authenticateToken, express.json(), async (req, res) => {
  // ดึงข้อมูลผู้ใช้ที่กำลังแก้ไข (จาก Token)
  const { userId, username } = req.user;

  // ดึง ID สินค้าที่จะแก้ไข (จาก URL)
  const productId = req.params.id;

  try {
    // 1. ตรวจสอบก่อนว่ามีสินค้านี้อยู่จริงหรือไม่
    const [products] = await db
      .promise()
      .query("SELECT * FROM products WHERE id = ?", [productId]);

    if (products.length === 0) {
      return res.status(404).json({ message: "ไม่พบสินค้านี้ (Not Found)" });
    }

    // (เราเก็บข้อมูลเก่าไว้เพื่อเปรียบเทียบ หรือบันทึก Log - ถ้าต้องการ)
    // const oldProduct = products[0];

    // 2. รับข้อมูล "ใหม่" ที่ส่งมาจาก Frontend (req.body)
    const {
      name,
      category,
      grade,
      details,
      cost_price,
      sell_price,
      stock_quantity,
      // (เราไม่ควรอนุญาตให้อัปเดต product_image_url ที่นี่ อาจจะต้องแยก API)
    } = req.body;

    // 3. ตรวจสอบข้อมูลเบื้องต้น
    if (!name || !sell_price) {
      return res
        .status(400)
        .json({ message: "กรุณากรอกชื่อสินค้า และ ราคาขาย" });
    }

    // 4. อัปเดตข้อมูลลงฐานข้อมูล
    // (สังเกตว่าเราอัปเดต field last_updated_by ด้วย)
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
        productId, // ID ของสินค้าที่จะอัปเดต
      ]
    );

    // 5. (สำคัญ) บันทึก Log การกระทำ (ตามข้อกำหนด 1.)
    await db
      .promise()
      .query(
        "INSERT INTO action_logs (user_id, action_type, target_table, target_id, details) VALUES (?, ?, ?, ?, ?)",
        [
          userId,
          "UPDATE",
          "products",
          productId,
          `User ${username} updated product ID: ${productId} (Name: ${name})`,
        ]
      );

    // 6. ส่งคำตอบกลับไป
    console.log(
      `✅ Product ID ${productId} ('${name}') updated by user '${username}'.`
    );
    res.status(200).json({ message: "อัปเดตสินค้าสำเร็จ!" });
  } catch (error) {
    console.error("❌ Error updating product:", error.message);
    res.status(500).json({ message: "เกิดข้อผิดพลาดที่ Server" });
  }
});

// @route   DELETE /api/products/:id
// @desc    ลบสินค้า (Delete a product)
// @access  Private

app.delete("/api/products/:id", authenticateToken, async (req, res) => {
  // ดึงข้อมูลผู้ใช้ที่กำลังลบ (จาก Token)
  const { userId, username } = req.user;

  // ดึง ID สินค้าที่จะลบ (จาก URL)
  const productId = req.params.id;

  try {
    // 1. ตรวจสอบก่อนว่ามีสินค้านี้อยู่จริงหรือไม่
    const [products] = await db.promise().query(
      "SELECT name FROM products WHERE id = ?", // ดึงมาแค่ชื่อเพื่อบันทึก Log
      [productId]
    );

    if (products.length === 0) {
      return res.status(404).json({ message: "ไม่พบสินค้านี้ (Not Found)" });
    }

    const productName = products[0].name; // เก็บชื่อไว้ก่อนลบ

    // 2. สั่งลบข้อมูล
    await db.promise().query("DELETE FROM products WHERE id = ?", [productId]);

    // 3. (สำคัญ) บันทึก Log การกระทำ
    await db
      .promise()
      .query(
        "INSERT INTO action_logs (user_id, action_type, target_table, target_id, details) VALUES (?, ?, ?, ?, ?)",
        [
          userId,
          "DELETE",
          "products",
          productId,
          `User ${username} DELETED product ID: ${productId} (Name: ${productName})`,
        ]
      );

    // 4. ส่งคำตอบกลับไป
    console.log(
      `✅ Product ID ${productId} ('${productName}') DELETED by user '${username}'.`
    );
    res.status(200).json({ message: "ลบสินค้าสำเร็จ!" });
  } catch (error) {
    // 5. (สำคัญ) จัดการ Error กรณีลบไม่ได้
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      // (ER_ROW_IS_REFERENCED_2 คือ Error Code ของ MySQL ที่บอกว่า "ลบไม่ได้ เพราะมีตารางอื่นอ้างอิงอยู่")
      console.warn(
        `Failed to delete product ID ${productId}: It is referenced in sale_details.`
      );
      return res
        .status(409)
        .json({ message: "ลบสินค้าไม่ได้! สินค้านี้มีประวัติการขาย" });
    }

    console.error("❌ Error deleting product:", error.message);
    res.status(500).json({ message: "เกิดข้อผิดพลาดที่ Server" });
  }
});

// ----------------------- Expense Routes (Expense Tracking) --------------------

// @route   POST /api/expenses
// @desc    บันทึกรายจ่ายใหม่ (Create new expense)
// @access  Private

app.post('/api/expenses', authenticateToken, express.json(), async (req, res) => {
  // ดึงข้อมูลผู้ใช้ที่กำลังบันทึก (จาก Token)
  const { userId, username } = req.user;

  try {
    // 1. รับข้อมูลรายจ่ายจาก Frontend (req.body)
    const { expense_date, category, details, amount, receipt_image_url } =
      req.body;

    // 2. ตรวจสอบข้อมูลเบื้องต้น
    if (!expense_date || !details || !amount) {
      return res
        .status(400)
        .json({ message: "กรุณากรอก วันที่, รายละเอียด และ จำนวนเงิน" });
    }

    // (เราควรแปลง format วันที่ ถ้าจำเป็น)
    // const formattedDate = new Date(expense_date).toISOString().slice(0, 10);

    // 3. บันทึกลงฐานข้อมูล
    const [results] = await db
      .promise()
      .query(
        "INSERT INTO expenses (expense_date, category, details, amount, receipt_image_url, created_by, last_updated_by) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          expense_date, // (ควรส่งมาใน format 'YYYY-MM-DD')
          category,
          details,
          amount,
          receipt_image_url,
          userId, // (สำคัญ) บันทึกว่าใครเป็นคนสร้าง
          userId, // (สำคัญ) บันทึกว่าใครอัปเดตล่าสุด (ตอนสร้าง)
        ]
      );

    const newExpenseId = results.insertId; // ดึง ID ของรายจ่ายที่เพิ่งสร้าง

    // 4. (สำคัญ) บันทึก Log การกระทำ (ตามข้อกำหนด 0.)
    await db
      .promise()
      .query(
        "INSERT INTO action_logs (user_id, action_type, target_table, target_id, details) VALUES (?, ?, ?, ?, ?)",
        [
          userId,
          "CREATE",
          "expenses",
          newExpenseId,
          `User ${username} created expense: ${details} (Amount: ${amount})`,
        ]
      );

    // 5. ส่งคำตอบกลับไป
    console.log(`✅ Expense '${details}' created by user '${username}'.`);
    res
      .status(201)
      .json({ message: "บันทึกรายจ่ายสำเร็จ!", expenseId: newExpenseId });
  } catch (error) {
    console.error("❌ Error creating expense:", error.message);
    res.status(500).json({ message: "เกิดข้อผิดพลาดที่ Server" });
  }
});

// @route   GET /api/expenses
// @desc    ดึงข้อมูลรายจ่ายทั้งหมด (Get all expenses)
// @access  Private

app.get('/api/expenses', authenticateToken, async (req, res) => {
  try {
    // 1. ดึงข้อมูลรายจ่ายทั้งหมดจากฐานข้อมูล
    // เราอาจจะ Join ตาราง users เพื่อดึง "ชื่อ" ผู้บันทึก (created_by) มาแสดงผลด้วย
    const [expenses] = await db.promise().query(
      `SELECT 
                e.*, 
                u.username AS created_by_username 
            FROM expenses e
            LEFT JOIN users u ON e.created_by = u.id
            ORDER BY e.expense_date DESC, e.created_at DESC` // เรียงจากวันที่ล่าสุดไปเก่าสุด
    );

    // 2. ส่งข้อมูลกลับไป
    res.status(200).json(expenses); // ส่งข้อมูลรายจ่ายทั้งหมดกลับไปเป็น Array
  } catch (error) {
    console.error("❌ Error getting expenses:", error.message);
    res.status(500).json({ message: "เกิดข้อผิดพลาดที่ Server" });
  }
});

// @route   PUT /api/expenses/:id
// @desc    แก้ไขข้อมูลรายจ่าย (Update an expense)
// @access  Private

app.put("/api/expenses/:id", authenticateToken, express.json(), async (req, res) => {
  // ดึงข้อมูลผู้ใช้ที่กำลังแก้ไข (จาก Token)
  const { userId, username } = req.user;

  // ดึง ID รายจ่ายที่จะแก้ไข (จาก URL)
  const expenseId = req.params.id;

  try {
    // 1. ตรวจสอบก่อนว่ามีรายจ่ายนี้อยู่จริงหรือไม่
    const [expenses] = await db
      .promise()
      .query("SELECT * FROM expenses WHERE id = ?", [expenseId]);

    if (expenses.length === 0) {
      return res
        .status(404)
        .json({ message: "ไม่พบรายการรายจ่ายนี้ (Not Found)" });
    }

    // 2. รับข้อมูล "ใหม่" ที่ส่งมาจาก Frontend (req.body)
    const { expense_date, category, details, amount, receipt_image_url } =
      req.body;

    // 3. ตรวจสอบข้อมูลเบื้องต้น
    if (!expense_date || !details || !amount) {
      return res
        .status(400)
        .json({ message: "กรุณากรอก วันที่, รายละเอียด และ จำนวนเงิน" });
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
        expenseId, // ID ของรายจ่ายที่จะอัปเดต
      ]
    );

    // 5. (สำคัญ) บันทึก Log การกระทำ (ตามข้อกำหนด 0.)
    await db
      .promise()
      .query(
        "INSERT INTO action_logs (user_id, action_type, target_table, target_id, details) VALUES (?, ?, ?, ?, ?)",
        [
          userId,
          "UPDATE",
          "expenses",
          expenseId,
          `User ${username} updated expense ID: ${expenseId} (Details: ${details})`,
        ]
      );

    // 6. ส่งคำตอบกลับไป
    console.log(
      `✅ Expense ID ${expenseId} ('${details}') updated by user '${username}'.`
    );
    res.status(200).json({ message: "อัปเดตรายจ่ายสำเร็จ!" });
  } catch (error) {
    console.error("❌ Error updating expense:", error.message);
    res.status(500).json({ message: "เกิดข้อผิดพลาดที่ Server" });
  }
});

// @route   DELETE /api/expenses/:id
// @desc    ลบรายจ่าย (Delete an expense)
// @access  Private

app.delete("/api/expenses/:id", authenticateToken, async (req, res) => {
  // ดึงข้อมูลผู้ใช้ที่กำลังลบ (จาก Token)
  const { userId, username } = req.user;

  // ดึง ID รายจ่ายที่จะลบ (จาก URL)
  const expenseId = req.params.id;

  try {
    // 1. ตรวจสอบก่อนว่ามีรายจ่ายนี้อยู่จริงหรือไม่ (เพื่อเอาข้อมูลมาบันทึก Log)
    const [expenses] = await db.promise().query(
      "SELECT details FROM expenses WHERE id = ?", // ดึงมาแค่ details เพื่อบันทึก Log
      [expenseId]
    );

    if (expenses.length === 0) {
      return res
        .status(404)
        .json({ message: "ไม่พบรายการรายจ่ายนี้ (Not Found)" });
    }

    const expenseDetails = expenses[0].details; // เก็บรายละเอียดไว้ก่อนลบ

    // 2. สั่งลบข้อมูล
    await db.promise().query("DELETE FROM expenses WHERE id = ?", [expenseId]);

    // 3. (สำคัญ) บันทึก Log การกระทำ
    await db
      .promise()
      .query(
        "INSERT INTO action_logs (user_id, action_type, target_table, target_id, details) VALUES (?, ?, ?, ?, ?)",
        [
          userId,
          "DELETE",
          "expenses",
          expenseId,
          `User ${username} DELETED expense ID: ${expenseId} (Details: ${expenseDetails})`,
        ]
      );

    // 4. ส่งคำตอบกลับไป
    console.log(
      `✅ Expense ID ${expenseId} ('${expenseDetails}') DELETED by user '${username}'.`
    );
    res.status(200).json({ message: "ลบรายจ่ายสำเร็จ!" });
  } catch (error) {
    console.error("❌ Error deleting expense:", error.message);
    res.status(500).json({ message: "เกิดข้อผิดพลาดที่ Server" });
  }
});

// -------------------------- Sales Routes (Point of Sale) --------------------------

// @route   POST /api/sales
// @desc    สร้างการขายใหม่ (ยืนยันการขายจาก POS)
// @access  Private

app.post('/api/sales', authenticateToken, express.json(), async (req, res) => {
  // ดึงข้อมูลผู้ใช้ที่กำลังขาย (จาก Token)
  const { userId, username } = req.user;

  // 1. รับ "ตะกร้าสินค้า" (Cart) และยอดรวม
  // เราคาดหวังว่า Frontend จะส่ง "cart" (Array) และ "totalAmount" (ยอดสุทธิที่คำนวณแล้ว) มา
  const { cart, totalAmount } = req.body;

  // 2. ตรวจสอบข้อมูลเบื้องต้น
  if (!cart || cart.length === 0 || totalAmount === undefined) {
    return res.status(400).json({ message: "ข้อมูลตะกร้าสินค้าไม่ถูกต้อง" });
  }

  // (สำคัญ) เราจะใช้ Connection แบบพิเศษสำหรับ Transaction
  let connection;
  try {
    // 3. (สำคัญ) ดึง Connection มาจาก Pool เพื่อเริ่ม Transaction
    connection = await db.promise().getConnection();

    // 4. (สำคัญ) เริ่ม Transaction
    await connection.beginTransaction();
    console.log("Transaction Started.");

    // --- ขั้นตอนที่ 5: ตรวจสอบสต็อก (Pre-check) ---
    // เราต้องเช็คก่อนว่าของพอขายไหม (ป้องกันสต็อกติดลบ)
    for (const item of cart) {
      const [products] = await connection.query(
        "SELECT name, stock_quantity FROM products WHERE id = ? FOR UPDATE", // "FOR UPDATE" ล็อคแถวนี้ไว้ก่อน
        [item.product_id]
      );
      if (products.length === 0) {
        throw new Error(`ไม่พบสินค้า ID: ${item.product_id}`);
      }
      if (products[0].stock_quantity < item.quantity) {
        throw new Error(
          `สต็อกสินค้า "${products[0].name}" ไม่เพียงพอ (มี ${products[0].stock_quantity} ชิ้น)`
        );
      }
    }

    // --- ขั้นตอนที่ 6: บันทึกหัวบิล (sales) ---
    const [saleResult] = await connection.query(
      "INSERT INTO sales (total_amount, created_by, last_updated_by) VALUES (?, ?, ?)",
      [totalAmount, userId, userId]
    );
    const newSaleId = saleResult.insertId;
    console.log(`Sale Header created (ID: ${newSaleId})`);

    // --- ขั้นตอนที่ 7: บันทึกรายละเอียดบิล (sale_details) และตัดสต็อก ---
    let logDetails = []; // สำหรับเก็บ Log

    for (const item of cart) {
      // 7a. ดึงราคาขายจริงจาก DB (เพื่อความปลอดภัย)
      const [products] = await connection.query(
        "SELECT sell_price FROM products WHERE id = ?",
        [item.product_id]
      );
      const priceAtSale = products[0].sell_price;

      // 7b. คำนวณยอดรวมต่อรายการ
      const lineTotal =
        priceAtSale * item.quantity - (item.discount_amount || 0);

      // 7c. บันทึกลง sale_details
      await connection.query(
        "INSERT INTO sale_details (sale_id, product_id, quantity, price_at_sale, discount_amount, line_total) VALUES (?, ?, ?, ?, ?, ?)",
        [
          newSaleId,
          item.product_id,
          item.quantity,
          priceAtSale,
          item.discount_amount || 0,
          lineTotal,
        ]
      );

      // 7d. (สำคัญ) ตัดสต็อกสินค้า
      await connection.query(
        "UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?",
        [item.quantity, item.product_id]
      );

      logDetails.push(`(ID ${item.product_id}: ${item.quantity} ชิ้น)`);
    }
    console.log("Sale Details saved and Stock updated.");

    // --- ขั้นตอนที่ 8: บันทึก Log การกระทำ ---
    await connection.query(
      "INSERT INTO action_logs (user_id, action_type, target_table, target_id, details) VALUES (?, ?, ?, ?, ?)",
      [
        userId,
        "CREATE_SALE",
        "sales",
        newSaleId,
        `User ${username} created Sale ID: ${newSaleId}. Items: ${logDetails.join(
          ", "
        )}`,
      ]
    );
    console.log("Action Logged.");

    // 9. (สำคัญ) ยืนยัน Transaction (ถ้าทุกอย่างสำเร็จ)
    await connection.commit();
    console.log("Transaction Committed.");

    // 10. ส่งคำตอบกลับไป
    res.status(201).json({ message: "บันทึกการขายสำเร็จ!", saleId: newSaleId });
  } catch (error) {
    // 11. (สำคัญ) หากเกิดข้อผิดพลาดใดๆ ให้ Rollback
    if (connection) {
      await connection.rollback();
      console.error("Transaction Rolled Back.");
    }
    console.error("❌ Error during sale transaction:", error.message);
    res.status(500).json({ message: "เกิดข้อผิดพลาด: " + error.message });
  } finally {
    // 12. (สำคัญ) คืน Connection กลับสู่ Pool เสมอ
    if (connection) {
      connection.release();
      console.log("Connection Released.");
    }
  }
});

// @route   GET /api/sales
// @desc    ดึงประวัติการขาย (หัวบิล) ทั้งหมด (Get all sales)
// @access  Private

app.get("/api/sales", authenticateToken, async (req, res) => {
  try {
    // 1. ดึงข้อมูล "หัวบิล" ทั้งหมด
    // เรา Join ตาราง users เพื่อดึง "ชื่อ" ผู้ขาย (created_by) มาแสดงผลด้วย
    const [sales] = await db.promise().query(
      `SELECT 
                s.*, 
                u.username AS created_by_username 
            FROM sales s
            LEFT JOIN users u ON s.created_by = u.id
            ORDER BY s.sale_date DESC` // เรียงจากบิลล่าสุดไปเก่าสุด
    );

    // 2. ส่งข้อมูลกลับไป
    res.status(200).json(sales);
  } catch (error) {
    console.error("❌ Error getting sales history:", error.message);
    res.status(500).json({ message: "เกิดข้อผิดพลาดที่ Server" });
  }
});

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
      return res.status(404).json({ message: "ไม่พบบิลนี้ (Not Found)" });
    }

    // 2. ดึงข้อมูล "รายการสินค้า" (ไส้ในบิล)
    // เรา Join ตาราง products เพื่อดึง "ชื่อ" สินค้ามาแสดงผล
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
      saleDetails: details,
    };

    res.status(200).json(result);
  } catch (error) {
    console.error("❌ Error getting sale details:", error.message);
    res.status(500).json({ message: "เกิดข้อผิดพลาดที่ Server" });
  }
});

// @route   DELETE /api/sales/:id
// @desc    ลบบิล (ยกเลิกบิล) และ "คืนสต็อก" อัตโนมัติ
// @access  Private (อาจจะจำกัดสิทธิ์เฉพาะ Admin ในอนาคต)

app.delete("/api/sales/:id", authenticateToken, async (req, res) => {
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
      "SELECT product_id, quantity FROM sale_details WHERE sale_id = ?",
      [saleId]
    );

    if (details.length === 0) {
      // อาจจะหมายความว่าบิลนี้ไม่มีสินค้า หรือบิลนี้ไม่มีอยู่จริง
      // (แต่ถ้าบิลไม่มีอยู่จริง ขั้นตอนที่ 4 ก็จะ Error อยู่ดี ซึ่งไม่เป็นไร)
      console.warn(`Sale ID ${saleId} has no details or does not exist.`);
    }

    let logDetails = []; // สำหรับเก็บ Log

    // 3. (สำคัญ) วน Loop เพื่อ "คืนสต็อก" ทีละรายการ
    for (const item of details) {
      await connection.query(
        "UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?",
        [item.quantity, item.product_id]
      );
      logDetails.push(
        `(ProductID ${item.product_id}: Restored ${item.quantity} units)`
      );
    }
    console.log(`Stock restored for Sale ID ${saleId}.`);

    // 4. ลบ "หัวบิล" (จากตาราง sales)
    // (สำคัญ) เพราะเราตั้งค่า FOREIGN KEY (sale_id) ใน 'sale_details'
    // เป็น "ON DELETE CASCADE"
    // เมื่อเราลบแถวนี้ใน 'sales', แถวที่เกี่ยวข้องใน 'sale_details' จะถูกลบตามอัตโนมัติ!
    await connection.query("DELETE FROM sales WHERE id = ?", [saleId]);
    console.log(`Sale Header (ID: ${saleId}) and Details deleted.`);

    // 5. บันทึก Log การกระทำ
    await connection.query(
      "INSERT INTO action_logs (user_id, action_type, target_table, target_id, details) VALUES (?, ?, ?, ?, ?)",
      [
        userId,
        "DELETE_SALE",
        "sales",
        saleId,
        `User ${username} DELETED Sale ID: ${saleId}. Stock restored: ${logDetails.join(
          ", "
        )}`,
      ]
    );
    console.log("Action Logged.");

    // 6. (สำคัญ) ยืนยัน Transaction
    await connection.commit();
    console.log("Transaction Committed.");

    res
      .status(200)
      .json({ message: `ยกเลิกบิล (ID: ${saleId}) และ คืนสต็อกสินค้าสำเร็จ!` });
  } catch (error) {
    // 7. (สำคัญ) หากเกิดข้อผิดพลาดใดๆ ให้ Rollback
    if (connection) {
      await connection.rollback();
      console.error("Transaction Rolled Back.");
    }
    console.error("❌ Error during sale deletion (restock):", error.message);
    res.status(500).json({ message: "เกิดข้อผิดพลาด: " + error.message });
  } finally {
    // 8. (สำคัญ) คืน Connection กลับสู่ Pool เสมอ
    if (connection) {
      connection.release();
      console.log("Connection Released.");
    }
  }
});

// @route   PUT /api/sales/:id
// @desc    แก้ไขบิล และ "ปรับปรุงสต็อก" อัตโนมัติ (Update Sale & Adjust Stock)
// @access  Private (Admin Only)

app.put("/api/sales/:id", authenticateToken, express.json(), async (req, res) => {
  // -----------------------------------------------------------------
  // (หมายเหตุ: API นี้ควรจำกัดสิทธิ์ให้เฉพาะ 'Admin' เท่านั้น)
  // if (req.user.role !== 'Admin') {
  //     return res.status(403).json({ message: 'คุณไม่มีสิทธิ์แก้ไขบิล' });
  // }
  // -----------------------------------------------------------------

  const { userId, username } = req.user;
  const saleId = req.params.id;

  // 1. รับ "ตะกร้าใหม่" (New Cart) และยอดรวมใหม่
  const { cart: newCart, totalAmount: newTotalAmount } = req.body;

  if (!newCart || newCart.length === 0 || newTotalAmount === undefined) {
    return res
      .status(400)
      .json({ message: "ข้อมูลตะกร้าสินค้าใหม่ไม่ถูกต้อง" });
  }

  let connection;
  try {
    // 2. (สำคัญ) เริ่ม Transaction
    connection = await db.promise().getConnection();
    await connection.beginTransaction();
    console.log("Update Sale Transaction Started.");

    // --- ขั้นตอนที่ 3: (Rollback) คืนสต็อกตาม "บิลเก่า" ---
    const [oldDetails] = await connection.query(
      "SELECT product_id, quantity FROM sale_details WHERE sale_id = ?",
      [saleId]
    );

    if (oldDetails.length === 0) {
      // บิลนี้อาจไม่มีอยู่จริง (หรือถูกลบไปแล้ว)
      throw new Error(`ไม่พบรายละเอียดบิลเดิม (ID: ${saleId})`);
    }

    for (const item of oldDetails) {
      await connection.query(
        "UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?",
        [item.quantity, item.product_id]
      );
    }
    console.log(`Stock restored (Rollback) for Sale ID ${saleId}.`);

    // --- ขั้นตอนที่ 4: (Pre-check) ตรวจสอบสต็อกสำหรับ "ตะกร้าใหม่" ---
    for (const item of newCart) {
      const [products] = await connection.query(
        "SELECT name, stock_quantity FROM products WHERE id = ? FOR UPDATE",
        [item.product_id]
      );
      if (products.length === 0) {
        throw new Error(`(New Cart) ไม่พบสินค้า ID: ${item.product_id}`);
      }
      if (products[0].stock_quantity < item.quantity) {
        throw new Error(
          `(New Cart) สต็อกสินค้า "${products[0].name}" ไม่เพียงพอ (มี ${products[0].stock_quantity} ชิ้น)`
        );
      }
    }
    console.log(`Stock checked (Pre-check) for New Cart.`);

    // --- ขั้นตอนที่ 5: ลบ "รายละเอียดบิลเก่า" ---
    await connection.query("DELETE FROM sale_details WHERE sale_id = ?", [
      saleId,
    ]);

    // --- ขั้นตอนที่ 6: (Deduct) เพิ่ม "รายละเอียดบิลใหม่" และ "ตัดสต็อก" ---
    let logDetails = [];
    for (const item of newCart) {
      const [products] = await connection.query(
        "SELECT sell_price FROM products WHERE id = ?",
        [item.product_id]
      );
      const priceAtSale = products[0].sell_price;
      const lineTotal =
        priceAtSale * item.quantity - (item.discount_amount || 0);

      // 6a. เพิ่ม "รายละเอียดใหม่"
      await connection.query(
        "INSERT INTO sale_details (sale_id, product_id, quantity, price_at_sale, discount_amount, line_total) VALUES (?, ?, ?, ?, ?, ?)",
        [
          saleId,
          item.product_id,
          item.quantity,
          priceAtSale,
          item.discount_amount || 0,
          lineTotal,
        ]
      );

      // 6b. "ตัดสต็อกใหม่"
      await connection.query(
        "UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?",
        [item.quantity, item.product_id]
      );
      logDetails.push(`(ID ${item.product_id}: ${item.quantity} ชิ้น)`);
    }
    console.log("New Sale Details saved and New Stock updated.");

    // --- ขั้นตอนที่ 7: อัปเดต "หัวบิล" (ยอดรวมใหม่) ---
    await connection.query(
      "UPDATE sales SET total_amount = ?, last_updated_by = ? WHERE id = ?",
      [newTotalAmount, userId, saleId]
    );

    // --- ขั้นตอนที่ 8: บันทึก Log ---
    await connection.query(
      "INSERT INTO action_logs (user_id, action_type, target_table, target_id, details) VALUES (?, ?, ?, ?, ?)",
      [
        userId,
        "UPDATE_SALE",
        "sales",
        saleId,
        `User ${username} UPDATED Sale ID: ${saleId}. New Items: ${logDetails.join(
          ", "
        )}`,
      ]
    );
    console.log("Action Logged.");

    // 9. (สำคัญ) ยืนยัน Transaction
    await connection.commit();
    console.log("Transaction Committed.");

    res
      .status(200)
      .json({ message: `แก้ไขบิล (ID: ${saleId}) และ ปรับปรุงสต็อกสำเร็จ!` });
  } catch (error) {
    // 10. (สำคัญ) หากเกิดข้อผิดพลาดใดๆ ให้ Rollback
    // (*** หมายเหตุ: การ Rollback ที่นี่จะ "ย้อนกลับ" ทั้งหมด
    // สต็อกสินค้าจะกลับไป "เท่าเดิม" เหมือนก่อนกดแก้ไข (เท่ากับหลังบิลเก่าขายไป))
    if (connection) {
      await connection.rollback();
      console.error("Transaction Rolled Back.");
    }
    console.error("❌ Error during sale update (adjust stock):", error.message);
    res.status(500).json({ message: "เกิดข้อผิดพลาด: " + error.message });
  } finally {
    // 11. (สำคัญ) คืน Connection
    if (connection) {
      connection.release();
      console.log("Connection Released.");
    }
  }
});

// ======================== User Management Routes ========================

// @route   GET /api/users
// @desc    ดึงข้อมูลผู้ใช้ทั้งหมด (Get all users)
// @access  Private (Admin Only - แนะนำ)

app.get("/api/users", authenticateToken, async (req, res) => {
  try {
    // 1. ดึงข้อมูลผู้ใช้ทั้งหมด (ยกเว้น password)
    const [users] = await db.promise().query(
      "SELECT id, username, role, created_at FROM users ORDER BY created_at DESC"
    );

    // 2. ส่งข้อมูลกลับไป
    res.status(200).json(users);
  } catch (error) {
    console.error("❌ Error getting users:", error.message);
    res.status(500).json({ message: "เกิดข้อผิดพลาดที่ Server" });
  }
});

// @route   GET /api/users/:id
// @desc    ดึงข้อมูลผู้ใช้ 1 คน (Get single user)
// @access  Private

app.get("/api/users/:id", authenticateToken, async (req, res) => {
  try {
    // 1. ดึง ID จาก URL
    const userId = req.params.id;

    // 2. ค้นหาผู้ใช้ (ยกเว้น password)
    const [users] = await db.promise().query(
      "SELECT id, username, role, created_at FROM users WHERE id = ?",
      [userId]
    );

    // 3. ตรวจสอบว่าหาเจอหรือไม่
    if (users.length === 0) {
      return res.status(404).json({ message: "ไม่พบผู้ใช้นี้ (Not Found)" });
    }

    // 4. ส่งข้อมูลกลับไป
    res.status(200).json(users[0]);
  } catch (error) {
    console.error("❌ Error getting user:", error.message);
    res.status(500).json({ message: "เกิดข้อผิดพลาดที่ Server" });
  }
});

// @route   PUT /api/users/:id
// @desc    แก้ไขข้อมูลผู้ใช้ (Update a user)
// @access  Private (Admin Only - แนะนำ, หรือผู้ใช้แก้ไขตัวเอง)

app.put("/api/users/:id", authenticateToken, express.json(), async (req, res) => {
  // ดึงข้อมูลผู้ใช้ที่กำลังแก้ไข (จาก Token)
  const { userId: loggedInUserId, username: loggedInUsername } = req.user;

  // ดึง ID ผู้ใช้ที่จะแก้ไข (จาก URL)
  const targetUserId = req.params.id;

  // รับข้อมูลใหม่จาก Frontend
  const { username, role, password } = req.body;

  try {
    // 1. ตรวจสอบว่าผู้ใช้นี้มีอยู่จริงหรือไม่
    const [users] = await db.promise().query(
      "SELECT username FROM users WHERE id = ?",
      [targetUserId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "ไม่พบผู้ใช้นี้ (Not Found)" });
    }

    const oldUsername = users[0].username;

    // 2. ตรวจสอบข้อมูลเบื้องต้น (ต้องมี username อย่างน้อย)
    if (!username) {
      return res.status(400).json({ message: "กรุณากรอก Username" });
    }

    // 3. ถ้ามีการเปลี่ยนรหัสผ่าน ให้เข้ารหัส
    let hashedPassword = null;
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร" });
      }
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // 4. อัปเดตข้อมูล
    if (hashedPassword) {
      // ถ้ามีการเปลี่ยนรหัสผ่าน
      await db.promise().query(
        "UPDATE users SET username = ?, password = ?, role = ? WHERE id = ?",
        [username, hashedPassword, role || "Staff", targetUserId]
      );
    } else {
      // ถ้าไม่มีการเปลี่ยนรหัสผ่าน
      await db.promise().query(
        "UPDATE users SET username = ?, role = ? WHERE id = ?",
        [username, role || "Staff", targetUserId]
      );
    }

    // 5. บันทึก Log การกระทำ
    await db.promise().query(
      "INSERT INTO action_logs (user_id, action_type, target_table, target_id, details) VALUES (?, ?, ?, ?, ?)",
      [
        loggedInUserId,
        "UPDATE",
        "users",
        targetUserId,
        `User ${loggedInUsername} updated user ID: ${targetUserId} (Old: ${oldUsername}, New: ${username})`,
      ]
    );

    // 6. ส่งคำตอบกลับไป
    console.log(`✅ User ID ${targetUserId} updated by user '${loggedInUsername}'.`);
    res.status(200).json({ message: "อัปเดตข้อมูลผู้ใช้สำเร็จ!" });
  } catch (error) {
    // ตรวจสอบ Error Code ของ MySQL
    if (error.code === "ER_DUP_ENTRY") {
      console.error("Error: Username already exists.");
      return res.status(409).json({ message: "Username นี้มีผู้ใช้งานแล้ว" });
    }

    console.error("❌ Error updating user:", error.message);
    res.status(500).json({ message: "เกิดข้อผิดพลาดที่ Server" });
  }
});

// @route   DELETE /api/users/:id
// @desc    ลบผู้ใช้ (Delete a user)
// @access  Private (Admin Only - แนะนำ)

app.delete("/api/users/:id", authenticateToken, async (req, res) => {
  // ดึงข้อมูลผู้ใช้ที่กำลังลบ (จาก Token)
  const { userId: loggedInUserId, username: loggedInUsername } = req.user;

  // ดึง ID ผู้ใช้ที่จะลบ (จาก URL)
  const targetUserId = req.params.id;

  try {
    // 1. ป้องกันไม่ให้ลบตัวเอง
    if (parseInt(targetUserId) === loggedInUserId) {
      return res.status(400).json({ message: "ไม่สามารถลบตัวเองได้" });
    }

    // 2. ตรวจสอบว่าผู้ใช้นี้มีอยู่จริงหรือไม่
    const [users] = await db.promise().query(
      "SELECT username FROM users WHERE id = ?",
      [targetUserId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "ไม่พบผู้ใช้นี้ (Not Found)" });
    }

    const deletedUsername = users[0].username;

    // 3. สั่งลบข้อมูล
    await db.promise().query("DELETE FROM users WHERE id = ?", [targetUserId]);

    // 4. บันทึก Log การกระทำ
    await db.promise().query(
      "INSERT INTO action_logs (user_id, action_type, target_table, target_id, details) VALUES (?, ?, ?, ?, ?)",
      [
        loggedInUserId,
        "DELETE",
        "users",
        targetUserId,
        `User ${loggedInUsername} DELETED user ID: ${targetUserId} (Username: ${deletedUsername})`,
      ]
    );

    // 5. ส่งคำตอบกลับไป
    console.log(`✅ User ID ${targetUserId} ('${deletedUsername}') DELETED by user '${loggedInUsername}'.`);
    res.status(200).json({ message: "ลบผู้ใช้สำเร็จ!" });
  } catch (error) {
    console.error("❌ Error deleting user:", error.message);
    res.status(500).json({ message: "เกิดข้อผิดพลาดที่ Server" });
  }
});

// ======================== End of User Management Routes ========================

// --------------------------------------- 9. Dashboard Routes (Reporting) ---------------------------------------------------------

// @route   GET /api/dashboard/summary
// @desc    ดึงข้อมูลสรุปสำหรับ Dashboard
// @access  Private

app.get("/api/dashboard/summary", authenticateToken, async (req, res) => {
  // (เราสามารถจำกัดสิทธิ์ Admin ได้ที่นี่ ถ้าต้องการ)
  // if (req.user.role !== 'Admin') {
  //     return res.status(403).json({ message: 'คุณไม่มีสิทธิ์ดูรายงานสรุป' });
  // }

  try {
    // Get date range from query parameters
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;

    // Build date condition
    let dateCondition = "DATE(sale_date) = CURDATE()"; // Default: today
    let dateConditionExpense = "DATE(expense_date) = CURDATE()";

    if (startDate && endDate) {
      // Custom date range
      dateCondition = `DATE(sale_date) BETWEEN '${startDate}' AND '${endDate}'`;
      dateConditionExpense = `DATE(expense_date) BETWEEN '${startDate}' AND '${endDate}'`;
    }

    // 1. ยอดขายรวม
    const [salesToday] = await db
      .promise()
      .query(
        `SELECT SUM(total_amount) AS totalSales FROM sales WHERE ${dateCondition}`
      );

    // 2. ยอดรายจ่ายรวม
    const [expensesToday] = await db
      .promise()
      .query(
        `SELECT SUM(amount) AS totalExpenses FROM expenses WHERE ${dateConditionExpense}`
      );

    // 3. จำนวนบิล
    const [ordersToday] = await db
      .promise()
      .query(
        `SELECT COUNT(id) AS totalOrders FROM sales WHERE ${dateCondition}`
      );

    // 4. สินค้าที่ใกล้หมด (สต็อก < 10) พร้อม category
    const [lowStockProducts] = await db
      .promise()
      .query(
        "SELECT id, name, category, stock_quantity FROM products WHERE stock_quantity < 10 ORDER BY stock_quantity ASC"
      );

    // 5. นับจำนวนสินค้าทั้งหมด
    const [totalProductsData] = await db
      .promise()
      .query(
        "SELECT COUNT(id) AS totalProducts FROM products"
      );

    // 6. นับจำนวนบิลทั้งหมด (ไม่ใช่เฉพาะช่วงวันที่)
    const [totalBillsData] = await db
      .promise()
      .query(
        "SELECT COUNT(id) AS totalBills FROM sales"
      );

    // 7. นับจำนวนสินค้าที่ใกล้หมด
    const [lowStockCountData] = await db
      .promise()
      .query(
        "SELECT COUNT(id) AS lowStockCount FROM products WHERE stock_quantity < 10"
      );

    // 8. ประกอบข้อมูลส่งกลับ
    const totalSales = salesToday[0].totalSales || 0;
    const totalExpenses = expensesToday[0].totalExpenses || 0;
    const profit = totalSales - totalExpenses;

    const summary = {
      dateRange: {
        startDate: startDate || new Date().toISOString().split('T')[0],
        endDate: endDate || new Date().toISOString().split('T')[0]
      },
      totalSales: totalSales,
      totalExpenses: totalExpenses,
      profit: profit,
      totalOrders: ordersToday[0].totalOrders || 0,
      totalBills: ordersToday[0].totalOrders || 0,
      totalProducts: totalProductsData[0].totalProducts || 0,
      lowStockCount: lowStockCountData[0].lowStockCount || 0,
      lowStockProducts: lowStockProducts,
    };

    res.status(200).json(summary);
  } catch (error) {
    console.error("❌ Error getting dashboard summary:", error);
    console.error("Error Stack:", error.stack);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดที่ Server",
      error: error.message
    });
  }
});

// @route   GET /api/dashboard/charts
// @desc    ดึงข้อมูลสำหรับแสดงกราฟทั้งหมด (Top 5, Latest 10, Stock by Product)
// @access  Private

app.get("/api/dashboard/charts", authenticateToken, async (req, res) => {
  try {
    // Get date range from query parameters
    const startDate = req.query.startDate;
    const endDate = req.query.endDate;


    // 1. Top 5 สินค้าขายดี (จำนวนชิ้นที่ขายไป)
    const [top5Products] = await db
      .promise()
      .query(
        `SELECT
          p.name,
          SUM(sd.quantity) AS totalQuantity,
          SUM(sd.line_total) AS totalRevenue
        FROM sales s
        JOIN sale_details sd ON s.id = sd.sale_id
        JOIN products p ON sd.product_id = p.id
        WHERE DATE(s.sale_date) ${startDate && endDate ? `BETWEEN '${startDate}' AND '${endDate}'` : '= CURDATE()'}
        GROUP BY sd.product_id, p.name
        ORDER BY totalQuantity DESC
        LIMIT 5`
      );

    // 2. รายการขายล่าสุด 10 ลำดับ (พร้อมรายละเอียดสินค้า)
    const [latest10Sales] = await db
      .promise()
      .query(
        `SELECT
          s.id,
          s.sale_date,
          s.total_amount,
          COUNT(sd.id) AS items_count,
          u.username AS seller_name,
          GROUP_CONCAT(p.name SEPARATOR ', ') AS product_names,
          SUM(sd.discount_amount) AS total_discount,
          SUM(sd.line_total) AS net_total
        FROM sales s
        LEFT JOIN sale_details sd ON s.id = sd.sale_id
        LEFT JOIN products p ON sd.product_id = p.id
        LEFT JOIN users u ON s.created_by = u.id
        WHERE DATE(s.sale_date) ${startDate && endDate ? `BETWEEN '${startDate}' AND '${endDate}'` : '= CURDATE()'}
        GROUP BY s.id
        ORDER BY s.sale_date DESC
        LIMIT 10`
      );

    // 3. จำนวนสินค้าตามรายการสินค้า (Stock by Product)
    const [productStock] = await db
      .promise()
      .query(
        `SELECT
          name,
          stock_quantity,
          category
        FROM products
        ORDER BY stock_quantity DESC
        LIMIT 10`
      );

    // 4. ยอดขายรวม, ค่าใช้จ่าย, กำไร/ขาดทุน
    const [salesSummary] = await db
      .promise()
      .query(
        `SELECT SUM(total_amount) AS totalSales FROM sales WHERE DATE(sale_date) ${startDate && endDate ? `BETWEEN '${startDate}' AND '${endDate}'` : '= CURDATE()'}`
      );

    const [expensesSummary] = await db
      .promise()
      .query(
        `SELECT SUM(amount) AS totalExpenses FROM expenses WHERE DATE(expense_date) ${startDate && endDate ? `BETWEEN '${startDate}' AND '${endDate}'` : '= CURDATE()'}`
      );

    const totalSales = salesSummary[0]?.totalSales || 0;
    const totalExpenses = expensesSummary[0]?.totalExpenses || 0;
    const profit = totalSales - totalExpenses;

    // 5. จำนวนออเดอร์ทั้งหมด
    const [orderCount] = await db
      .promise()
      .query(
        `SELECT COUNT(id) AS totalOrders FROM sales WHERE DATE(sale_date) ${startDate && endDate ? `BETWEEN '${startDate}' AND '${endDate}'` : '= CURDATE()'}`
      );

    // 6. จำนวนสินค้าในระบบทั้งหมด
    const [productCount] = await db
      .promise()
      .query(
        `SELECT COUNT(id) AS totalProducts FROM products`
      );

    // ประกอบข้อมูลส่งกลับ
    const chartData = {
      dateRange: {
        startDate: startDate || new Date().toISOString().split('T')[0],
        endDate: endDate || new Date().toISOString().split('T')[0]
      },
      summary: {
        totalSales: totalSales,
        totalExpenses: totalExpenses,
        profit: profit,
        totalOrders: orderCount[0]?.totalOrders || 0,
        totalProducts: productCount[0]?.totalProducts || 0
      },
      top5Products: top5Products,
      latest10Sales: latest10Sales,
      productStock: productStock
    };

    res.status(200).json(chartData);
  } catch (error) {
    console.error("❌ Error getting dashboard charts:", error);
    console.error("Error Stack:", error.stack);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดที่ Server",
      error: error.message
    });
  }
});

// Start the Server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

