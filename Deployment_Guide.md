# Deployment Guide – Fahfi Shop (Windows 10 + XAMPP + PM2)

คำแนะนำนี้สรุปขั้นตอนติดตั้ง/ดีพลอยและข้อควรระวังที่พบจากการทำจริง ทั้ง Backend (Node.js/Express), Frontend (Nuxt 3), Apache Reverse Proxy (XAMPP), การใช้ Postman และการรักษาความปลอดภัยฐานข้อมูล

## 1) สิ่งที่ต้องเตรียม

- Windows 10
- XAMPP ติดตั้ง Apache + MySQL (MariaDB)
- Node.js LTS + npm
- PM2 และ pm2-windows-startup (สำหรับรัน Node เป็น service)
- โค้ดโปรเจ็กต์ใน `C:\fahfi_shop`

## 2) ติดตั้งเครื่องมือพื้นฐาน

1. ติดตั้ง Node.js จาก https://nodejs.org เลือก LTS
2. (ถ้าต้องใช้ Git) ติดตั้ง Git
3. เปิด PowerShell (Run as Administrator) แล้วติดตั้ง PM2:
   ```powershell
   npm install -g pm2 pm2-windows-startup
   pm2-startup install
   ```
   - ถ้าติด Error เรื่อง execution policy ให้รัน:
     ```powershell
     Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
     ```

## 3) เตรียมฐานข้อมูล

1. เปิด phpMyAdmin (`http://localhost/phpmyadmin`)
2. สร้างฐาน `fahfi_shop_db`
3. Import `C:\fahfi_shop\fahfi_shop_db.sql`
4. สร้าง user DB (แนะนำไม่ใช้ root):
   - user: `fahfi_user`
   - password: `<รหัสที่ตั้ง>`
   - สิทธิ์: ALL PRIVILEGES บนฐาน `fahfi_shop_db`

## 4) ตั้งค่า Backend (Node.js/Express) – โฟลเดอร์ `backend/`

1. สร้าง/แก้ไฟล์ `backend/.env` ตัวอย่าง:
   ```
   PORT=3001
   DB_HOST=localhost
   DB_USER=fahfi_user
   DB_PASSWORD=<รหัสจริง>
   DB_DATABASE=fahfi_shop_db
   JWT_SECRET=fahfi_shop_secret_key_2024
   ```
2. ติดตั้ง dependency:
   ```powershell
   cd C:\fahfi_shop\backend
   npm install
   ```
3. รันทดสอบ dev:
   ```powershell
   node index.js
   ```
   - ถ้า Error: `Access denied for user` ให้ตรวจ user/password/สิทธิ์ DB
4. รัน production ด้วย PM2:
   ```powershell
   pm2 start index.js --name "fahfi-backend"
   pm2 save
   ```

## 5) ตั้งค่า Frontend (Nuxt 3) – โฟลเดอร์ `frontend/`

โค้ดเรียก API แบบ relative `/api/...` แล้ว เพื่อให้ผ่าน Apache proxy

1. ติดตั้ง dependency:
   ```powershell
   cd C:\fahfi_shop\frontend
   npm install
   ```
2. Build:
   ```powershell
   npm run build
   ```
   ไฟล์รันอยู่ที่ `.output/server/index.mjs`
3. รันด้วย PM2:
   ```powershell
   pm2 start .output/server/index.mjs --name "fahfi-frontend"
   pm2 save
   ```
4. `app.baseURL` ใน `nuxt.config.ts` ตั้งเป็น `/fahfishop/` (ถ้าจะเปลี่ยน path ให้ build ใหม่)
5. หน้า login/pos/products/sales-history/expenses/index เรียก API ด้วย `/api/...` แล้ว

## 6) Apache Reverse Proxy (XAMPP)

เป้าหมาย: `http://iss.pointit.co.th/` → Nuxt (3000) และ `/api` → Backend (3001) พร้อมใช้งานเว็บ PHP เดิม `/sales`

1. เปิดโมดูล proxy ใน `C:\xampp\apache\conf\httpd.conf` (เอา # ออก):
   ```
   LoadModule proxy_module modules/mod_proxy.so
   LoadModule proxy_http_module modules/mod_proxy_http.so
   LoadModule proxy_wstunnel_module modules/mod_proxy_wstunnel.so
   ```
   และตรวจว่า `Include conf/extra/httpd-vhosts.conf` ไม่ถูกคอมเมนต์
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
       
       # ไม่ให้ /phpmyadmin .proxy ไปยัง phpMyAdmin
           ProxyPass /phpmyadmin !
    Alias /phpmyadmin "C:/xampp/phpMyAdmin/"
    <Directory "C:/xampp/phpMyAdmin/">
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>


       # API -> Backend (3001)
       ProxyPass /api http://localhost:3001/api
       ProxyPassReverse /api http://localhost:3001/api

       # ส่วนที่เหลือ -> Frontend (Nuxt, 3000)
       # แก้ไข: ให้เข้าผ่าน /fahfishop เท่านั้น (ไม่เข้าผ่าน root /)
       ProxyPass /fahfishop http://localhost:3000/fahfishop
       ProxyPassReverse /fahfishop http://localhost:3000/fahfishop

       ErrorLog "logs/iss-error.log"
       CustomLog "logs/iss-access.log" common
   </VirtualHost>
   ```

   - ถ้ามี VirtualHost อื่นดัก \*:80 ให้ย้ายบล็อกนี้ไว้บนสุดหรือคอมเมนต์ตัวอื่น

3. Restart Apache จาก XAMPP Control Panel (Stop → Start)
4. ทดสอบ:
   - `http://iss.pointit.co.th/` → หน้า Nuxt
   - `http://iss.pointit.co.th/api/login` → API
   - `http://iss.pointit.co.th/sales` → เว็บ PHP เดิม

## 7) ใช้ Postman

ไฟล์คอลเลกชัน: `C:\fahfi_shop\fahfi_shop_postman_collection_v2.json`

1. Import ไฟล์คอลเลกชันใน Postman
2. ตั้ง Environment ตัวแปร `baseUrl`:
   - ผ่าน Apache: `http://iss.pointit.co.th`
   - ตรง backend: `http://localhost:3001`
3. Path ใช้ `/api/...` (อย่าใส่ /api ซ้ำถ้า baseUrl มีแล้ว)
4. ลำดับทดสอบ:
   - `POST {{baseUrl}}/api/register` สร้าง user
   - `POST {{baseUrl}}/api/login` รับ token
   - ใส่ token แบบ Bearer ในคำขออื่น

## 8) ปัญหาที่เจอบ่อยและวิธีแก้

- DB Access denied: ตรวจ user/password/สิทธิ์ใน `.env` ให้ตรงกับ MySQL user แล้ว `pm2 restart fahfi-backend`
- หน้าเว็บเป็น XAMPP: VirtualHost/Proxy ไม่ทำงาน เปิด mod_proxy + httpd-vhosts และตั้งบล็อกให้ถูกต้อง
- /sales หาย: ใส่ `ProxyPass /sales !` + Alias/Directory เพื่อกัน proxy ไป Nuxt/Node
- API 404 `/api/api`: baseUrl หรือ path ซ้ำ `/api`; ให้ baseUrl เป็นโดเมนเปล่า แล้ว path `/api/...`
- Frontend CORS/ERR_CONNECTION_REFUSED: ใช้ path relative `/api/...` แทนการชี้ `http://localhost:3001` จากหน้าเว็บที่โดเมนอื่น
- PM2 ไม่เจอคำสั่ง: เช็ก PATH (`where pm2`) หรือเรียกด้วย path เต็ม `"C:\Users\<user>\AppData\Roaming\npm\pm2.cmd"`
- ลืมรีโหลดหลังแก้: แก้ `.env` หรือ build frontend แล้วต้อง `pm2 restart <name>` และ `pm2 save`

## 9) ลำดับติดตั้งสั้น ๆ

1. ติดตั้ง Node.js, XAMPP, PM2
2. Import DB, สร้าง user DB, แก้ `.env`
3. `npm install` ที่ backend → `pm2 start index.js --name fahfi-backend`
4. `npm install && npm run build` ที่ frontend → `pm2 start .output/server/index.mjs --name fahfi-frontend`
5. เปิด mod_proxy, httpd-vhosts, ใส่ VirtualHost ตามข้อ 6
6. Restart Apache, `pm2 save`, ทดสอบ `/api/login`

## 10) คำสั่งบำรุงรักษา

- ดู log backend: `pm2 logs fahfi-backend`
- รีสตาร์ท: `pm2 restart fahfi-backend` หรือ `pm2 restart fahfi-frontend`
- เซฟ process list: `pm2 save`
- ลบโปรเซส: `pm2 delete <name>`

## 11) ความปลอดภัยฐานข้อมูล/phpMyAdmin (เข้าภายในเท่านั้น)

- MySQL bind เฉพาะเครื่องนี้: เปิด `C:\xampp\mysql\bin\my.ini` ในส่วน `[mysqld]` ใส่ `bind-address=127.0.0.1` แล้วรีสตาร์ท MySQL
- ไม่เปิด phpMyAdmin ผ่านโดเมน: อย่า ProxyPass `/phpmyadmin`; ใช้เฉพาะ `http://localhost/phpmyadmin` หรือ `127.0.0.1/phpmyadmin` (ถ้าจำเป็นค่อย VPN/RDP เข้ามา)
- Firewall/Router: อย่า forward หรือ allow พอร์ต 3306 จากอินเทอร์เน็ต; บล็อก inbound 3306 จาก public
- User MySQL: ใช้บัญชีแบบ `@localhost` เท่านั้น ไม่ให้สิทธิ์ `@%`; ลบบัญชีที่ไม่จำเป็น
- VirtualHost: Proxy เฉพาะ `/api` และหน้าเว็บหลัก ไม่เปิด `/dashboard` หรือ `/phpmyadmin` ออกสาธารณะ
