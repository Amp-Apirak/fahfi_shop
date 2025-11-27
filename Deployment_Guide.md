# Deployment Guide – Fahfi Shop (Windows 10 + XAMPP + PM2)

คู่มือนี้รวบรวมวิธีติดตั้งและสิ่งที่ต้องระวังจากเคสที่เจอจริง ทั้งฝั่ง Backend (Node.js), Frontend (Nuxt 3) และการ Reverse Proxy ด้วย Apache/XAMPP บน Windows รวมถึงการเรียก API ด้วย Postman

## 1) สิ่งที่ต้องเตรียม
- Windows 10
- XAMPP ติดตั้ง Apache + MySQL (MariaDB)
- Node.js LTS + npm
- PM2 และ pm2-windows-startup (สำหรับรัน Node เป็น service)
- โค้ดโปรเจ็กต์ใน `C:\fahfi_shop`

## 2) ติดตั้งเครื่องมือพื้นฐาน
1. ติดตั้ง Node.js จาก https://nodejs.org เลือก LTS
2. ติดตั้ง Git (ถ้าต้องการ)
3. เปิด PowerShell (Run as Administrator) แล้วติดตั้ง PM2:
   ```powershell
   npm install -g pm2 pm2-windows-startup
   pm2-startup install
   ```
   - หากติด Error ว่า script ถูกบล็อก ให้รัน:
     ```powershell
     Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
     ```

## 3) เตรียมฐานข้อมูล
1. เปิด phpMyAdmin (`http://localhost/phpmyadmin`)
2. สร้างฐาน `fahfi_shop_db`
3. Import ไฟล์ `fahfi_shop_db.sql` (อยู่ใน `C:\fahfi_shop`)
4. สร้าง user DB ให้ตรงกับ `.env` (แนะนำไม่ใช้ root) เช่น:
   - user: `fahfi_user`
   - password: `<รหัสที่ตั้ง>`
   - สิทธิ์: ALL PRIVILEGES บนฐาน `fahfi_shop_db`

## 4) ตั้งค่า Backend (Node.js/Express)
ไฟล์หลัก: `backend/`

1. สร้าง/แก้ไฟล์ `backend/.env` (ตัวอย่าง):
   ```
   PORT=3001
   DB_HOST=localhost
   DB_USER=fahfi_user        # หรือ root ถ้าใช้
   DB_PASSWORD=<รหัสตามจริง>
   DB_DATABASE=fahfi_shop_db
   JWT_SECRET=fahfi_shop_secret_key_2024
   ```
2. ติดตั้ง dependency (ทำในโฟลเดอร์ `backend`):
   ```powershell
   cd C:\fahfi_shop\backend
   npm install
   ```
3. รันทดสอบ (development):
   ```powershell
   node index.js
   ```
   ถ้าเชื่อม DB ไม่ได้ ให้ตรวจสอบรหัสผ่าน/สิทธิ์ user (Error: Access denied for user)
4. รันด้วย PM2 (production):
   ```powershell
   pm2 start index.js --name "fahfi-backend"
   pm2 save
   ```

## 5) ตั้งค่า Frontend (Nuxt 3)
ไฟล์หลัก: `frontend/` (ต้องใช้ URL แบบ relative `/api/...` เพื่อผ่าน Apache proxy)

1. ติดตั้ง dependency:
   ```powershell
   cd C:\fahfi_shop\frontend
   npm install
   ```
2. Build:
   ```powershell
   npm run build
   ```
   ผลลัพธ์อยู่ที่ `.output/server/index.mjs`
3. รันด้วย PM2:
   ```powershell
   pm2 start .output/server/index.mjs --name "fahfi-frontend"
   pm2 save
   ```
4. ค่า `app.baseURL` ใน `nuxt.config.ts` ถูกตั้งเป็น `/fahfishop/` (หากต้องเปลี่ยน path ให้ build ใหม่)
5. ตรวจสอบว่าโค้ด frontend เรียก API ด้วย path `/api/...` (ได้แก้แล้วทุกไฟล์หลัก: login, pos, products, sales-history, expenses, index)

## 6) Apache Reverse Proxy (XAMPP)
เป้าหมาย: ให้ `http://iss.pointit.co.th/` ชี้ Nuxt (พอร์ต 3000) และ `/api` ชี้ backend (พอร์ต 3001) พร้อมกันกับเว็บ PHP เดิม `/sales`

1. เปิดใช้โมดูล proxy (ไฟล์ `C:\xampp\apache\conf\httpd.conf`)
   - เอา `#` ออกหน้าบรรทัด:
     ```
     LoadModule proxy_module modules/mod_proxy.so
     LoadModule proxy_http_module modules/mod_proxy_http.so
     LoadModule proxy_wstunnel_module modules/mod_proxy_wstunnel.so
     ```
   - ตรวจว่า `Include conf/extra/httpd-vhosts.conf` ไม่ถูกคอมเมนต์
2. เพิ่ม VirtualHost ใน `C:\xampp\apache\conf\extra\httpd-vhosts.conf`:
   ```apache
   <VirtualHost *:80>
       ServerName iss.pointit.co.th
       DocumentRoot "C:/xampp/htdocs"

       ProxyPreserveHost On
       ProxyRequests Off

       # กันไม่ให้ /sales ถูก proxy (เว็บ PHP เก่า)
       ProxyPass /sales !
       Alias /sales "C:/xampp/htdocs/sales/"
       <Directory "C:/xampp/htdocs/sales/">
           Options Indexes FollowSymLinks
           AllowOverride All
           Require all granted
       </Directory>

       # API -> Backend (3001)
       ProxyPass /api http://localhost:3001/api
       ProxyPassReverse /api http://localhost:3001/api

       # ส่วนที่เหลือ -> Frontend (Nuxt, 3000)
       ProxyPass / http://localhost:3000/
       ProxyPassReverse / http://localhost:3000/

       ErrorLog "logs/iss-error.log"
       CustomLog "logs/iss-access.log" common
   </VirtualHost>
   ```
   - ถ้ามี VirtualHost อื่นที่ดัก *:80 ให้ย้ายบล็อกนี้ไว้บนสุด หรือคอมเมนต์บล็อกเดิมเพื่อไม่ให้ชน
3. Restart Apache จาก XAMPP Control Panel (Stop → Start ใหม่)
4. ทดสอบ:
   - `http://iss.pointit.co.th/` ควรเป็นหน้า Nuxt
   - `http://iss.pointit.co.th/api/login` ควรเข้าถึง API
   - `http://iss.pointit.co.th/sales` ควรเข้าเว็บ PHP เดิม

## 7) การใช้ Postman
ไฟล์คอลเลกชัน: `C:\fahfi_shop\fahfi_shop_postman_collection_v2.json`

1. Import ไฟล์คอลเลกชันใน Postman
2. ตั้ง Environment ตัวแปร `baseUrl`:
   - ถ้าใช้ผ่าน Apache: `http://iss.pointit.co.th`
   - ถ้าเรียกตรง backend: `http://localhost:3001`
3. Request Path ให้ใช้ `/api/...` (อย่าเติม `/api` ซ้ำถ้า baseUrl มีแล้ว)
4. ลำดับทดสอบ:
   - `POST {{baseUrl}}/api/register` สร้าง user
   - `POST {{baseUrl}}/api/login` รับ token
   - นำ token ไปใส่ Authorization แบบ Bearer ใน request อื่น

## 8) ปัญหาที่เจอบ่อยและวิธีแก้
- **ฐานข้อมูล Access denied for user**: ตรวจรหัสผ่าน/สิทธิ์ใน `.env` ให้ตรงกับ MySQL user; restart PM2 backend หลังแก้
- **หน้าเว็บเข้าไม่ได้ โผล่ XAMPP**: VirtualHost/Proxy ไม่ทำงานหรือบล็อกโดนบล็อกอื่น ต้องเปิด mod_proxy + httpd-vhosts และตั้งบล็อกให้ถูก
- **/sales หาย**: ต้องใส่ `ProxyPass /sales !` และ Alias/Directory เพื่อกันไม่ให้ถูก proxy ไป Nuxt/Node
- **API 404 /api/api/**: baseUrl หรือ path ซ้ำ `/api`; แก้ baseUrl เป็นโดเมนเปล่า แล้ว path เป็น `/api/...`
- **Frontend CORS/ERR_CONNECTION_REFUSED**: ถ้าเรียก `http://localhost:3001` จากหน้าโดเมนจะถูก block ให้ใช้ path relative `/api/...` ผ่าน Apache
- **PM2 ไม่ขึ้น**: ตรวจ PATH (`where pm2`) หรือเรียกเต็ม path เช่น `"C:\Users\<user>\AppData\Roaming\npm\pm2.cmd"`
- **ลืมรีโหลดหลังแก้**: ทุกครั้งที่แก้ `.env` หรือ build frontend ให้ `pm2 restart <name>` และ `pm2 save`

## 9) สรุปลำดับติดตั้งสั้น ๆ
1. ติดตั้ง Node.js, XAMPP, PM2
2. Import DB `fahfi_shop_db.sql`, สร้าง user DB และแก้ `.env`
3. `npm install` ใน backend แล้ว `pm2 start index.js --name fahfi-backend`
4. `npm install && npm run build` ใน frontend แล้ว `pm2 start .output/server/index.mjs --name fahfi-frontend`
5. แก้ Apache: เปิด mod_proxy, เปิด httpd-vhosts, ใส่ VirtualHost ตามข้อ 6
6. Restart Apache, pm2 save, ทดสอบเว็บ + Postman `/api/login`

## 10) คำสั่งบำรุงรักษา
- ดู log backend: `pm2 logs fahfi-backend`
- รีสตาร์ท: `pm2 restart fahfi-backend` หรือ `pm2 restart fahfi-frontend`
- เซฟรายการโปรเซส: `pm2 save`
- ลบโปรเซส: `pm2 delete <name>`
