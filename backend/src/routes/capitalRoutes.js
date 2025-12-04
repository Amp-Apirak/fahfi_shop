const express = require("express");
const router = express.Router();
const capitalController = require("../controllers/capitalController");
const authenticateToken = require("../middleware/authMiddleware");

router.use(authenticateToken);

router.get("/", capitalController.getAllCapitalLogs);
router.post("/", capitalController.addCapitalLog);
router.delete("/:id", capitalController.deleteCapitalLog);

module.exports = router;


