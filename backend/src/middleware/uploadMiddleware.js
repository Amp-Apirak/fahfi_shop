const multer = require("multer");
const path = require("path");

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

module.exports = upload;


