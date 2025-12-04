const db = require("../config/db");

// Helper: Log Action
const logAction = async (
  userId,
  actionType,
  details,
  targetTable = null,
  targetId = null
) => {
  try {
    await db
      .promise()
      .query(
        "INSERT INTO action_logs (user_id, action_type, target_table, target_id, details) VALUES (?, ?, ?, ?, ?)",
        [userId, actionType, targetTable, targetId, details]
      );
    console.log(`[LOG] Action: ${actionType} - ${details}`);
  } catch (error) {
    console.error("❌ Error logging action:", error.message);
  }
};

module.exports = { logAction };


