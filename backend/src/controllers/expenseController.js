const db = require("../config/db");
const { logAction } = require("../utils/logger");

exports.createExpense = async (req, res) => {
  const { userId, username } = req.user;

  try {
    const { expense_date, category, details, amount, receipt_image_url } = req.body;

    if (!expense_date || !details || !amount) {
      return res
        .status(400)
        .json({ message: "กรุณากรอก วันที่, รายละเอียด และ จำนวนเงิน" });
    }

    const [results] = await db
      .promise()
      .query(
        "INSERT INTO expenses (expense_date, category, details, amount, receipt_image_url, created_by, last_updated_by) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          expense_date,
          category,
          details,
          amount,
          receipt_image_url,
          userId,
          userId,
        ]
      );

    const newExpenseId = results.insertId;

    await logAction(userId, "CREATE", `User ${username} created expense: ${details} (Amount: ${amount})`, "expenses", newExpenseId);

    res
      .status(201)
      .json({ message: "บันทึกรายจ่ายสำเร็จ!", expenseId: newExpenseId });
  } catch (error) {
    console.error("❌ Error creating expense:", error.message);
    res.status(500).json({ message: "เกิดข้อผิดพลาดที่ Server" });
  }
};

exports.getAllExpenses = async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;
    
    let sql = `SELECT 
                e.*, 
                u.username AS created_by_username 
            FROM expenses e
            LEFT JOIN users u ON e.created_by = u.id
            WHERE 1=1`;
    
    const params = [];

    if (startDate) {
        sql += ` AND e.expense_date >= ?`;
        params.push(startDate);
    }
    if (endDate) {
        sql += ` AND e.expense_date <= ?`;
        params.push(endDate);
    }
    if (category && category !== '') {
        sql += ` AND e.category = ?`;
        params.push(category);
    }

    sql += ` ORDER BY e.expense_date DESC, e.created_at DESC`;

    const [expenses] = await db.promise().query(sql, params);

    res.status(200).json(expenses);
  } catch (error) {
    console.error("❌ Error getting expenses:", error.message);
    res.status(500).json({ message: "เกิดข้อผิดพลาดที่ Server" });
  }
};

exports.updateExpense = async (req, res) => {
  const { userId, username } = req.user;
  const expenseId = req.params.id;

  try {
    const [expenses] = await db
      .promise()
      .query("SELECT * FROM expenses WHERE id = ?", [expenseId]);

    if (expenses.length === 0) {
      return res
        .status(404)
        .json({ message: "ไม่พบรายการรายจ่ายนี้ (Not Found)" });
    }

    const { expense_date, category, details, amount, receipt_image_url } = req.body;

    if (!expense_date || !details || !amount) {
      return res
        .status(400)
        .json({ message: "กรุณากรอก วันที่, รายละเอียด และ จำนวนเงิน" });
    }

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
        userId,
        expenseId,
      ]
    );

    await logAction(userId, "UPDATE", `User ${username} updated expense ID: ${expenseId} (Details: ${details})`, "expenses", expenseId);

    res.status(200).json({ message: "อัปเดตรายจ่ายสำเร็จ!" });
  } catch (error) {
    console.error("❌ Error updating expense:", error.message);
    res.status(500).json({ message: "เกิดข้อผิดพลาดที่ Server" });
  }
};

exports.deleteExpense = async (req, res) => {
  const { userId, username } = req.user;
  const expenseId = req.params.id;

  try {
    const [expenses] = await db.promise().query(
      "SELECT details FROM expenses WHERE id = ?",
      [expenseId]
    );

    if (expenses.length === 0) {
      return res
        .status(404)
        .json({ message: "ไม่พบรายการรายจ่ายนี้ (Not Found)" });
    }

    const expenseDetails = expenses[0].details;

    await db.promise().query("DELETE FROM expenses WHERE id = ?", [expenseId]);

    await logAction(userId, "DELETE", `User ${username} DELETED expense ID: ${expenseId} (Details: ${expenseDetails})`, "expenses", expenseId);

    res.status(200).json({ message: "ลบรายจ่ายสำเร็จ!" });
  } catch (error) {
    console.error("❌ Error deleting expense:", error.message);
    res.status(500).json({ message: "เกิดข้อผิดพลาดที่ Server" });
  }
};


