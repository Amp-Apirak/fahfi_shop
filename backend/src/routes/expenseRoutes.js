const express = require("express");
const router = express.Router();
const expenseController = require("../controllers/expenseController");
const authenticateToken = require("../middleware/authMiddleware");

router.use(authenticateToken);

router.post("/", expenseController.createExpense);
router.get("/", expenseController.getAllExpenses);
router.put("/:id", expenseController.updateExpense);
router.delete("/:id", expenseController.deleteExpense);

module.exports = router;


