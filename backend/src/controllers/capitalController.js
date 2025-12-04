const db = require("../config/db");
const { logAction } = require("../utils/logger");

exports.getAllCapitalLogs = async (req, res) => {
  try {
    const [rows] = await db
      .promise()
      .query("SELECT * FROM capital_logs ORDER BY transaction_date DESC");
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching capital logs" });
  }
};

exports.addCapitalLog = async (req, res) => {
  const { amount, type, description, transaction_date } = req.body;
  
  if (!amount || !type || !transaction_date) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const [result] = await db.promise().query(
      "INSERT INTO capital_logs (amount, type, description, transaction_date) VALUES (?, ?, ?, ?)",
      [amount, type, description, transaction_date]
    );

    await logAction(req.user.userId, "ADD_CAPITAL", `Added capital log: ${type} ${amount}`);

    res.status(201).json({ message: "Capital log added successfully", id: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error adding capital log" });
  }
};

exports.deleteCapitalLog = async (req, res) => {
  const { id } = req.params;
  try {
    await db.promise().query("DELETE FROM capital_logs WHERE id = ?", [id]);
    
    await logAction(req.user.userId, "DELETE_CAPITAL", `Deleted capital log ID: ${id}`);

    res.json({ message: "Capital log deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting capital log" });
  }
};


