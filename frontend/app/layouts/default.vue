<template>
  <div class="fahfi-layout">
    <!-- Header -->
    <header v-if="isLoggedIn" class="fahfi-header">
      <div class="header-container">
        <!-- Toggle Sidebar Button -->
        <button class="sidebar-toggle" @click="toggleSidebar" title="เปิด/ปิด เมนู">
          <i class="fas fa-bars"></i>
        </button>

        <!-- Logo & Brand -->
        <NuxtLink to="/" class="brand-section">
          <div class="logo-icon">
            <i class="fas fa-shopping-bag"></i>
          </div>
          <div class="brand-text">
            <h1>Fahfi Shop</h1>
            <p>ระบบจัดการร้านเสื้อผ้า</p>
          </div>
        </NuxtLink>

        <!-- Header Right Section -->
        <div class="header-right">
          <div class="user-info">
            <span class="user-name">{{ userName }}</span>
            <span class="user-badge" :class="{ 'badge-admin': isAdmin }">
              {{ isAdmin ? 'Admin' : 'Staff' }}
            </span>
          </div>
          <button @click="logout" class="logout-btn" title="ออกจากระบบ">
            <i class="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </div>
    </header>

    <!-- Main Container -->
    <div class="fahfi-main-container" v-if="isLoggedIn">
      <!-- Sidebar -->
      <aside class="fahfi-sidebar" :class="{ 'sidebar-collapsed': !sidebarOpen }">
        <nav class="sidebar-nav">
          <!-- Dashboard -->
          <NuxtLink to="/" class="nav-item" :class="{ active: isActive('/') }">
            <i class="fas fa-tachometer-alt"></i>
            <span class="nav-label">Dashboard</span>
          </NuxtLink>

          <!-- POS -->
          <NuxtLink to="/pos" class="nav-item" :class="{ active: isActive('/pos') }">
            <i class="fas fa-cash-register"></i>
            <span class="nav-label">หน้าขาย (POS)</span>
          </NuxtLink>

          <!-- Products -->
          <NuxtLink to="/products" class="nav-item" :class="{ active: isActive('/products') }">
            <i class="fas fa-boxes"></i>
            <span class="nav-label">จัดการสินค้า</span>
          </NuxtLink>

          <!-- Admin Only -->
          <template v-if="isAdmin">
            <div class="nav-divider"></div>
            <div class="nav-section-title">จัดการระบบ</div>

            <!-- Expenses -->
            <NuxtLink to="/expenses" class="nav-item" :class="{ active: isActive('/expenses') }">
              <i class="fas fa-receipt"></i>
              <span class="nav-label">จัดการรายจ่าย</span>
            </NuxtLink>

            <!-- Sales History -->
            <NuxtLink to="/sales-history" class="nav-item" :class="{ active: isActive('/sales-history') }">
              <i class="fas fa-history"></i>
              <span class="nav-label">ประวัติการขาย</span>
            </NuxtLink>

            <!-- User Management (Future) -->
            <NuxtLink to="/users" class="nav-item" :class="{ active: isActive('/users') }">
              <i class="fas fa-users"></i>
              <span class="nav-label">จัดการผู้ใช้</span>
            </NuxtLink>
          </template>

          <!-- Settings (Optional) -->
          <div class="nav-divider"></div>
          <div class="nav-item settings-item" title="ตั้งค่าระบบ">
            <i class="fas fa-cog"></i>
            <span class="nav-label">ตั้งค่า</span>
          </div>
        </nav>
      </aside>

      <!-- Content Area -->
      <main class="fahfi-content">
        <slot />
      </main>
    </div>

    <!-- No Header for Non-Logged Users -->
    <main v-else>
      <slot />
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const { isLoggedIn, isAdmin, userName, logout } = useAuth();

// Sidebar state
const sidebarOpen = ref(true);

// Toggle sidebar
const toggleSidebar = () => {
  sidebarOpen.value = !sidebarOpen.value;
};

// Check active route
const isActive = (path) => {
  return useRoute().path === path;
};
</script>

<style scoped>
/* Root Layout */
.fahfi-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* ============== HEADER STYLES ============== */
.fahfi-header {
  background: linear-gradient(135deg, #5a67d8 0%, #6b46c1 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(90, 103, 216, 0.15);
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 0.5rem 0;
}

.header-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  max-width: 100%;
}

/* Sidebar Toggle Button */
.sidebar-toggle {
  background: none;
  border: none;
  color: white;
  font-size: 1.3rem;
  cursor: pointer;
  padding: 0.4rem 0.6rem;
  margin-right: 0.5rem;
  transition: all 0.3s ease;
  display: block;
  opacity: 0.85;
}

.sidebar-toggle:hover {
  transform: scale(1.1);
  opacity: 1;
}

/* Brand Section */
.brand-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  text-decoration: none;
  color: white;
  flex: 1;
  transition: all 0.3s ease;
}

.brand-section:hover {
  opacity: 0.9;
}

.logo-icon {
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  transition: all 0.3s ease;
}

.brand-section:hover .logo-icon {
  background: rgba(255, 255, 255, 0.25);
  transform: scale(1.05);
}

.brand-text h1 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.3px;
}

.brand-text p {
  margin: 0;
  font-size: 0.65rem;
  opacity: 0.85;
  font-weight: 300;
}

/* Header Right Section */
.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.user-name {
  font-weight: 600;
  font-size: 0.85rem;
}

.user-badge {
  background: rgba(255, 255, 255, 0.15);
  color: white;
  padding: 0.2rem 0.6rem;
  border-radius: 16px;
  font-size: 0.65rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.user-badge.badge-admin {
  background: rgba(251, 191, 36, 0.25);
  color: #fbbf24;
}

.logout-btn {
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: white;
  padding: 0.35rem 0.7rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  opacity: 0.85;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.25);
  transform: translateY(-1px);
  opacity: 1;
}

/* ============== MAIN CONTAINER ============== */
.fahfi-main-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* ============== SIDEBAR STYLES ============== */
.fahfi-sidebar {
  width: 260px;
  background: white;
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
  transition: all 0.3s ease;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
}

.fahfi-sidebar.sidebar-collapsed {
  width: 70px;
  padding: 0;
}

.sidebar-nav {
  padding: 1.5rem 0;
  display: flex;
  flex-direction: column;
}

/* Navigation Items */
.nav-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  color: #333;
  text-decoration: none;
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
  position: relative;
  white-space: nowrap;
}

.nav-item i {
  font-size: 1.2rem;
  width: 24px;
  text-align: center;
  color: #667eea;
  transition: all 0.3s ease;
}

.nav-label {
  font-weight: 500;
  font-size: 0.95rem;
}

.nav-item:hover {
  background: #f5f5f5;
  border-left-color: #667eea;
  padding-left: 1.2rem;
}

.nav-item.active {
  background: linear-gradient(90deg, rgba(102, 126, 234, 0.1) 0%, transparent 100%);
  border-left-color: #667eea;
  color: #667eea;
  font-weight: 600;
}

.nav-item.active i {
  color: #667eea;
}

/* Sidebar Collapsed State */
.fahfi-sidebar.sidebar-collapsed .nav-item {
  padding: 1rem 0;
  justify-content: center;
  border-left: none;
  border-top: 2px solid transparent;
}

.fahfi-sidebar.sidebar-collapsed .nav-label {
  display: none;
}

.fahfi-sidebar.sidebar-collapsed .nav-item:hover {
  background: #f5f5f5;
  border-left: none;
  border-top-color: #667eea;
  padding-left: 0;
}

.fahfi-sidebar.sidebar-collapsed .nav-item.active {
  background: rgba(102, 126, 234, 0.1);
  border-left: none;
  border-top-color: #667eea;
}

/* Divider */
.nav-divider {
  height: 1px;
  background: #e0e0e0;
  margin: 1rem 0;
}

.nav-section-title {
  padding: 0 1.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 0.5rem;
}

.settings-item {
  margin-top: auto;
  border-top: 1px solid #e0e0e0;
  cursor: pointer;
  color: #999;
}

.settings-item:hover {
  color: #333;
}

/* ============== CONTENT AREA ============== */
.fahfi-content {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  background-color: #f5f5f5;
}

/* ============== RESPONSIVE ============== */
@media (max-width: 768px) {
  /* Header adjustments */
  .header-container {
    padding: 0.75rem 1rem;
  }

  .brand-text h1 {
    font-size: 1.2rem;
  }

  .brand-text p {
    display: none;
  }

  .logo-icon {
    width: 40px;
    height: 40px;
    font-size: 1.5rem;
  }

  /* Sidebar mobile */
  .fahfi-sidebar {
    position: fixed;
    left: 0;
    top: 65px;
    height: calc(100vh - 65px);
    z-index: 99;
    border-right: none;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
  }

  .fahfi-sidebar.sidebar-collapsed {
    transform: translateX(-100%);
    width: 260px;
  }

  /* Content adjustments */
  .fahfi-content {
    padding: 1.5rem;
  }

  /* User info adjustments */
  .user-info {
    gap: 0.5rem;
  }

  .user-name {
    display: none;
  }

  .user-badge {
    font-size: 0.65rem;
    padding: 0.2rem 0.5rem;
  }

  .logout-btn {
    padding: 0.4rem 0.8rem;
  }
}

@media (max-width: 576px) {
  .header-container {
    padding: 0.5rem;
  }

  .brand-section {
    gap: 0.5rem;
  }

  .brand-text h1 {
    font-size: 1rem;
  }

  .logo-icon {
    width: 35px;
    height: 35px;
    font-size: 1.2rem;
  }

  .header-right {
    gap: 0.5rem;
  }

  .fahfi-content {
    padding: 1rem;
  }

  .nav-item {
    padding: 0.75rem 1.5rem;
  }

  .nav-divider {
    margin: 0.75rem 0;
  }
}

/* Scrollbar Styling */
.fahfi-sidebar::-webkit-scrollbar,
.fahfi-content::-webkit-scrollbar {
  width: 8px;
}

.fahfi-sidebar::-webkit-scrollbar-track,
.fahfi-content::-webkit-scrollbar-track {
  background: transparent;
}

.fahfi-sidebar::-webkit-scrollbar-thumb,
.fahfi-content::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 4px;
}

.fahfi-sidebar::-webkit-scrollbar-thumb:hover,
.fahfi-content::-webkit-scrollbar-thumb:hover {
  background: #bbb;
}
</style>