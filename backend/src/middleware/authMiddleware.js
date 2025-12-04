const jwt = require("jsonwebtoken");
require("dotenv").config();

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

module.exports = authenticateToken;


