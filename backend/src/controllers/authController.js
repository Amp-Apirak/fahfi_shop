const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const { logAction } = require("../utils/logger");
require("dotenv").config();

exports.register = async (req, res) => {
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
    await logAction(newUserId, "REGISTER", `User ${username} registered.`, "users", newUserId);

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
};

exports.login = async (req, res) => {
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
    await logAction(user.id, "LOGIN", `User ${user.username} logged in.`);

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
};


