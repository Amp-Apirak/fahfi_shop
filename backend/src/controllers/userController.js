const db = require("../config/db");
const bcrypt = require("bcryptjs");
const { logAction } = require("../utils/logger");

exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.promise().query(
      "SELECT id, username, role, created_at FROM users ORDER BY created_at DESC"
    );
    res.status(200).json(users);
  } catch (error) {
    console.error("❌ Error getting users:", error.message);
    res.status(500).json({ message: "เกิดข้อผิดพลาดที่ Server" });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const [users] = await db.promise().query(
      "SELECT id, username, role, created_at FROM users WHERE id = ?",
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "ไม่พบผู้ใช้นี้ (Not Found)" });
    }

    res.status(200).json(users[0]);
  } catch (error) {
    console.error("❌ Error getting user:", error.message);
    res.status(500).json({ message: "เกิดข้อผิดพลาดที่ Server" });
  }
};

exports.updateUser = async (req, res) => {
  const { userId: loggedInUserId, username: loggedInUsername } = req.user;
  const targetUserId = req.params.id;
  const { username, role, password } = req.body;

  try {
    const [users] = await db.promise().query(
      "SELECT username FROM users WHERE id = ?",
      [targetUserId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "ไม่พบผู้ใช้นี้ (Not Found)" });
    }

    const oldUsername = users[0].username;

    if (!username) {
      return res.status(400).json({ message: "กรุณากรอก Username" });
    }

    let hashedPassword = null;
    if (password) {
      if (password.length < 6) {
        return res.status(400).json({ message: "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร" });
      }
      hashedPassword = await bcrypt.hash(password, 10);
    }

    if (hashedPassword) {
      await db.promise().query(
        "UPDATE users SET username = ?, password = ?, role = ? WHERE id = ?",
        [username, hashedPassword, role || "Staff", targetUserId]
      );
    } else {
      await db.promise().query(
        "UPDATE users SET username = ?, role = ? WHERE id = ?",
        [username, role || "Staff", targetUserId]
      );
    }

    await logAction(loggedInUserId, "UPDATE", `User ${loggedInUsername} updated user ID: ${targetUserId} (Old: ${oldUsername}, New: ${username})`, "users", targetUserId);

    console.log(`✅ User ID ${targetUserId} updated by user '${loggedInUsername}'.`);
    res.status(200).json({ message: "อัปเดตข้อมูลผู้ใช้สำเร็จ!" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      console.error("Error: Username already exists.");
      return res.status(409).json({ message: "Username นี้มีผู้ใช้งานแล้ว" });
    }

    console.error("❌ Error updating user:", error.message);
    res.status(500).json({ message: "เกิดข้อผิดพลาดที่ Server" });
  }
};

exports.deleteUser = async (req, res) => {
  const { userId: loggedInUserId, username: loggedInUsername } = req.user;
  const targetUserId = req.params.id;

  try {
    if (parseInt(targetUserId) === loggedInUserId) {
      return res.status(400).json({ message: "ไม่สามารถลบตัวเองได้" });
    }

    const [users] = await db.promise().query(
      "SELECT username FROM users WHERE id = ?",
      [targetUserId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "ไม่พบผู้ใช้นี้ (Not Found)" });
    }

    const deletedUsername = users[0].username;

    await db.promise().query("DELETE FROM users WHERE id = ?", [targetUserId]);

    await logAction(loggedInUserId, "DELETE", `User ${loggedInUsername} DELETED user ID: ${targetUserId} (Username: ${deletedUsername})`, "users", targetUserId);

    console.log(`✅ User ID ${targetUserId} ('${deletedUsername}') DELETED by user '${loggedInUsername}'.`);
    res.status(200).json({ message: "ลบผู้ใช้สำเร็จ!" });
  } catch (error) {
    console.error("❌ Error deleting user:", error.message);
    res.status(500).json({ message: "เกิดข้อผิดพลาดที่ Server" });
  }
};


