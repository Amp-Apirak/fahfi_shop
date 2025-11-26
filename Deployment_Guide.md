# คู่มือการติดตั้ง: Fahfi Shop บน Windows 10 (XAMPP)

คู่มือนี้จะอธิบายขั้นตอนการนำ **Fahfi Shop** (Nuxt 3 + Node.js) ขึ้นใช้งานจริงบนเครื่อง Windows 10 VM ของคุณที่มี XAMPP ติดตั้งอยู่แล้ว

## คำแนะนำ (Recommendation)

เนื่องจากคุณมี XAMPP และโปรเจกต์ PHP อื่นๆ รันอยู่แล้ว **วิธีที่ง่ายและเสถียรที่สุด** คือการรัน Node.js แบบ Native ควบคู่ไปกับ XAMPP

- **ทำไม?**: การใช้ Docker บน Windows อาจมีปัญหาเรื่อง Port ชนกับ XAMPP หรือกินทรัพยากรเครื่องมากเกินไปสำหรับ VM ขนาดเล็ก การรัน Node.js โดยตรงจะเบากว่าและเชื่อมต่อกับ MySQL เดิมได้ง่ายที่สุด

---

## สิ่งที่ต้องเตรียม (Prerequisites)

1.  **Node.js**: ดาวน์โหลดและติดตั้งเวอร์ชัน "LTS" จาก [nodejs.org](https://nodejs.org/)
2.  **Git**: (น่าจะมีอยู่แล้วถ้าคุณดึงโค้ดมาได้)
3.  **PM2**: โปรแกรมสำหรับช่วยรัน Node.js ให้ทำงานตลอดเวลา (แม้เครื่องจะรีสตาร์ท)
    - เปิด PowerShell (คลิกขวา Run as Administrator) แล้วพิมพ์คำสั่ง:
      ```powershell
      npm install -g pm2
      npm install -g pm2-windows-startup
      pm2-startup install
      ```

---

## ขั้นตอนที่ 1: การตั้งค่าฐานข้อมูล (Database Setup)

1.  เปิด **phpMyAdmin** (`http://localhost/phpmyadmin`)
2.  สร้างฐานข้อมูลใหม่ชื่อ `fahfi_shop_db` (หรือชื่ออื่นที่คุณต้องการ)
3.  นำเข้า (Import) ไฟล์ `fahfi_shop_db.sql` ที่อยู่ในโฟลเดอร์หลักของโปรเจกต์

---

## ขั้นตอนที่ 2: การตั้งค่า Backend

1.  เปิด PowerShell และเข้าไปที่โฟลเดอร์ backend:
    ```powershell
    cd C:\fahfi_shop\backend
    ```
2.  ติดตั้งไลบรารีต่างๆ:
    ```powershell
    npm install
    ```
3.  ตั้งค่าตัวแปรสภาพแวดล้อม (Environment Variables):
    - สร้างไฟล์ชื่อ `.env` ในโฟลเดอร์ `backend` (ถ้ายังไม่มี)
    - ใส่ข้อมูลตามนี้ (แก้รหัสผ่านให้ตรงกับของคุณ):
      ```env
      PORT=3001
      DB_HOST=localhost
      DB_USER=root
      DB_PASSWORD=
      DB_DATABASE=fahfi_shop_db
      JWT_SECRET=your_secret_key_change_this
      ```
4.  เริ่มรัน Backend ด้วย PM2:
    ```powershell
    pm2 start index.js --name "fahfi-backend"
    ```
5.  บันทึกสถานะโปรเซส:
    ```powershell
    pm2 save
    ```

---

## ขั้นตอนที่ 3: การตั้งค่า Frontend (Nuxt 3)

1.  เข้าไปที่โฟลเดอร์ frontend:
    ```powershell
    cd C:\fahfi_shop\frontend
    ```
2.  ติดตั้งไลบรารีต่างๆ:
    ```powershell
    npm install
    ```
3.  สร้างไฟล์สำหรับใช้งานจริง (Build):
    ```powershell
    npm run build
    ```
    _(ขั้นตอนนี้จะสร้างโฟลเดอร์ `.output` ขึ้นมา)_
4.  เริ่มรัน Frontend ด้วย PM2:
    ```powershell
    pm2 start .output/server/index.mjs --name "fahfi-frontend"
    ```
    _(โดยปกติจะรันที่ Port 3000)_
5.  บันทึกสถานะโปรเซส:
    ```powershell
    pm2 save
    ```

---

## ขั้นตอนที่ 4: เชื่อมต่อโดเมน (Apache Reverse Proxy)

คุณมีโดเมน `http://iss.pointit.co.th/` ชี้มาที่เครื่องนี้แล้ว เราต้องบอกให้ Apache (ของ XAMPP) ส่งต่อคนเข้าเว็บไปยัง Nuxt App ของเรา (ที่ Port 3000)

1.  เปิด **XAMPP Control Panel**
2.  คลิกปุ่ม **Config** ที่แถว Apache -> เลือก **httpd.conf**
    - ตรวจสอบว่าบรรทัดเหล่านี้ **ไม่มี** เครื่องหมาย `#` อยู่ข้างหน้า:
      ```apache
      LoadModule proxy_module modules/mod_proxy.so
      LoadModule proxy_http_module modules/mod_proxy_http.so
      ```

## การตรวจสอบ (Verification)

1.  เปิด `http://iss.pointit.co.th/` ในเบราว์เซอร์
2.  คุณควรจะเห็นหน้าเว็บ Nuxt ของคุณแสดงขึ้นมา
3.  ลองเข้าสู่ระบบ หรือดึงข้อมูลสินค้า เพื่อดูว่าเชื่อมต่อกับ Backend ได้ถูกต้องหรือไม่

---

## ทางเลือกอื่น: Docker (ไม่แนะนำสำหรับเคสนี้)

ถ้าคุณต้องการใช้ Docker จริงๆ:

1.  ต้องติดตั้ง Docker Desktop for Windows
2.  ต้องสร้าง `Dockerfile` สำหรับ Backend และ Frontend
3.  ต้องสร้าง `docker-compose.yml` เพื่อสั่งรันทั้งคู่
4.  **ความยาก**: การเชื่อมต่อจาก Docker ไปหา MySQL ของ XAMPP ต้องใช้ `host.docker.internal` และอาจมีการตั้งค่า Firewall เพิ่มเติม
5.  **ทำไมถึงไม่แนะนำ**: มันเพิ่มความซับซ้อนโดยไม่จำเป็น และ Docker Desktop กินแรมค่อนข้างเยอะ ซึ่งอาจทำให้ VM ของคุณช้าลงได้ถ้าทรัพยากรจำกัด
