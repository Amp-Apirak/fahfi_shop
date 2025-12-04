-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Dec 04, 2025 at 02:46 AM
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
(14, 4, 'DELETE_SALE', 'sales', 1, 'User fahsai DELETED Sale ID: 1. Stock restored: (ProductID 1: Restored 1 units)', '2025-11-27 15:15:09'),
(15, 3, 'LOGIN', NULL, NULL, 'User Ampapirak logged in.', '2025-11-28 13:29:23'),
(16, 3, 'LOGIN', NULL, NULL, 'User Ampapirak logged in.', '2025-11-28 13:30:02'),
(17, 3, 'LOGIN', NULL, NULL, 'User Ampapirak logged in.', '2025-11-28 13:32:08'),
(18, 3, 'LOGIN', NULL, NULL, 'User Ampapirak logged in.', '2025-11-28 13:33:42'),
(19, 3, 'LOGIN', NULL, NULL, 'User Ampapirak logged in.', '2025-11-28 13:43:19'),
(20, 3, 'LOGIN', NULL, NULL, 'User Ampapirak logged in.', '2025-11-28 13:43:37'),
(21, 3, 'CREATE', 'expenses', 1, 'User Ampapirak created expense: กระสอบเสื้อสเวตเตอร์ (Amount: 3800)', '2025-11-28 13:52:50'),
(22, 3, 'CREATE', 'expenses', 2, 'User Ampapirak created expense: ค่าขนส่ง (Amount: 450)', '2025-11-28 13:53:11'),
(23, 3, 'UPDATE', 'expenses', 2, 'User Ampapirak updated expense ID: 2 (Details: ค่าขนส่ง)', '2025-11-28 13:53:19'),
(24, 3, 'CREATE', 'expenses', 3, 'User Ampapirak created expense: ที่หนีบป้าย,ถุงหูหิ้ว,ไม้หนีบผ้า,ไฟดวงเล็ก,ปลั๊กไฟ,สายไฟ,ไม้แขวนเสื้อ,ถุงหิ้ว + ป้ายราคา,ราวเล็ก (Amount: 1060)', '2025-11-28 13:53:45'),
(25, 3, 'CREATE', 'expenses', 4, 'User Ampapirak created expense: ป้ายห้อย,เครื่องตัดขุย,ถุงใส่ผ้า (Amount: 610)', '2025-11-28 13:54:00'),
(26, 3, 'UPDATE', 'expenses', 3, 'User Ampapirak updated expense ID: 3 (Details: ที่หนีบป้าย,ถุงหูหิ้ว,ไม้หนีบผ้า,ไฟดวงเล็ก,ปลั๊กไฟ,สายไฟ,ไม้แขวนเสื้อ,ถุงหิ้ว + ป้ายราคา,ราวเล็ก)', '2025-11-28 13:54:07'),
(27, 3, 'UPDATE', 'expenses', 4, 'User Ampapirak updated expense ID: 4 (Details: ป้ายห้อย,เครื่องตัดขุย,ถุงใส่ผ้า)', '2025-11-28 13:54:15'),
(28, 3, 'CREATE', 'expenses', 5, 'User Ampapirak created expense: ค่าเช่า 2*2 เมตร ไฟหนึ่งดวง (Amount: 200)', '2025-11-28 13:54:56'),
(29, 3, 'CREATE', 'expenses', 6, 'User Ampapirak created expense: ค่าซักอบแห้ง (Amount: 1480)', '2025-11-28 13:55:27'),
(30, 3, 'CREATE', 'expenses', 7, 'User Ampapirak created expense: ค่าเช่า 2*2 เมตร ไฟหนึ่งดวง (Amount: 200)', '2025-11-28 13:55:55'),
(31, 3, 'CREATE', 'expenses', 8, 'User Ampapirak created expense: ราวเกาะ,ราวใหญ่,ไฟดวงใหญ่,ไม้แขนว (Amount: 2124)', '2025-11-28 13:56:14'),
(32, 3, 'CREATE', 'expenses', 9, 'User Ampapirak created expense: สก๊อตเทปใส่ (Amount: 30)', '2025-11-28 13:56:57'),
(33, 3, 'CREATE', 'expenses', 10, 'User Ampapirak created expense: น้ำ (Amount: 45)', '2025-11-28 13:57:24'),
(34, 3, 'CREATE', 'expenses', 11, 'User Ampapirak created expense: อุปกรณ์ (Amount: 45)', '2025-11-28 13:57:44'),
(35, 3, 'CREATE', 'expenses', 12, 'User Ampapirak created expense: ค่าเช่าที่ 4 * 4 แนวลึกด้านหน้าตลาดนกฮูก (Amount: 400)', '2025-11-28 13:58:28'),
(36, 3, 'CREATE', 'expenses', 13, 'User Ampapirak created expense: ค่าเช่าที่ 4 * 4 แนวลึกด้านหน้าตลาดนกฮูก (Amount: 400)', '2025-11-28 14:01:13'),
(37, 3, 'CREATE', 'expenses', 14, 'User Ampapirak created expense: ปลั๊กไฟ 10 เมตร (Amount: 220)', '2025-11-28 14:01:30'),
(38, 3, 'CREATE', 'expenses', 15, 'User Ampapirak created expense: ราว 2*4 (Amount: 2247)', '2025-11-28 14:01:55'),
(39, 3, 'CREATE', 'expenses', 16, 'User Ampapirak created expense: เก้าอี้ (Amount: 281)', '2025-11-28 14:02:09'),
(40, 3, 'CREATE', 'expenses', 17, 'User Ampapirak created expense: กะละมัง (Amount: 160)', '2025-11-28 14:02:27'),
(41, 3, 'CREATE', 'expenses', 18, 'User Ampapirak created expense: ค่าขนส่ง (Amount: 450)', '2025-11-28 14:03:50'),
(42, 3, 'UPDATE', 'expenses', 16, 'User Ampapirak updated expense ID: 16 (Details: เก้าอี้)', '2025-11-28 14:03:58'),
(43, 3, 'CREATE', 'expenses', 19, 'User Ampapirak created expense: กระสอบเสื้อสเวตเตอร์ (Amount: 3800)', '2025-11-28 14:04:22'),
(44, 3, 'CREATE', 'expenses', 20, 'User Ampapirak created expense: ล้างรถ (Amount: 400)', '2025-11-28 14:04:42'),
(45, 3, 'UPDATE', 'expenses', 20, 'User Ampapirak updated expense ID: 20 (Details: ล้างรถ)', '2025-11-28 14:04:50'),
(46, 3, 'CREATE', 'expenses', 21, 'User Ampapirak created expense: พรบ.รถ + ภาษี  (Amount: 3200)', '2025-11-28 14:05:19'),
(47, 3, 'CREATE', 'expenses', 22, 'User Ampapirak created expense: ผงซักผ้า (Amount: 482)', '2025-11-28 14:05:38'),
(48, 3, 'CREATE', 'expenses', 23, 'User Ampapirak created expense: ซักผ้า (Amount: 1380)', '2025-11-28 14:06:26'),
(49, 3, 'UPDATE', 'expenses', 23, 'User Ampapirak updated expense ID: 23 (Details: ซักผ้า)', '2025-11-28 14:06:34'),
(50, 3, 'CREATE', 'expenses', 24, 'User Ampapirak created expense: เสื้ออีก 6 ตัวตัวละ 50 บาท (Amount: 300)', '2025-11-28 14:06:48'),
(51, 3, 'UPDATE', 'expenses', 24, 'User Ampapirak updated expense ID: 24 (Details: เสื้ออีก 6 ตัวตัวละ 50 บาท)', '2025-11-28 14:06:54'),
(52, 3, 'CREATE', 'expenses', 25, 'User Ampapirak created expense: ไปเอาเสื้อเขามา 4 ตัว (Amount: 300)', '2025-11-28 14:07:09'),
(53, 3, 'CREATE', 'expenses', 26, 'User Ampapirak created expense: ค่าเช่าพื้นที่ 4 * 4 แนวลึก (Amount: 400)', '2025-11-28 14:07:24'),
(54, 3, 'UPDATE', 'products', 2, 'User Ampapirak updated product ID: 2 (Name: เสื้อสเวตเตอร์คอกลม)', '2025-11-28 14:08:37'),
(55, 3, 'CREATE', 'products', 4, 'User Ampapirak created product: เสื้อสเวตเตอร์คอกลม Brand', '2025-11-28 14:10:35'),
(56, 3, 'UPDATE', 'products', 1, 'User Ampapirak updated product ID: 1 (Name: เสื้อสเวตเตอร์คอกลม A)', '2025-11-28 14:11:12'),
(57, 3, 'UPDATE', 'products', 2, 'User Ampapirak updated product ID: 2 (Name: เสื้อสเวตเตอร์คอกลม C)', '2025-11-28 14:11:27'),
(58, 3, 'CREATE', 'products', 5, 'User Ampapirak created product: เสื้อสเวตเตอร์คอกลม B', '2025-11-28 14:12:39'),
(59, 3, 'UPDATE', 'products', 5, 'User Ampapirak updated product ID: 5 (Name: เสื้อสเวตเตอร์คอกลม B)', '2025-11-28 14:13:00'),
(60, 3, 'UPDATE', 'products', 1, 'User Ampapirak updated product ID: 1 (Name: เสื้อสเวตเตอร์คอกลม A)', '2025-11-28 14:15:39'),
(61, 3, 'CREATE_SALE', 'sales', 2, 'User Ampapirak created Sale ID: 2. Items: เสื้อสเวตเตอร์คอกลม A (x151). Total: 20918 (Discount: 71)', '2025-11-28 14:16:07'),
(62, 3, 'UPDATE', 'products', 1, 'User Ampapirak updated product ID: 1 (Name: เสื้อสเวตเตอร์คอกลม A)', '2025-11-28 14:42:46'),
(63, 4, 'LOGIN', NULL, NULL, 'User fahsai logged in.', '2025-11-29 02:25:25'),
(64, 3, 'LOGIN', NULL, NULL, 'User Ampapirak logged in.', '2025-11-29 02:29:09'),
(65, 4, 'CREATE', 'expenses', 27, 'User fahsai created expense: ซักผ้ารอบ2 (Amount: 520)', '2025-11-29 02:29:30'),
(66, 3, 'LOGIN', NULL, NULL, 'User Ampapirak logged in.', '2025-11-29 03:12:58'),
(67, 3, 'LOGIN', NULL, NULL, 'User Ampapirak logged in.', '2025-11-29 03:12:58'),
(68, 3, 'DELETE', 'expenses', 26, 'User Ampapirak DELETED expense ID: 26 (Details: ค่าเช่าพื้นที่ 4 * 4 แนวลึก)', '2025-11-29 03:48:50'),
(69, 3, 'DELETE', 'expenses', 27, 'User Ampapirak DELETED expense ID: 27 (Details: ซักผ้ารอบ2)', '2025-11-29 03:48:52'),
(70, 3, 'DELETE', 'expenses', 25, 'User Ampapirak DELETED expense ID: 25 (Details: ไปเอาเสื้อเขามา 4 ตัว)', '2025-11-29 03:48:54'),
(71, 3, 'DELETE', 'expenses', 24, 'User Ampapirak DELETED expense ID: 24 (Details: เสื้ออีก 6 ตัวตัวละ 50 บาท)', '2025-11-29 03:48:57'),
(72, 3, 'DELETE', 'expenses', 23, 'User Ampapirak DELETED expense ID: 23 (Details: ซักผ้า)', '2025-11-29 03:48:59'),
(73, 3, 'DELETE', 'expenses', 22, 'User Ampapirak DELETED expense ID: 22 (Details: ผงซักผ้า)', '2025-11-29 03:49:02'),
(74, 3, 'DELETE', 'expenses', 21, 'User Ampapirak DELETED expense ID: 21 (Details: พรบ.รถ + ภาษี )', '2025-11-29 03:49:04'),
(75, 3, 'DELETE', 'expenses', 20, 'User Ampapirak DELETED expense ID: 20 (Details: ล้างรถ)', '2025-11-29 03:49:06'),
(76, 3, 'DELETE', 'expenses', 19, 'User Ampapirak DELETED expense ID: 19 (Details: กระสอบเสื้อสเวตเตอร์)', '2025-11-29 03:49:08'),
(77, 3, 'DELETE', 'expenses', 18, 'User Ampapirak DELETED expense ID: 18 (Details: ค่าขนส่ง)', '2025-11-29 03:49:10'),
(78, 3, 'DELETE', 'expenses', 17, 'User Ampapirak DELETED expense ID: 17 (Details: กะละมัง)', '2025-11-29 03:49:12'),
(79, 3, 'DELETE', 'expenses', 16, 'User Ampapirak DELETED expense ID: 16 (Details: เก้าอี้)', '2025-11-29 03:49:16'),
(80, 3, 'DELETE', 'expenses', 15, 'User Ampapirak DELETED expense ID: 15 (Details: ราว 2*4)', '2025-11-29 03:49:18'),
(81, 3, 'DELETE', 'expenses', 14, 'User Ampapirak DELETED expense ID: 14 (Details: ปลั๊กไฟ 10 เมตร)', '2025-11-29 03:49:20'),
(82, 3, 'DELETE', 'expenses', 13, 'User Ampapirak DELETED expense ID: 13 (Details: ค่าเช่าที่ 4 * 4 แนวลึกด้านหน้าตลาดนกฮูก)', '2025-11-29 03:49:23'),
(83, 3, 'DELETE', 'expenses', 12, 'User Ampapirak DELETED expense ID: 12 (Details: ค่าเช่าที่ 4 * 4 แนวลึกด้านหน้าตลาดนกฮูก)', '2025-11-29 03:49:25'),
(84, 3, 'DELETE', 'expenses', 11, 'User Ampapirak DELETED expense ID: 11 (Details: อุปกรณ์)', '2025-11-29 03:49:27'),
(85, 3, 'DELETE', 'expenses', 10, 'User Ampapirak DELETED expense ID: 10 (Details: น้ำ)', '2025-11-29 03:49:29'),
(86, 3, 'DELETE', 'expenses', 9, 'User Ampapirak DELETED expense ID: 9 (Details: สก๊อตเทปใส่)', '2025-11-29 03:49:32'),
(87, 3, 'DELETE', 'expenses', 8, 'User Ampapirak DELETED expense ID: 8 (Details: ราวเกาะ,ราวใหญ่,ไฟดวงใหญ่,ไม้แขนว)', '2025-11-29 03:49:34'),
(88, 3, 'DELETE', 'expenses', 7, 'User Ampapirak DELETED expense ID: 7 (Details: ค่าเช่า 2*2 เมตร ไฟหนึ่งดวง)', '2025-11-29 03:49:36'),
(89, 3, 'DELETE', 'expenses', 6, 'User Ampapirak DELETED expense ID: 6 (Details: ค่าซักอบแห้ง)', '2025-11-29 03:49:38'),
(90, 3, 'DELETE', 'expenses', 5, 'User Ampapirak DELETED expense ID: 5 (Details: ค่าเช่า 2*2 เมตร ไฟหนึ่งดวง)', '2025-11-29 03:49:40'),
(91, 3, 'DELETE', 'expenses', 4, 'User Ampapirak DELETED expense ID: 4 (Details: ป้ายห้อย,เครื่องตัดขุย,ถุงใส่ผ้า)', '2025-11-29 03:49:42'),
(92, 3, 'DELETE', 'expenses', 2, 'User Ampapirak DELETED expense ID: 2 (Details: ค่าขนส่ง)', '2025-11-29 03:49:45'),
(93, 3, 'DELETE', 'expenses', 1, 'User Ampapirak DELETED expense ID: 1 (Details: กระสอบเสื้อสเวตเตอร์)', '2025-11-29 03:49:47'),
(94, 3, 'DELETE', 'expenses', 3, 'User Ampapirak DELETED expense ID: 3 (Details: ที่หนีบป้าย,ถุงหูหิ้ว,ไม้หนีบผ้า,ไฟดวงเล็ก,ปลั๊กไฟ,สายไฟ,ไม้แขวนเสื้อ,ถุงหิ้ว + ป้ายราคา,ราวเล็ก)', '2025-11-29 03:49:49'),
(95, 3, 'DELETE_SALE', 'sales', 2, 'User Ampapirak DELETED Sale ID: 2. Stock restored: (ProductID 1: Restored 151 units)', '2025-11-29 03:50:01'),
(96, 3, 'CREATE', 'products', 6, 'User Ampapirak created product: เงินทุนหมุนเวียนในระบบ', '2025-11-29 03:52:16'),
(97, 3, 'UPDATE', 'products', 6, 'User Ampapirak updated product ID: 6 (Name: เงินทุนหมุนเวียนในระบบ)', '2025-11-29 03:53:33'),
(98, 3, 'CREATE_SALE', 'sales', 3, 'User Ampapirak created Sale ID: 3. Items: เงินทุนหมุนเวียนในระบบ (x1). Total: 3400 (Discount: -3300)', '2025-11-29 03:54:08'),
(99, 3, 'CREATE_SALE', 'sales', 4, 'User Ampapirak created Sale ID: 4. Items: เงินทุนหมุนเวียนในระบบ (x1). Total: 4250 (Discount: -4150)', '2025-11-29 03:54:36'),
(100, 3, 'CREATE', 'expenses', 28, 'User Ampapirak created expense: กระสอบ + ค่าขนส่ง (Amount: 4250)', '2025-11-29 03:55:28'),
(101, 3, 'CREATE', 'expenses', 29, 'User Ampapirak created expense: ค่าเช่าที่พื้นที่ 4 * 4 เมตร (Amount: 400)', '2025-11-29 03:57:15'),
(102, 3, 'LOGIN', NULL, NULL, 'User Ampapirak logged in.', '2025-11-29 07:41:33'),
(103, 3, 'CREATE_SALE', 'sales', 5, 'User Ampapirak created Sale ID: 5. Items: เสื้อสเวตเตอร์คอกลม C (x1). Total: 100 (Discount: 0)', '2025-11-29 09:43:15'),
(104, 3, 'CREATE_SALE', 'sales', 6, 'User Ampapirak created Sale ID: 6. Items: เสื้อสเวตเตอร์คอกลม C (x2). Total: 170 (Discount: 30)', '2025-11-29 09:43:30'),
(105, 3, 'CREATE_SALE', 'sales', 7, 'User Ampapirak created Sale ID: 7. Items: เสื้อสเวตเตอร์คอกลม A (x4). Total: 556 (Discount: 0)', '2025-11-29 09:43:56'),
(106, 3, 'CREATE_SALE', 'sales', 8, 'User Ampapirak created Sale ID: 8. Items: เสื้อสเวตเตอร์คอกลม C (x1). Total: 100 (Discount: 0)', '2025-11-29 09:44:04'),
(107, 3, 'UPDATE', 'expenses', 29, 'User Ampapirak updated expense ID: 29 (Details: ค่าเช่าที่พื้นที่ 4 * 4 เมตร)', '2025-11-29 09:45:38'),
(108, 3, 'UPDATE', 'expenses', 28, 'User Ampapirak updated expense ID: 28 (Details: กระสอบ + ค่าขนส่ง)', '2025-11-29 09:45:44'),
(109, 3, 'DELETE_SALE', 'sales', 4, 'User Ampapirak DELETED Sale ID: 4. Stock restored: (ProductID 6: Restored 1 units)', '2025-11-29 09:46:49'),
(110, 3, 'DELETE_SALE', 'sales', 3, 'User Ampapirak DELETED Sale ID: 3. Stock restored: (ProductID 6: Restored 1 units)', '2025-11-29 09:46:54'),
(111, 3, 'CREATE_SALE', 'sales', 9, 'User Ampapirak created Sale ID: 9. Items: เสื้อสเวตเตอร์คอกลม C (x1). Total: 100 (Discount: 0)', '2025-11-29 09:47:32'),
(112, 3, 'CREATE_SALE', 'sales', 10, 'User Ampapirak created Sale ID: 10. Items: เสื้อสเวตเตอร์คอกลม A (x1). Total: 139 (Discount: 0)', '2025-11-29 09:50:52'),
(113, 3, 'CREATE_SALE', 'sales', 11, 'User Ampapirak created Sale ID: 11. Items: เสื้อสเวตเตอร์คอกลม C (x1). Total: 100 (Discount: 0)', '2025-11-29 09:53:31'),
(114, 3, 'CREATE_SALE', 'sales', 12, 'User Ampapirak created Sale ID: 12. Items: เสื้อสเวตเตอร์คอกลม A (x1), เสื้อสเวตเตอร์คอกลม C (x1). Total: 239 (Discount: 0)', '2025-11-29 10:00:20'),
(115, 3, 'UPDATE', 'expenses', 29, 'User Ampapirak updated expense ID: 29 (Details: ค่าเช่าที่พื้นที่ 4 * 4 เมตร)', '2025-11-29 10:00:35'),
(116, 3, 'CREATE_SALE', 'sales', 13, 'User Ampapirak created Sale ID: 13. Items: เสื้อสเวตเตอร์คอกลม C (x1). Total: 100 (Discount: 0)', '2025-11-29 10:14:35'),
(117, 3, 'CREATE_SALE', 'sales', 14, 'User Ampapirak created Sale ID: 14. Items: เสื้อสเวตเตอร์คอกลม A (x1). Total: 139 (Discount: 0)', '2025-11-29 10:15:57'),
(118, 3, 'CREATE_SALE', 'sales', 15, 'User Ampapirak created Sale ID: 15. Items: เสื้อสเวตเตอร์คอกลม A (x1). Total: 139 (Discount: 0)', '2025-11-29 10:20:10'),
(119, 3, 'CREATE', 'expenses', 30, 'User Ampapirak created expense: ค่าถุงหิ้วใส่เสื้อ (Amount: 148)', '2025-11-29 10:29:59'),
(120, 3, 'CREATE_SALE', 'sales', 16, 'User Ampapirak created Sale ID: 16. Items: เสื้อสเวตเตอร์คอกลม A (x1). Total: 139 (Discount: 0)', '2025-11-29 10:37:29'),
(121, 3, 'CREATE_SALE', 'sales', 17, 'User Ampapirak created Sale ID: 17. Items: เสื้อสเวตเตอร์คอกลม A (x1). Total: 139 (Discount: 0)', '2025-11-29 10:40:19'),
(122, 3, 'CREATE_SALE', 'sales', 18, 'User Ampapirak created Sale ID: 18. Items: เสื้อสเวตเตอร์คอกลม A (x1). Total: 139 (Discount: 0)', '2025-11-29 10:47:05'),
(123, 3, 'CREATE_SALE', 'sales', 19, 'User Ampapirak created Sale ID: 19. Items: เสื้อสเวตเตอร์คอกลม A (x1). Total: 139 (Discount: 0)', '2025-11-29 10:47:18'),
(124, 3, 'CREATE_SALE', 'sales', 20, 'User Ampapirak created Sale ID: 20. Items: เสื้อสเวตเตอร์คอกลม A (x5), เสื้อสเวตเตอร์คอกลม C (x6). Total: 1100 (Discount: 195)', '2025-11-29 10:51:12'),
(125, 3, 'CREATE_SALE', 'sales', 21, 'User Ampapirak created Sale ID: 21. Items: เสื้อสเวตเตอร์คอกลม A (x1). Total: 139 (Discount: 0)', '2025-11-29 10:52:31'),
(126, 3, 'CREATE_SALE', 'sales', 22, 'User Ampapirak created Sale ID: 22. Items: เสื้อสเวตเตอร์คอกลม C (x1). Total: 100 (Discount: 0)', '2025-11-29 11:05:13'),
(127, 3, 'CREATE_SALE', 'sales', 23, 'User Ampapirak created Sale ID: 23. Items: เสื้อสเวตเตอร์คอกลม A (x1). Total: 139 (Discount: 0)', '2025-11-29 11:10:45'),
(128, 3, 'CREATE_SALE', 'sales', 24, 'User Ampapirak created Sale ID: 24. Items: เสื้อสเวตเตอร์คอกลม C (x1). Total: 100 (Discount: 0)', '2025-11-29 11:20:36'),
(129, 3, 'CREATE_SALE', 'sales', 25, 'User Ampapirak created Sale ID: 25. Items: เสื้อสเวตเตอร์คอกลม C (x1). Total: 100 (Discount: 0)', '2025-11-29 11:22:35'),
(130, 3, 'CREATE_SALE', 'sales', 26, 'User Ampapirak created Sale ID: 26. Items: เสื้อสเวตเตอร์คอกลม C (x1). Total: 100 (Discount: 0)', '2025-11-29 11:23:17'),
(131, 3, 'CREATE_SALE', 'sales', 27, 'User Ampapirak created Sale ID: 27. Items: เสื้อสเวตเตอร์คอกลม C (x1). Total: 100 (Discount: 0)', '2025-11-29 11:25:25'),
(132, 3, 'CREATE_SALE', 'sales', 28, 'User Ampapirak created Sale ID: 28. Items: เสื้อสเวตเตอร์คอกลม A (x1), เสื้อสเวตเตอร์คอกลม C (x1). Total: 239 (Discount: 0)', '2025-11-29 11:28:09'),
(133, 3, 'LOGIN', NULL, NULL, 'User Ampapirak logged in.', '2025-11-29 11:47:45'),
(134, 3, 'CREATE_SALE', 'sales', 29, 'User Ampapirak created Sale ID: 29. Items: เสื้อสเวตเตอร์คอกลม C (x1). Total: 100 (Discount: 0)', '2025-11-29 11:55:16'),
(135, 3, 'CREATE_SALE', 'sales', 30, 'User Ampapirak created Sale ID: 30. Items: เสื้อสเวตเตอร์คอกลม C (x2). Total: 200 (Discount: 0)', '2025-11-29 12:26:06'),
(136, 3, 'CREATE_SALE', 'sales', 31, 'User Ampapirak created Sale ID: 31. Items: เสื้อสเวตเตอร์คอกลม A (x2), เสื้อสเวตเตอร์คอกลม C (x2). Total: 430 (Discount: 48)', '2025-11-29 12:31:18'),
(137, 3, 'CREATE_SALE', 'sales', 32, 'User Ampapirak created Sale ID: 32. Items: เสื้อสเวตเตอร์คอกลม A (x1), เสื้อสเวตเตอร์คอกลม C (x3). Total: 430 (Discount: 9)', '2025-11-29 12:31:52'),
(138, 3, 'CREATE_SALE', 'sales', 33, 'User Ampapirak created Sale ID: 33. Items: เสื้อสเวตเตอร์คอกลม C (x3). Total: 300 (Discount: 0)', '2025-11-29 12:35:37'),
(139, 3, 'CREATE_SALE', 'sales', 34, 'User Ampapirak created Sale ID: 34. Items: เสื้อสเวตเตอร์คอกลม A (x1). Total: 139 (Discount: 0)', '2025-11-29 12:41:35'),
(140, 3, 'CREATE_SALE', 'sales', 35, 'User Ampapirak created Sale ID: 35. Items: เสื้อสเวตเตอร์คอกลม A (x1). Total: 139 (Discount: 0)', '2025-11-29 12:48:03'),
(141, 3, 'CREATE_SALE', 'sales', 36, 'User Ampapirak created Sale ID: 36. Items: เสื้อสเวตเตอร์คอกลม C (x1). Total: 100 (Discount: 0)', '2025-11-29 12:48:42'),
(142, 3, 'CREATE_SALE', 'sales', 37, 'User Ampapirak created Sale ID: 37. Items: เสื้อสเวตเตอร์คอกลม A (x2). Total: 250.2 (Discount: 27.8)', '2025-11-29 12:54:18'),
(143, 3, 'CREATE_SALE', 'sales', 38, 'User Ampapirak created Sale ID: 38. Items: เสื้อสเวตเตอร์คอกลม A (x1). Total: 139 (Discount: 0)', '2025-11-29 13:00:37'),
(144, 3, 'CREATE_SALE', 'sales', 39, 'User Ampapirak created Sale ID: 39. Items: เสื้อสเวตเตอร์คอกลม A (x1). Total: 139 (Discount: 0)', '2025-11-29 13:02:11'),
(145, 3, 'CREATE_SALE', 'sales', 40, 'User Ampapirak created Sale ID: 40. Items: เสื้อสเวตเตอร์คอกลม A (x1). Total: 139 (Discount: 0)', '2025-11-29 13:10:22'),
(146, 3, 'CREATE_SALE', 'sales', 41, 'User Ampapirak created Sale ID: 41. Items: เสื้อสเวตเตอร์คอกลม A (x1). Total: 139 (Discount: 0)', '2025-11-29 13:12:49'),
(147, 3, 'CREATE_SALE', 'sales', 42, 'User Ampapirak created Sale ID: 42. Items: เสื้อสเวตเตอร์คอกลม C (x1). Total: 100 (Discount: 0)', '2025-11-29 13:14:15'),
(148, 3, 'CREATE_SALE', 'sales', 43, 'User Ampapirak created Sale ID: 43. Items: เสื้อสเวตเตอร์คอกลม A (x1), เสื้อสเวตเตอร์คอกลม C (x1). Total: 239 (Discount: 0)', '2025-11-29 13:25:53'),
(149, 3, 'CREATE_SALE', 'sales', 44, 'User Ampapirak created Sale ID: 44. Items: เสื้อสเวตเตอร์คอกลม A (x1). Total: 139 (Discount: 0)', '2025-11-29 13:30:27'),
(150, 3, 'CREATE_SALE', 'sales', 45, 'User Ampapirak created Sale ID: 45. Items: เสื้อสเวตเตอร์คอกลม A (x1). Total: 139 (Discount: 0)', '2025-11-29 13:32:48'),
(151, 3, 'CREATE_SALE', 'sales', 46, 'User Ampapirak created Sale ID: 46. Items: เสื้อสเวตเตอร์คอกลม A (x1). Total: 139 (Discount: 0)', '2025-11-29 13:48:15'),
(152, 3, 'CREATE_SALE', 'sales', 47, 'User Ampapirak created Sale ID: 47. Items: เสื้อสเวตเตอร์คอกลม C (x1). Total: 100 (Discount: 0)', '2025-11-29 13:49:06'),
(153, 3, 'CREATE_SALE', 'sales', 48, 'User Ampapirak created Sale ID: 48. Items: เสื้อสเวตเตอร์คอกลม C (x1). Total: 100 (Discount: 0)', '2025-11-29 13:51:23'),
(154, 3, 'CREATE_SALE', 'sales', 49, 'User Ampapirak created Sale ID: 49. Items: เสื้อสเวตเตอร์คอกลม A (x2). Total: 270 (Discount: 8)', '2025-11-29 13:52:11'),
(155, 3, 'CREATE_SALE', 'sales', 50, 'User Ampapirak created Sale ID: 50. Items: เสื้อสเวตเตอร์คอกลม A (x2). Total: 278 (Discount: 0)', '2025-11-29 13:53:43'),
(156, 3, 'CREATE_SALE', 'sales', 51, 'User Ampapirak created Sale ID: 51. Items: เสื้อสเวตเตอร์คอกลม A (x1). Total: 139 (Discount: 0)', '2025-11-29 13:59:45'),
(157, 3, 'CREATE_SALE', 'sales', 52, 'User Ampapirak created Sale ID: 52. Items: เสื้อสเวตเตอร์คอกลม A (x1). Total: 139 (Discount: 0)', '2025-11-29 14:09:29'),
(158, 3, 'CREATE_SALE', 'sales', 53, 'User Ampapirak created Sale ID: 53. Items: เสื้อสเวตเตอร์คอกลม A (x2). Total: 278 (Discount: 0)', '2025-11-29 14:15:57'),
(159, 3, 'CREATE_SALE', 'sales', 54, 'User Ampapirak created Sale ID: 54. Items: เสื้อสเวตเตอร์คอกลม C (x1). Total: 100 (Discount: 0)', '2025-11-29 14:16:03'),
(160, 3, 'CREATE_SALE', 'sales', 55, 'User Ampapirak created Sale ID: 55. Items: เสื้อสเวตเตอร์คอกลม C (x2), เสื้อสเวตเตอร์คอกลม A (x1). Total: 339 (Discount: 0)', '2025-11-29 14:19:53'),
(161, 3, 'CREATE_SALE', 'sales', 56, 'User Ampapirak created Sale ID: 56. Items: เสื้อสเวตเตอร์คอกลม C (x2). Total: 170 (Discount: 30)', '2025-11-29 14:42:32'),
(162, 3, 'CREATE_SALE', 'sales', 57, 'User Ampapirak created Sale ID: 57. Items: เสื้อสเวตเตอร์คอกลม A (x1). Total: 139 (Discount: 0)', '2025-11-29 14:42:51'),
(163, 3, 'CREATE_SALE', 'sales', 58, 'User Ampapirak created Sale ID: 58. Items: เสื้อสเวตเตอร์คอกลม A (x2). Total: 278 (Discount: 0)', '2025-11-29 14:51:42'),
(164, 3, 'CREATE_SALE', 'sales', 59, 'User Ampapirak created Sale ID: 59. Items: เสื้อสเวตเตอร์คอกลม C (x1). Total: 100 (Discount: 0)', '2025-11-29 14:57:27'),
(165, 3, 'CREATE_SALE', 'sales', 60, 'User Ampapirak created Sale ID: 60. Items: เสื้อสเวตเตอร์คอกลม C (x1). Total: 100 (Discount: 0)', '2025-11-29 16:01:25'),
(166, 3, 'CREATE_SALE', 'sales', 61, 'User Ampapirak created Sale ID: 61. Items: เสื้อสเวตเตอร์คอกลม A (x2). Total: 250.2 (Discount: 27.8)', '2025-11-29 16:06:12'),
(167, 3, 'CREATE_SALE', 'sales', 62, 'User Ampapirak created Sale ID: 62. Items: เสื้อสเวตเตอร์คอกลม A (x1), เสื้อสเวตเตอร์คอกลม C (x1). Total: 239 (Discount: 0)', '2025-11-29 16:10:02'),
(168, 3, 'CREATE_SALE', 'sales', 63, 'User Ampapirak created Sale ID: 63. Items: เสื้อสเวตเตอร์คอกลม A (x1), เสื้อสเวตเตอร์คอกลม C (x1). Total: 239 (Discount: 0)', '2025-11-29 16:21:06'),
(169, 3, 'CREATE_SALE', 'sales', 64, 'User Ampapirak created Sale ID: 64. Items: เสื้อสเวตเตอร์คอกลม A (x1). Total: 139 (Discount: 0)', '2025-11-29 16:22:39'),
(170, 3, 'CREATE_SALE', 'sales', 65, 'User Ampapirak created Sale ID: 65. Items: เสื้อสเวตเตอร์คอกลม A (x1). Total: 139 (Discount: 0)', '2025-11-29 16:29:19'),
(171, 3, 'CREATE_SALE', 'sales', 66, 'User Ampapirak created Sale ID: 66. Items: เสื้อสเวตเตอร์คอกลม C (x2). Total: 180 (Discount: 20)', '2025-11-29 16:35:50'),
(172, 3, 'CREATE_SALE', 'sales', 67, 'User Ampapirak created Sale ID: 67. Items: เสื้อสเวตเตอร์คอกลม C (x3). Total: 300 (Discount: 0)', '2025-11-29 17:02:02'),
(173, 3, 'CREATE_SALE', 'sales', 68, 'User Ampapirak created Sale ID: 68. Items: เสื้อสเวตเตอร์คอกลม C (x1). Total: 100 (Discount: 0)', '2025-11-29 17:02:05'),
(174, 3, 'CREATE_SALE', 'sales', 69, 'User Ampapirak created Sale ID: 69. Items: เสื้อสเวตเตอร์คอกลม A (x1), เสื้อสเวตเตอร์คอกลม C (x1). Total: 239 (Discount: 0)', '2025-11-29 17:03:12'),
(175, 4, 'LOGIN', NULL, NULL, 'User fahsai logged in.', '2025-11-29 18:36:40'),
(176, 3, 'DELETE', 'products', 6, 'User Ampapirak DELETED product ID: 6 (Name: เงินทุนหมุนเวียนในระบบ)', '2025-11-30 08:05:50'),
(177, 3, 'ADD_CAPITAL', NULL, NULL, 'Added capital log: deposit 15000', '2025-11-30 08:08:10'),
(178, 3, 'UPDATE', 'products', 2, 'User Ampapirak updated product ID: 2 (Name: เสื้อสเวตเตอร์คอกลม C)', '2025-11-30 08:10:08'),
(179, 3, 'ADJUST_STOCK', 'products', 1, 'User Ampapirak adjusted stock for Product 1: 197 -> 100. Reason: นับผิด', '2025-11-30 08:10:30'),
(180, 3, 'LOGIN', NULL, NULL, 'User Ampapirak logged in.', '2025-12-04 00:55:45'),
(181, 3, 'CREATE', 'expenses', 31, 'User Ampapirak created expense: ซักผ้า + อบแห้ง (Amount: 910)', '2025-12-04 01:07:28'),
(182, 3, 'CREATE', 'expenses', 32, 'User Ampapirak created expense: ไม้แขวนเสื้อสีขาว จำนวน 100  (จ่ายเงินส่วนตัวยังไม่ได้เอาคืน) (Amount: 209)', '2025-12-04 01:13:54'),
(183, 3, 'CREATE', 'expenses', 33, 'User Ampapirak created expense: เตารีดไอน้ำ  (Amount: 1440)', '2025-12-04 01:15:15');

-- --------------------------------------------------------

--
-- Table structure for table `capital_logs`
--

CREATE TABLE `capital_logs` (
  `id` int(11) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `type` enum('deposit','withdraw') NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `transaction_date` datetime NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `capital_logs`
--

INSERT INTO `capital_logs` (`id`, `amount`, `type`, `description`, `transaction_date`, `created_at`) VALUES
(1, 15000.00, 'deposit', 'เงินทุนในระบบ ', '2025-11-30 00:00:00', '2025-11-30 08:08:10');

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

--
-- Dumping data for table `expenses`
--

INSERT INTO `expenses` (`id`, `expense_date`, `category`, `details`, `amount`, `receipt_image_url`, `created_by`, `created_at`, `last_updated_at`, `last_updated_by`) VALUES
(28, '2025-11-30', 'สต็อกสินค้า', 'กระสอบ + ค่าขนส่ง', 4250.00, '', 3, '2025-11-29 03:55:28', '2025-11-29 09:45:44', 3),
(29, '2025-11-29', 'ค่าเช่า', 'ค่าเช่าที่พื้นที่ 4 * 4 เมตร', 400.00, '', 3, '2025-11-29 03:57:15', '2025-11-29 10:00:35', 3),
(30, '2025-11-29', 'อื่นๆ', 'ค่าถุงหิ้วใส่เสื้อ', 148.00, '', 3, '2025-11-29 10:29:59', '2025-11-29 10:29:59', 3),
(31, '2025-12-03', 'ซักผ้า', 'ซักผ้า + อบแห้ง', 910.00, '', 3, '2025-12-04 01:07:28', '2025-12-04 01:07:28', 3),
(32, '2025-12-03', 'ค่าอุปกรณ์', 'ไม้แขวนเสื้อสีขาว จำนวน 100  (จ่ายเงินส่วนตัวยังไม่ได้เอาคืน)', 209.00, '', 3, '2025-12-04 01:13:54', '2025-12-04 01:13:54', 3),
(33, '2025-12-02', 'ค่าอุปกรณ์', 'เตารีดไอน้ำ ', 1440.00, '', 3, '2025-12-04 01:15:15', '2025-12-04 01:15:15', 3);

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
(1, 'เสื้อสเวตเตอร์คอกลม A', 'เสื้อ', 'A', 'เสื้อสเวตเตอร์คอกลม A', 35.00, 139.00, 100, 'http://localhost:3001/uploads/1764253869503.jpg', '2025-11-27 14:30:18', '2025-11-30 08:10:30', 3),
(2, 'เสื้อสเวตเตอร์คอกลม C', 'เสื้อ', 'C', 'เสื้อสเวตเตอร์คอกลม C', 35.00, 100.00, 100, '/api/uploads/1764256075017.jpg', '2025-11-27 14:58:23', '2025-11-30 08:10:08', 3),
(3, 'เสื้อยืดคอกลม', 'เสื้อ', 'AB', 'เสื้อยืดคอกลม AB', 35.00, 60.00, 100, '/api/uploads/1764256170928.jpg', '2025-11-27 15:09:33', '2025-11-27 15:09:33', 3),
(4, 'เสื้อสเวตเตอร์คอกลม Brand', 'เสื้อ', 'Brand', 'เสื้อสเวตเตอร์คอกลม Brand', 35.00, 159.00, 100, '/api/uploads/1764339033475.jpg', '2025-11-28 14:10:35', '2025-11-28 14:10:35', 3),
(5, 'เสื้อสเวตเตอร์คอกลม B', 'เสื้อ', 'ฺฺิิB', 'เสื้อสเวตเตอร์คอกลม B', 35.00, 129.00, 100, '/api/uploads/1764339157347.jpg', '2025-11-28 14:12:39', '2025-11-28 14:13:00', 3);

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
  `last_updated_by` int(11) DEFAULT NULL,
  `received_amount` decimal(10,2) DEFAULT 0.00,
  `change_amount` decimal(10,2) DEFAULT 0.00,
  `payment_method` varchar(50) DEFAULT 'cash'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sales`
--

INSERT INTO `sales` (`id`, `sale_date`, `total_amount`, `discount`, `created_by`, `last_updated_at`, `last_updated_by`, `received_amount`, `change_amount`, `payment_method`) VALUES
(5, '2025-11-29 09:43:15', 100.00, 0.00, 3, '2025-11-29 09:43:15', 3, 0.00, 0.00, 'cash'),
(6, '2025-11-29 09:43:30', 170.00, 30.00, 3, '2025-11-29 09:43:30', 3, 0.00, 0.00, 'cash'),
(7, '2025-11-29 09:43:56', 556.00, 0.00, 3, '2025-11-29 09:43:56', 3, 0.00, 0.00, 'cash'),
(8, '2025-11-29 09:44:03', 100.00, 0.00, 3, '2025-11-29 09:44:03', 3, 0.00, 0.00, 'cash'),
(9, '2025-11-29 09:47:32', 100.00, 0.00, 3, '2025-11-29 09:47:32', 3, 0.00, 0.00, 'cash'),
(10, '2025-11-29 09:50:52', 139.00, 0.00, 3, '2025-11-29 09:50:52', 3, 0.00, 0.00, 'cash'),
(11, '2025-11-29 09:53:31', 100.00, 0.00, 3, '2025-11-29 09:53:31', 3, 0.00, 0.00, 'cash'),
(12, '2025-11-29 10:00:19', 239.00, 0.00, 3, '2025-11-29 10:00:19', 3, 0.00, 0.00, 'cash'),
(13, '2025-11-29 10:14:35', 100.00, 0.00, 3, '2025-11-29 10:14:35', 3, 0.00, 0.00, 'cash'),
(14, '2025-11-29 10:15:57', 139.00, 0.00, 3, '2025-11-29 10:15:57', 3, 0.00, 0.00, 'cash'),
(15, '2025-11-29 10:20:09', 139.00, 0.00, 3, '2025-11-29 10:20:09', 3, 0.00, 0.00, 'cash'),
(16, '2025-11-29 10:37:29', 139.00, 0.00, 3, '2025-11-29 10:37:29', 3, 0.00, 0.00, 'cash'),
(17, '2025-11-29 10:40:19', 139.00, 0.00, 3, '2025-11-29 10:40:19', 3, 0.00, 0.00, 'cash'),
(18, '2025-11-29 10:46:42', 139.00, 0.00, 3, '2025-11-29 10:46:42', 3, 0.00, 0.00, 'cash'),
(19, '2025-11-29 10:47:18', 139.00, 0.00, 3, '2025-11-29 10:47:18', 3, 0.00, 0.00, 'cash'),
(20, '2025-11-29 10:51:12', 1100.00, 195.00, 3, '2025-11-29 10:51:12', 3, 0.00, 0.00, 'cash'),
(21, '2025-11-29 10:52:30', 139.00, 0.00, 3, '2025-11-29 10:52:30', 3, 0.00, 0.00, 'cash'),
(22, '2025-11-29 11:05:13', 100.00, 0.00, 3, '2025-11-29 11:05:13', 3, 0.00, 0.00, 'cash'),
(23, '2025-11-29 11:10:45', 139.00, 0.00, 3, '2025-11-29 11:10:45', 3, 0.00, 0.00, 'cash'),
(24, '2025-11-29 11:20:36', 100.00, 0.00, 3, '2025-11-29 11:20:36', 3, 0.00, 0.00, 'cash'),
(25, '2025-11-29 11:22:35', 100.00, 0.00, 3, '2025-11-29 11:22:35', 3, 0.00, 0.00, 'cash'),
(26, '2025-11-29 11:23:17', 100.00, 0.00, 3, '2025-11-29 11:23:17', 3, 0.00, 0.00, 'cash'),
(27, '2025-11-29 11:25:25', 100.00, 0.00, 3, '2025-11-29 11:25:25', 3, 0.00, 0.00, 'cash'),
(28, '2025-11-29 11:28:09', 239.00, 0.00, 3, '2025-11-29 11:28:09', 3, 0.00, 0.00, 'cash'),
(29, '2025-11-29 11:55:16', 100.00, 0.00, 3, '2025-11-29 11:55:16', 3, 0.00, 0.00, 'cash'),
(30, '2025-11-29 12:26:06', 200.00, 0.00, 3, '2025-11-29 12:26:06', 3, 0.00, 0.00, 'cash'),
(31, '2025-11-29 12:31:18', 430.00, 48.00, 3, '2025-11-29 12:31:18', 3, 0.00, 0.00, 'cash'),
(32, '2025-11-29 12:31:52', 430.00, 9.00, 3, '2025-11-29 12:31:52', 3, 0.00, 0.00, 'cash'),
(33, '2025-11-29 12:35:37', 300.00, 0.00, 3, '2025-11-29 12:35:37', 3, 0.00, 0.00, 'cash'),
(34, '2025-11-29 12:41:35', 139.00, 0.00, 3, '2025-11-29 12:41:35', 3, 0.00, 0.00, 'cash'),
(35, '2025-11-29 12:48:03', 139.00, 0.00, 3, '2025-11-29 12:48:03', 3, 0.00, 0.00, 'cash'),
(36, '2025-11-29 12:48:42', 100.00, 0.00, 3, '2025-11-29 12:48:42', 3, 0.00, 0.00, 'cash'),
(37, '2025-11-29 12:54:18', 250.20, 27.80, 3, '2025-11-29 12:54:18', 3, 0.00, 0.00, 'cash'),
(38, '2025-11-29 13:00:37', 139.00, 0.00, 3, '2025-11-29 13:00:37', 3, 0.00, 0.00, 'cash'),
(39, '2025-11-29 13:02:11', 139.00, 0.00, 3, '2025-11-29 13:02:11', 3, 0.00, 0.00, 'cash'),
(40, '2025-11-29 13:10:22', 139.00, 0.00, 3, '2025-11-29 13:10:22', 3, 0.00, 0.00, 'cash'),
(41, '2025-11-29 13:12:49', 139.00, 0.00, 3, '2025-11-29 13:12:49', 3, 0.00, 0.00, 'cash'),
(42, '2025-11-29 13:14:15', 100.00, 0.00, 3, '2025-11-29 13:14:15', 3, 0.00, 0.00, 'cash'),
(43, '2025-11-29 13:25:53', 239.00, 0.00, 3, '2025-11-29 13:25:53', 3, 0.00, 0.00, 'cash'),
(44, '2025-11-29 13:30:27', 139.00, 0.00, 3, '2025-11-29 13:30:27', 3, 0.00, 0.00, 'cash'),
(45, '2025-11-29 13:32:48', 139.00, 0.00, 3, '2025-11-29 13:32:48', 3, 0.00, 0.00, 'cash'),
(46, '2025-11-29 13:48:15', 139.00, 0.00, 3, '2025-11-29 13:48:15', 3, 0.00, 0.00, 'cash'),
(47, '2025-11-29 13:49:06', 100.00, 0.00, 3, '2025-11-29 13:49:06', 3, 0.00, 0.00, 'cash'),
(48, '2025-11-29 13:51:23', 100.00, 0.00, 3, '2025-11-29 13:51:23', 3, 0.00, 0.00, 'cash'),
(49, '2025-11-29 13:52:11', 270.00, 8.00, 3, '2025-11-29 13:52:11', 3, 0.00, 0.00, 'cash'),
(50, '2025-11-29 13:53:42', 278.00, 0.00, 3, '2025-11-29 13:53:42', 3, 0.00, 0.00, 'cash'),
(51, '2025-11-29 13:59:45', 139.00, 0.00, 3, '2025-11-29 13:59:45', 3, 0.00, 0.00, 'cash'),
(52, '2025-11-29 14:09:29', 139.00, 0.00, 3, '2025-11-29 14:09:29', 3, 0.00, 0.00, 'cash'),
(53, '2025-11-29 14:15:57', 278.00, 0.00, 3, '2025-11-29 14:15:57', 3, 0.00, 0.00, 'cash'),
(54, '2025-11-29 14:16:03', 100.00, 0.00, 3, '2025-11-29 14:16:03', 3, 0.00, 0.00, 'cash'),
(55, '2025-11-29 14:19:53', 339.00, 0.00, 3, '2025-11-29 14:19:53', 3, 0.00, 0.00, 'cash'),
(56, '2025-11-29 14:42:31', 170.00, 30.00, 3, '2025-11-29 14:42:31', 3, 0.00, 0.00, 'cash'),
(57, '2025-11-29 14:42:51', 139.00, 0.00, 3, '2025-11-29 14:42:51', 3, 0.00, 0.00, 'cash'),
(58, '2025-11-29 14:51:42', 278.00, 0.00, 3, '2025-11-29 14:51:42', 3, 0.00, 0.00, 'cash'),
(59, '2025-11-29 14:57:27', 100.00, 0.00, 3, '2025-11-29 14:57:27', 3, 0.00, 0.00, 'cash'),
(60, '2025-11-29 16:01:25', 100.00, 0.00, 3, '2025-11-29 16:01:25', 3, 0.00, 0.00, 'cash'),
(61, '2025-11-29 16:06:12', 250.20, 27.80, 3, '2025-11-29 16:06:12', 3, 0.00, 0.00, 'cash'),
(62, '2025-11-29 16:10:02', 239.00, 0.00, 3, '2025-11-29 16:10:02', 3, 0.00, 0.00, 'cash'),
(63, '2025-11-29 16:21:05', 239.00, 0.00, 3, '2025-11-29 16:21:05', 3, 0.00, 0.00, 'cash'),
(64, '2025-11-29 16:22:39', 139.00, 0.00, 3, '2025-11-29 16:22:39', 3, 0.00, 0.00, 'cash'),
(65, '2025-11-29 16:29:18', 139.00, 0.00, 3, '2025-11-29 16:29:18', 3, 0.00, 0.00, 'cash'),
(66, '2025-11-29 16:35:50', 180.00, 20.00, 3, '2025-11-29 16:35:50', 3, 0.00, 0.00, 'cash'),
(67, '2025-11-29 17:02:02', 300.00, 0.00, 3, '2025-11-29 17:02:02', 3, 0.00, 0.00, 'cash'),
(68, '2025-11-29 17:02:05', 100.00, 0.00, 3, '2025-11-29 17:02:05', 3, 0.00, 0.00, 'cash'),
(69, '2025-11-29 17:03:12', 239.00, 0.00, 3, '2025-11-29 17:03:12', 3, 0.00, 0.00, 'cash');

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
  `cost_at_sale` decimal(10,2) NOT NULL DEFAULT 0.00,
  `discount_amount` decimal(10,2) NOT NULL DEFAULT 0.00 COMMENT 'ส่วนลด (บาท) เฉพาะรายการนี้',
  `line_total` decimal(10,2) NOT NULL COMMENT '(Price * Qty) - Discount'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `sale_details`
--

INSERT INTO `sale_details` (`id`, `sale_id`, `product_id`, `quantity`, `price_at_sale`, `cost_at_sale`, `discount_amount`, `line_total`) VALUES
(5, 5, 2, 1, 100.00, 0.00, 0.00, 100.00),
(6, 6, 2, 2, 100.00, 0.00, 0.00, 200.00),
(7, 7, 1, 4, 139.00, 0.00, 0.00, 556.00),
(8, 8, 2, 1, 100.00, 0.00, 0.00, 100.00),
(9, 9, 2, 1, 100.00, 0.00, 0.00, 100.00),
(10, 10, 1, 1, 139.00, 0.00, 0.00, 139.00),
(11, 11, 2, 1, 100.00, 0.00, 0.00, 100.00),
(12, 12, 1, 1, 139.00, 0.00, 0.00, 139.00),
(13, 12, 2, 1, 100.00, 0.00, 0.00, 100.00),
(14, 13, 2, 1, 100.00, 0.00, 0.00, 100.00),
(15, 14, 1, 1, 139.00, 0.00, 0.00, 139.00),
(16, 15, 1, 1, 139.00, 0.00, 0.00, 139.00),
(17, 16, 1, 1, 139.00, 0.00, 0.00, 139.00),
(18, 17, 1, 1, 139.00, 0.00, 0.00, 139.00),
(19, 18, 1, 1, 139.00, 0.00, 0.00, 139.00),
(20, 19, 1, 1, 139.00, 0.00, 0.00, 139.00),
(21, 20, 1, 5, 139.00, 0.00, 0.00, 695.00),
(22, 20, 2, 6, 100.00, 0.00, 0.00, 600.00),
(23, 21, 1, 1, 139.00, 0.00, 0.00, 139.00),
(24, 22, 2, 1, 100.00, 0.00, 0.00, 100.00),
(25, 23, 1, 1, 139.00, 0.00, 0.00, 139.00),
(26, 24, 2, 1, 100.00, 0.00, 0.00, 100.00),
(27, 25, 2, 1, 100.00, 0.00, 0.00, 100.00),
(28, 26, 2, 1, 100.00, 0.00, 0.00, 100.00),
(29, 27, 2, 1, 100.00, 0.00, 0.00, 100.00),
(30, 28, 1, 1, 139.00, 0.00, 0.00, 139.00),
(31, 28, 2, 1, 100.00, 0.00, 0.00, 100.00),
(32, 29, 2, 1, 100.00, 0.00, 0.00, 100.00),
(33, 30, 2, 2, 100.00, 0.00, 0.00, 200.00),
(34, 31, 1, 2, 139.00, 0.00, 0.00, 278.00),
(35, 31, 2, 2, 100.00, 0.00, 0.00, 200.00),
(36, 32, 1, 1, 139.00, 0.00, 0.00, 139.00),
(37, 32, 2, 3, 100.00, 0.00, 0.00, 300.00),
(38, 33, 2, 3, 100.00, 0.00, 0.00, 300.00),
(39, 34, 1, 1, 139.00, 0.00, 0.00, 139.00),
(40, 35, 1, 1, 139.00, 0.00, 0.00, 139.00),
(41, 36, 2, 1, 100.00, 0.00, 0.00, 100.00),
(42, 37, 1, 2, 139.00, 0.00, 0.00, 278.00),
(43, 38, 1, 1, 139.00, 0.00, 0.00, 139.00),
(44, 39, 1, 1, 139.00, 0.00, 0.00, 139.00),
(45, 40, 1, 1, 139.00, 0.00, 0.00, 139.00),
(46, 41, 1, 1, 139.00, 0.00, 0.00, 139.00),
(47, 42, 2, 1, 100.00, 0.00, 0.00, 100.00),
(48, 43, 1, 1, 139.00, 0.00, 0.00, 139.00),
(49, 43, 2, 1, 100.00, 0.00, 0.00, 100.00),
(50, 44, 1, 1, 139.00, 0.00, 0.00, 139.00),
(51, 45, 1, 1, 139.00, 0.00, 0.00, 139.00),
(52, 46, 1, 1, 139.00, 0.00, 0.00, 139.00),
(53, 47, 2, 1, 100.00, 0.00, 0.00, 100.00),
(54, 48, 2, 1, 100.00, 0.00, 0.00, 100.00),
(55, 49, 1, 2, 139.00, 0.00, 0.00, 278.00),
(56, 50, 1, 2, 139.00, 0.00, 0.00, 278.00),
(57, 51, 1, 1, 139.00, 0.00, 0.00, 139.00),
(58, 52, 1, 1, 139.00, 0.00, 0.00, 139.00),
(59, 53, 1, 2, 139.00, 0.00, 0.00, 278.00),
(60, 54, 2, 1, 100.00, 0.00, 0.00, 100.00),
(61, 55, 2, 2, 100.00, 0.00, 0.00, 200.00),
(62, 55, 1, 1, 139.00, 0.00, 0.00, 139.00),
(63, 56, 2, 2, 100.00, 0.00, 0.00, 200.00),
(64, 57, 1, 1, 139.00, 0.00, 0.00, 139.00),
(65, 58, 1, 2, 139.00, 0.00, 0.00, 278.00),
(66, 59, 2, 1, 100.00, 0.00, 0.00, 100.00),
(67, 60, 2, 1, 100.00, 0.00, 0.00, 100.00),
(68, 61, 1, 2, 139.00, 0.00, 0.00, 278.00),
(69, 62, 1, 1, 139.00, 0.00, 0.00, 139.00),
(70, 62, 2, 1, 100.00, 0.00, 0.00, 100.00),
(71, 63, 1, 1, 139.00, 0.00, 0.00, 139.00),
(72, 63, 2, 1, 100.00, 0.00, 0.00, 100.00),
(73, 64, 1, 1, 139.00, 0.00, 0.00, 139.00),
(74, 65, 1, 1, 139.00, 0.00, 0.00, 139.00),
(75, 66, 2, 2, 100.00, 0.00, 0.00, 200.00),
(76, 67, 2, 3, 100.00, 0.00, 0.00, 300.00),
(77, 68, 2, 1, 100.00, 0.00, 0.00, 100.00),
(78, 69, 1, 1, 139.00, 0.00, 0.00, 139.00),
(79, 69, 2, 1, 100.00, 0.00, 0.00, 100.00);

-- --------------------------------------------------------

--
-- Table structure for table `stock_movements`
--

CREATE TABLE `stock_movements` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `quantity` int(11) NOT NULL,
  `cost_per_unit` decimal(10,2) NOT NULL,
  `type` enum('in','out','adjust') NOT NULL DEFAULT 'in',
  `reason` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stock_movements`
--

INSERT INTO `stock_movements` (`id`, `product_id`, `quantity`, `cost_per_unit`, `type`, `reason`, `created_at`) VALUES
(1, 2, 52, 35.00, 'adjust', 'Manual Edit by Ampapirak', '2025-11-30 08:10:08'),
(2, 1, 97, 35.00, 'adjust', 'นับผิด (Old: 197 -> New: 100 by Ampapirak)', '2025-11-30 08:10:30');

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
-- Indexes for table `capital_logs`
--
ALTER TABLE `capital_logs`
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
-- Indexes for table `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD PRIMARY KEY (`id`),
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
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=184;

--
-- AUTO_INCREMENT for table `capital_logs`
--
ALTER TABLE `capital_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `expenses`
--
ALTER TABLE `expenses`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=34;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `product_categories`
--
ALTER TABLE `product_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sales`
--
ALTER TABLE `sales`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=70;

--
-- AUTO_INCREMENT for table `sale_details`
--
ALTER TABLE `sale_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=80;

--
-- AUTO_INCREMENT for table `stock_movements`
--
ALTER TABLE `stock_movements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

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

--
-- Constraints for table `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD CONSTRAINT `stock_movements_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
