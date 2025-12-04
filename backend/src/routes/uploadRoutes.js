const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadMiddleware");
const authenticateToken = require("../middleware/authMiddleware");

router.post("/", authenticateToken, upload.single("image"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "ไม่ได้แนบไฟล์" });
    }

    const fileUrl = `/api/uploads/${req.file.filename}`;

    res.status(200).json({
      message: "อัปโหลดไฟล์สำเร็จ",
      imageUrl: fileUrl,
    });
  } catch (error) {
    res.status(500).json({ message: "เกิดข้อผิดพลาด: " + error.message });
  }
});

module.exports = router;


