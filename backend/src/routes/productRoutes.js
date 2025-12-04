const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const authenticateToken = require("../middleware/authMiddleware");

// All routes require authentication
router.use(authenticateToken);

router.post("/", productController.createProduct);
router.get("/", productController.getAllProducts);
router.get("/:id", productController.getProductById);
router.put("/:id", productController.updateProduct);
router.delete("/:id", productController.deleteProduct);

// Stock Management
router.post("/:id/stock-in", productController.stockIn);
router.get("/:id/history", productController.getStockHistory);
router.post("/:id/adjust", productController.adjustStock);

module.exports = router;


