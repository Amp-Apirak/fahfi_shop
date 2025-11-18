# 🎨 Frontend Layout Update - Fahfi Shop

## 📌 ภาพรวม

ระบบ Fahfi Shop ได้ถูกอัปเดตด้วย **Modern Header & Sidebar Navigation** ที่สวยงาม มี:

✅ **Header ที่เรียบหรู** - Gradient Purple Blue สไตล์ Modern
✅ **Logo & Brand** - แสดงโลโก้ระบบและชื่อร้าน
✅ **Sidebar Navigation** - เมนูสามารถ Toggle ได้
✅ **Responsive Design** - รองรับทุกขนาดหน้าจอ
✅ **Font Awesome Icons** - ไอคอนที่สวยงาม
✅ **Active Route Indicator** - แสดงหน้าที่กำลังเรียกใช้

---

## 🎯 Features ที่เพิ่มเข้ามา

### 1️⃣ Header (ส่วนบนสุด)
- **Gradient Background**: สีม่วง-น้ำเงินที่เรียบหรู
- **Logo Icon**: ไอคอนกระเป๋าช้อปปิ้ง
- **Brand Name**: "Fahfi Shop" + "ระบบจัดการร้านเสื้อผ้า"
- **Sidebar Toggle**: ปุ่มเปิด/ปิดเมนู (บนมือถือ)
- **User Info**: ชื่อผู้ใช้ + Badge (Admin/Staff)
- **Logout Button**: ปุ่มออกจากระบบ

### 2️⃣ Sidebar Navigation (ด้านซ้าย)
```
Dashboard           → หน้าแรก
POS (หน้าขาย)       → ระบบขายสินค้า
จัดการสินค้า        → CRUD Products

┌─ จัดการระบบ (Admin Only)
├─ จัดการรายจ่าย   → CRUD Expenses
├─ ประวัติการขาย   → Sales History
└─ จัดการผู้ใช้     → User Management

ตั้งค่า             → Settings (Future)
```

### 3️⃣ Responsive Behavior
| หน้าจอ | พฤติกรรม |
|--------|----------|
| **Desktop (> 768px)** | Sidebar แสดงเต็ม + Text Visible |
| **Tablet (768px)** | Sidebar Fixed Overlay + Toggle |
| **Mobile (< 576px)** | Sidebar Hidden + Toggle Button |

---

## 📁 ไฟล์ที่แก้ไข

### 1. **frontend/app/layouts/default.vue** (แก้ไข)
- ✅ สร้าง Header Component ใหม่
- ✅ สร้าง Sidebar Component ใหม่
- ✅ เพิ่ม Toggle Functionality
- ✅ CSS Styling ที่สวยงาม
- ✅ Responsive Design

### 2. **frontend/nuxt.config.ts** (แก้ไข)
- ✅ เพิ่ม Font Awesome CSS

---

## 🎨 Design Details

### Color Scheme
```
Header Gradient:    #667eea → #764ba2 (Purple → Blue)
Primary Color:      #667eea (Purple)
Background:         #f5f5f5 (Light Gray)
Text Color:         #333 (Dark Gray)
Accent:             #ffc107 (Gold - Admin Badge)
```

### Typography
```
Header Title:       1.5rem, Bold, White
Sidebar Items:      0.95rem, Regular, Dark Gray
Active Item:        0.95rem, SemiBold, Purple
Icon Size:          1.2rem, Purple
```

### Spacing & Layout
```
Header Padding:     0.75rem
Sidebar Width:      260px (Full), 70px (Collapsed)
Content Padding:    2rem (Desktop), 1rem (Mobile)
Gap between items:  1rem
```

---

## 🚀 วิธีการใช้งาน

### ✅ ติดตั้งระบบ

1. **ติดตั้ง Font Awesome** (ถ้ายังไม่มี)
   ```bash
   cd frontend
   npm install @fortawesome/fontawesome-free --save
   ```

2. **รัน Development Server**
   ```bash
   npm run dev
   ```

3. **เข้าสู่ระบบ**
   - ใช้ฟอร์ม Login
   - Header และ Sidebar จะแสดงอัตโนมัติ

### 🔄 Toggle Sidebar

- **Desktop**: Sidebar แสดงเต็มเวลา
- **Mobile**: คลิกไอคอน ☰ (Hamburger Menu) เพื่อเปิด/ปิด
- **Auto Collapse**: Sidebar collapse ให้แสดงเฉพาะไอคอน

---

## 🎯 Navigation Structure

### Menu Items

#### Untuk Semua Users
```
🏠 Dashboard         → /
💰 POS              → /pos
📦 จัดการสินค้า      → /products
```

#### Untuk Admin Only
```
📝 จัดการรายจ่าย    → /expenses
📊 ประวัติการขาย    → /sales-history
👥 จัดการผู้ใช้     → /users (Future)
⚙️ ตั้งค่า          → /settings (Future)
```

### Active Route Indicator
- Sidebar item ที่ active จะมี:
  - Background ม่วงอ่อน
  - Text สีม่วง
  - Border ด้านซ้ายสีม่วง
  - Font Bold

---

## 📱 Responsive Breakpoints

### Desktop (> 768px)
```
┌─────────────────────────────────┐
│ Header (Purple Gradient)        │
├─────────┬─────────────────────┤
│ Sidebar │  Content Area       │
│ (260px) │  (Rest of space)    │
│         │                     │
│         │                     │
└─────────┴─────────────────────┘
```

### Tablet (768px)
```
┌─────────────────────────────────┐
│ Header (Purple Gradient)        │
├─────────┬─────────────────────┤
│Sidebar  │  Content Area       │
│(Fixed   │  (Adjusts to full)  │
│Overlay) │                     │
└─────────┴─────────────────────┘
```

### Mobile (< 576px)
```
┌─────────────────────────────────┐
│ ☰ Header (Purple Gradient)      │
├─────────────────────────────────┤
│ Content Area                    │
│ (Sidebar Hidden by Default)     │
│                                 │
│ [Tap ☰ to Show Sidebar]         │
└─────────────────────────────────┘
```

---

## 🎮 Interactive Features

### Sidebar Toggle
```javascript
// Toggle button in header
<button @click="toggleSidebar">
  <i class="fas fa-bars"></i>
</button>

// Sidebar state
const sidebarOpen = ref(true);

// Toggle function
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};
```

### Active Route Detection
```javascript
// Detect current route
const isActive = (path) => {
  return useRoute().path === path;
};

// Use in template
:class="{ active: isActive('/pos') }"
```

### User Role Badge
```
Admin:  🟡 Orange Badge "ADMIN"
Staff:  ⚪ White Badge "STAFF"
```

---

## 💾 CSS Classes

### Main Classes
```css
.fahfi-layout              /* Root container */
.fahfi-header             /* Header */
.fahfi-sidebar            /* Sidebar */
.fahfi-content            /* Content area */
.fahfi-main-container     /* Main flex container */

.sidebar-toggle           /* Toggle button */
.brand-section            /* Logo & brand */
.nav-item                 /* Menu items */
.nav-item.active          /* Active menu item */
```

### Responsive Classes
```css
/* Mobile specific */
@media (max-width: 768px) {
  .sidebar-toggle { display: block; }
  .fahfi-sidebar.sidebar-collapsed {
    transform: translateX(-100%);
  }
}
```

---

## 🔒 Security Features

✅ Navigation เสมือนว่า protected ด้วย `v-if="isLoggedIn"`
✅ Admin-only items ใช้ `v-if="isAdmin"`
✅ Logout button ใช้ useAuth composable
✅ User information แสดงจาก Auth store

---

## 📊 Browser Support

| Browser | Support |
|---------|---------|
| Chrome | ✅ Full |
| Firefox | ✅ Full |
| Safari | ✅ Full |
| Edge | ✅ Full |
| Mobile Browsers | ✅ Full |
| IE 11 | ⚠️ Limited |

---

## 🎓 Component Structure

```vue
<template>
  <div class="fahfi-layout">
    <!-- Header Component -->
    <header class="fahfi-header">
      <!-- Sidebar Toggle -->
      <button class="sidebar-toggle"></button>

      <!-- Logo & Brand -->
      <NuxtLink class="brand-section"></NuxtLink>

      <!-- User Info & Logout -->
      <div class="header-right"></div>
    </header>

    <!-- Main Container -->
    <div class="fahfi-main-container">
      <!-- Sidebar Component -->
      <aside class="fahfi-sidebar">
        <nav class="sidebar-nav">
          <!-- Navigation Items -->
        </nav>
      </aside>

      <!-- Content Area -->
      <main class="fahfi-content">
        <slot /> <!-- Page content -->
      </main>
    </div>
  </div>
</template>
```

---

## 🔧 Customization

### เปลี่ยน Colors
ค้นหา `.fahfi-header` CSS และแก้ไข `background` property

### เปลี่ยน Sidebar Width
ค้นหา `.fahfi-sidebar` และแก้ไข `width: 260px`

### เปลี่ยน Logo Icon
ค้นหา `<i class="fas fa-shopping-bag"></i>` และเปลี่ยน icon

### เพิ่ม Menu Items
เพิ่ม `<NuxtLink>` element ใหม่ใน `.sidebar-nav`

---

## 🐛 Troubleshooting

### Sidebar ไม่แสดง Icons
- ตรวจสอบว่า Font Awesome ได้ติดตั้งหรือไม่
- ตรวจสอบ nuxt.config.ts มี Font Awesome CSS ไหม

### Header ไม่สวยงาม
- Clear browser cache
- Rebuild: `npm run build`

### Mobile Sidebar ไม่ toggle
- ตรวจสอบ Vue ref `sidebarOpen` ทำงานหรือไม่
- Inspect browser console สำหรับ JavaScript errors

---

## 📝 ที่จะเพิ่มในอนาคต

- [ ] Settings page `/settings`
- [ ] User Management page `/users`
- [ ] Dark mode toggle
- [ ] Theme customization
- [ ] Notification bell
- [ ] Search functionality
- [ ] User profile dropdown

---

## ✅ Checklist

- [✓] Header ออกแบบใหม่
- [✓] Sidebar สวยงาม
- [✓] Toggle functionality
- [✓] Responsive design
- [✓] Font Awesome icons
- [✓] Active route indicator
- [✓] Admin-only menu items
- [✓] Mobile optimization

---

## 📞 Support

ถ้ามีปัญหา:
1. ตรวจสอบ console สำหรับ JavaScript errors
2. ตรวจสอบว่า Font Awesome ติดตั้งแล้วหรือไม่
3. Clear cache และ reload page
4. Rebuild frontend: `npm run build`

---

**🎉 Layout ใหม่พร้อมใช้แล้ว!**

ลองเข้าสู่ระบบและชมความสวยงามของ Header & Sidebar ใหม่! 🚀
