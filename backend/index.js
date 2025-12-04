const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

// Import Routes
const authRoutes = require("./src/routes/authRoutes");
const productRoutes = require("./src/routes/productRoutes");
const expenseRoutes = require("./src/routes/expenseRoutes");
const salesRoutes = require("./src/routes/salesRoutes");
const userRoutes = require("./src/routes/userRoutes");
const capitalRoutes = require("./src/routes/capitalRoutes");
const dashboardRoutes = require("./src/routes/dashboardRoutes");
const uploadRoutes = require("./src/routes/uploadRoutes");

// Initial Setup
const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Files (Uploads)
app.use("/api/uploads", express.static(path.join(__dirname, "public/uploads")));

// API Routes
app.use("/api", authRoutes); // Login, Register
app.use("/api/products", productRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/sales", salesRoutes);
app.use("/api/users", userRoutes);
app.use("/api/capital", capitalRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/upload", uploadRoutes);

// Base Route
app.get("/", (req, res) => {
  res.json({ message: "ยินดีต้อนรับสู่ Backend API ของ Fahfi Shop (Refactored Version)!" });
});

// Start Server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


