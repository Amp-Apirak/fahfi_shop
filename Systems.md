# วิเคราะห์ระบบ: Fahfi Shop

## ภาพรวม (Overview)

**Fahfi Shop** คือเว็บแอปพลิเคชันสำหรับการจัดการสต็อกสินค้าและจุดขาย (POS) ระบบถูกออกแบบโดยแยกส่วนการทำงานระหว่าง **Nuxt 3** (Frontend) และ **Node.js (Express)** (Backend) โดยใช้ฐานข้อมูล **MySQL**

## สถาปัตยกรรม (Architecture)

### ส่วนหน้า (Frontend) - `/frontend`

- **Framework**: Nuxt 3 (Vue 3)
- **การตกแต่ง (Styling)**: Bootstrap 5, FontAwesome
- **การจัดการสถานะ/ลอจิก**: Vue Composition API
- **การเชื่อมต่อเครือข่าย**: Axios สำหรับเรียก API
- **ไลบรารีที่สำคัญ**:
  - `sweetalert2`: สำหรับแสดงหน้าต่างแจ้งเตือน
  - `qrcode.vue`: สำหรับสร้าง QR Code
  - `chart.js`: สำหรับแสดงกราฟข้อมูล (อ้างอิงจาก `nuxt.config.ts`)

### ส่วนหลัง (Backend) - `/backend`

- **Runtime**: Node.js
- **Framework**: Express.js
- **ตัวขับเคลื่อนฐานข้อมูล**: `mysql2` (รองรับ Connection Pooling)
- **การยืนยันตัวตน (Authentication)**: JWT (JSON Web Tokens) พร้อม `bcryptjs` สำหรับเข้ารหัสรหัสผ่าน
- **การอัปโหลดไฟล์**: `multer` (เก็บไฟล์ไว้ที่ `public/uploads/`)
- **ความปลอดภัย**: เปิดใช้งาน CORS, มีการเข้ารหัสรหัสผ่าน

### ฐานข้อมูล (Database)

- **ประเภท**: MySQL (Relational)
- **ไฟล์โครงสร้าง**: `fahfi_shop_db.sql` (อยู่ที่โฟลเดอร์หลัก)
- **ตารางที่สำคัญ** (วิเคราะห์จากโค้ด):
  - `users`: เก็บข้อมูลผู้ใช้ รหัสผ่าน และสิทธิ์ (Role)
  - `products`: เก็บข้อมูลสินค้าในสต็อก
  - `expenses`: เก็บข้อมูลรายจ่าย
  - `action_logs`: เก็บประวัติการใช้งานของผู้ใช้
  - `sale_details`: (มีการอ้างอิงถึงในโค้ดลบสินค้า)

## ไฟล์การตั้งค่าที่สำคัญ (Key Configuration Files)

- **Frontend**:
  - `nuxt.config.ts`: ไฟล์ตั้งค่าหลักของ Nuxt รวมการตั้งค่า Bootstrap และ FontAwesome
  - `package.json`: รายชื่อไลบรารีที่ต้องใช้ และคำสั่ง (`dev`, `build`)
- **Backend**:
  - `index.js`: จุดเริ่มต้นของระบบ, กำหนด API Routes และการเชื่อมต่อฐานข้อมูล
  - `.env`: ตัวแปรสภาพแวดล้อม (รหัสผ่านฐานข้อมูล, คีย์ลับ JWT)

## โครงสร้าง API (API Structure)

Backend ให้บริการ RESTful API ที่ `http://localhost:3001` (ค่าเริ่มต้น)

- **Auth**: `/api/register`, `/api/login`
- **Products**: `GET`, `POST`, `PUT`, `DELETE` `/api/products`
- **Expenses**: `GET`, `POST`, `PUT`, `DELETE` `/api/expenses`
- **Upload**: `POST` `/api/upload`

## ความต้องการสำหรับการติดตั้ง (Deployment Requirements)

- **Node.js**: จำเป็นสำหรับทั้งการ Build และการรันระบบ
- **MySQL**: สามารถใช้ MySQL ที่มากับ XAMPP ได้เลย
- **Reverse Proxy**: แนะนำให้ใช้ Apache (ของ XAMPP) เพื่อส่งต่อ Traffic ไปยังแอปพลิเคชัน (Port 80/443)
