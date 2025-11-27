-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 27, 2025 at 04:26 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `fahfi_shop_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `action_logs`
--

CREATE TABLE `action_logs` (
  `id` bigint(20) NOT NULL,
  `user_id` int(11) NOT NULL,
  `action_type` varchar(50) NOT NULL COMMENT 'เช่น CREATE, UPDATE, DELETE, LOGIN',
  `target_table` varchar(100) DEFAULT NULL COMMENT 'เช่น products, sales',
  `target_id` int(11) DEFAULT NULL COMMENT 'ID ของแถวที่ถูกกระทำ',
  `details` text DEFAULT NULL COMMENT 'รายละเอียด เช่น ข้อมูลเก่า/ใหม่ (JSON)',
  `timestamp` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `action_logs`
--

INSERT INTO `action_logs` (`id`, `user_id`, `action_type`, `target_table`, `target_id`, `details`, `timestamp`) VALUES
(1, 3, 'REGISTER', 'users', 3, 'User Ampapirak registered.', '2025-11-27 11:47:24'),
(2, 3, 'LOGIN', NULL, NULL, 'User Ampapirak logged in.', '2025-11-27 11:50:01'),
(3, 3, 'LOGIN', NULL, NULL, 'User Ampapirak logged in.', '2025-11-27 14:28:35'),
(4, 3, 'CREATE', 'products', 1, 'User Ampapirak created product: เสื้อสเวตเตอร์คอกลม', '2025-11-27 14:30:18'),
(5, 3, 'UPDATE', 'products', 1, 'User Ampapirak updated product ID: 1 (Name: เสื้อสเวตเตอร์คอกลม)', '2025-11-27 14:31:12'),
(6, 3, 'CREATE', 'products', 2, 'User Ampapirak created product: เสื้อสเวตเตอร์คอกลม', '2025-11-27 14:58:24'),
(7, 3, 'UPDATE', 'products', 2, 'User Ampapirak updated product ID: 2 (Name: เสื้อสเวตเตอร์คอกลม)', '2025-11-27 14:59:03'),
(8, 3, 'UPDATE', 'products', 2, 'User Ampapirak updated product ID: 2 (Name: เสื้อสเวตเตอร์คอกลม)', '2025-11-27 15:07:58'),
(9, 3, 'CREATE', 'products', 3, 'User Ampapirak created product: เสื้อยืดคอกลม', '2025-11-27 15:09:33'),
(10, 3, 'LOGIN', NULL, NULL, 'User Ampapirak logged in.', '2025-11-27 15:12:18'),
(11, 4, 'REGISTER', 'users', 4, 'User fahsai registered.', '2025-11-27 15:13:55'),
(12, 4, 'LOGIN', NULL, NULL, 'User fahsai logged in.', '2025-11-27 15:14:39'),
(13, 4, 'CREATE_SALE', 'sales', 1, 'User fahsai created Sale ID: 1. Items: เสื้อสเวตเตอร์คอกลม (x1). Total: 139 (Discount: 0)', '2025-11-27 15:14:56'),
(14, 4, 'DELETE_SALE', 'sales', 1, 'User fahsai DELETED Sale ID: 1. Stock restored: (ProductID 1: Restored 1 units)', '2025-11-27 15:15:09');

-- --------------------------------------------------------

--
-- Table structure for table `expenses`
--

CREATE TABLE `expenses` (
  `id` int(11) NOT NULL,
  `expense_date` date NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `details` text NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `receipt_image_url` varchar(500) DEFAULT NULL,
  `created_by` int(11) NOT NULL COMMENT 'User ID ที่บันทึก',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_updated_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `category` varchar(100) DEFAULT NULL,
  `grade` varchar(50) DEFAULT NULL,
  `details` text DEFAULT NULL,
  `cost_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `sell_price` decimal(10,2) NOT NULL DEFAULT 0.00,
  `stock_quantity` int(11) NOT NULL DEFAULT 0,
  `product_image_url` varchar(500) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `last_updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_updated_by` int(11) DEFAULT NULL COMMENT 'เก็บ User ID ที่แก้ไขล่าสุด'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `category`, `grade`, `details`, `cost_price`, `sell_price`, `stock_quantity`, `product_image_url`, `created_at`, `last_updated_at`, `last_updated_by`) VALUES
(1, 'เสื้อสเวตเตอร์คอกลม', 'เสื้อ', 'A', 'เสื้อสเวตเตอร์คอกลม เกรด A', 35.00, 139.00, 100, 'http://localhost:3001/uploads/1764253869503.jpg', '2025-11-27 14:30:18', '2025-11-27 15:15:09', 3),
(2, 'เสื้อสเวตเตอร์คอกลม', 'เสื้อ', 'B', 'เสื้อสเวตเตอร์คอกลม เกรด B', 35.00, 100.00, 100, '/api/uploads/1764256075017.jpg', '2025-11-27 14:58:23', '2025-11-27 15:07:58', 3),
(3, 'เสื้อยืดคอกลม', 'เสื้อ', 'AB', 'เสื้อยืดคอกลม AB', 35.00, 60.00, 100, '/api/uploads/1764256170928.jpg', '2025-11-27 15:09:33', '2025-11-27 15:09:33', 3);

-- --------------------------------------------------------

--
-- Table structure for table `product_categories`
--

CREATE TABLE `product_categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sales`
--

CREATE TABLE `sales` (
  `id` int(11) NOT NULL,
  `sale_date` timestamp NOT NULL DEFAULT current_timestamp(),
  `total_amount` decimal(10,2) NOT NULL COMMENT 'ยอดรวมสุทธิหลังหักส่วนลด',
  `discount` decimal(10,2) NOT NULL DEFAULT 0.00,
  `created_by` int(11) NOT NULL COMMENT 'User ID ที่ขาย',
  `last_updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `last_updated_by` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sale_details`
--

CREATE TABLE `sale_details` (
  `id` int(11) NOT NULL,
  `sale_id` int(11) NOT NULL COMMENT 'เชื่อมโยงกับตาราง sales',
  `product_id` int(11) NOT NULL COMMENT 'เชื่อมโยงกับตาราง products',
  `quantity` int(11) NOT NULL,
  `price_at_sale` decimal(10,2) NOT NULL COMMENT 'ราคาขาย ณ ตอนนั้น',
  `discount_amount` decimal(10,2) NOT NULL DEFAULT 0.00 COMMENT 'ส่วนลด (บาท) เฉพาะรายการนี้',
  `line_total` decimal(10,2) NOT NULL COMMENT '(Price * Qty) - Discount'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL COMMENT 'ต้องเก็บแบบ Hashed',
  `role` enum('Admin','Staff') NOT NULL DEFAULT 'Staff',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `role`, `created_at`) VALUES
(1, 'admin', '$2b$10$EXAMPLE_HASH_PASSWORD', 'Admin', '2025-11-13 14:25:39'),
(2, 'staff', '$2b$10$EXAMPLE_HASH_PASSWORD', 'Staff', '2025-11-13 14:25:39'),
(3, 'Ampapirak', '$2b$10$PYQ4b/MkxJDDdJZxgDMeSuSY1tf2nIoyI6ELRv2UQIO3042Qme7YC', 'Admin', '2025-11-27 11:47:24'),
(4, 'fahsai', '$2b$10$b0Z2.no8F/riSLc57et0ouagZAKT5bsS20/N8Tw6EC1/YNckhUdQW', 'Admin', '2025-11-27 15:13:55');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `action_logs`
--
ALTER TABLE `action_logs`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `expenses`
--
ALTER TABLE `expenses`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `product_categories`
--
ALTER TABLE `product_categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `sales`
--
ALTER TABLE `sales`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sale_details`
--
ALTER TABLE `sale_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sale_id` (`sale_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `action_logs`
--
ALTER TABLE `action_logs`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `expenses`
--
ALTER TABLE `expenses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `product_categories`
--
ALTER TABLE `product_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sales`
--
ALTER TABLE `sales`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `sale_details`
--
ALTER TABLE `sale_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `sale_details`
--
ALTER TABLE `sale_details`
  ADD CONSTRAINT `sale_details_ibfk_1` FOREIGN KEY (`sale_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `sale_details_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
