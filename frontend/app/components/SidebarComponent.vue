<template>
  <!-- Backdrop (เมื่อ Mobile drawer เปิด) -->
  <div
    v-if="isMobile && showDrawer"
    class="sidebar-backdrop"
    @click="closeDrawer"
  ></div>

  <aside class="sidebar" :class="{ collapsed: isCollapsed && !isMobile, 'drawer-open': isMobile && showDrawer }">
    <!-- Logo Only (Toggle button moved to Header) -->
    <div class="sidebar-header">
      <div class="header-content">
        <div class="logo-container">
          <div class="logo-icon">
            <i class="fas fa-bag-shopping"></i>
          </div>
          <div v-if="!isCollapsed" class="logo-text">
            <h2 class="logo-title">Fahfi Shop</h2>
            <p class="logo-subtitle">POS System</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Menu Items -->
    <nav class="sidebar-menu">
      <NuxtLink
        v-for="item in menuItems"
        :key="item.id"
        :to="item.route"
        class="menu-item"
        :class="{ active: isActive(item.route) }"
        :title="isCollapsed ? item.label : ''"
        @click="handleMenuItemClick"
      >
        <i :class="`fas fa-${item.icon}`"></i>
        <span v-if="!isCollapsed" class="menu-label">{{ item.label }}</span>
      </NuxtLink>
    </nav>

    <!-- Logout Button -->
    <div class="sidebar-footer">
      <button
        class="menu-item logout-btn"
        @click="handleLogout"
        :title="isCollapsed ? 'ออกจากระบบ' : ''"
      >
        <i class="fas fa-sign-out-alt"></i>
        <span v-if="!isCollapsed" class="menu-label">ออกจากระบบ</span>
      </button>
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '~/composables/useAuth'

const router = useRouter()
const route = useRoute()
const { logout, isAdmin } = useAuth()

// Sidebar collapsed state
const isCollapsed = ref(false)
const isMobile = ref(false)
const showDrawer = ref(false)

const menuItems = computed(() => {
  const baseItems = [
    { id: 1, label: 'ภาพรวม (AI)', icon: 'chart-pie', route: '/' },
    { id: 2, label: 'ขายหน้าร้าน', icon: 'shopping-cart', route: '/pos' },
  ]

  // Admin only items
  if (isAdmin.value) {
    baseItems.push(
      { id: 3, label: 'สต็อกสินค้า (AI)', icon: 'box', route: '/products' },
      { id: 4, label: 'ประวัติการขาย', icon: 'history', route: '/sales-history' },
      { id: 5, label: 'บันทึกรายจ่าย', icon: 'hand-holding-dollar', route: '/expenses' }
    )
  }

  return baseItems
})

const isActive = (routePath: string) => {
  return route.path === routePath
}

const handleLogout = async () => {
  await logout()
  router.push('/login')
}

const toggleSidebar = () => {
  isCollapsed.value = !isCollapsed.value
  showDrawer.value = false  // ปิด Drawer เมื่อ toggle
  // Save to localStorage
  localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed.value))
}


const closeDrawer = () => {
  showDrawer.value = false
}

const handleMenuItemClick = () => {
  // ปิด Drawer เมื่อคลิกเมนูไอเท็ม
  if (isCollapsed.value && showDrawer.value) {
    showDrawer.value = false
  }
}

// Check screen size and auto collapse on mobile
const checkScreenSize = () => {
  const width = window.innerWidth
  isMobile.value = width < 768

  // Auto collapse on mobile
  if (isMobile.value) {
    isCollapsed.value = true
    showDrawer.value = false  // ปิด Drawer ถ้ามีการเปลี่ยนขนาดจอ
  } else {
    // บน Desktop: Restore from localStorage (อนุญาติให้ user toggle)
    const saved = localStorage.getItem('sidebarCollapsed')
    if (saved !== null) {
      isCollapsed.value = JSON.parse(saved)
    } else {
      // ค่าเริ่มต้น: Expanded บน Desktop
      isCollapsed.value = false
    }
  }
}

onMounted(() => {
  // Load state from localStorage
  const savedCollapsed = localStorage.getItem('sidebarCollapsed')
  if (savedCollapsed !== null) {
    isCollapsed.value = JSON.parse(savedCollapsed)
  }

  const savedDrawer = localStorage.getItem('drawerOpen')
  if (savedDrawer !== null) {
    showDrawer.value = JSON.parse(savedDrawer)
  }

  // Check initial screen size
  checkScreenSize()

  // Listen to window resize
  window.addEventListener('resize', checkScreenSize)

  // Listen to toggle events from Header
  window.addEventListener('sidebarToggle', () => {
    const collapsed = localStorage.getItem('sidebarCollapsed')
    const drawer = localStorage.getItem('drawerOpen')
    isCollapsed.value = collapsed ? JSON.parse(collapsed) : false
    showDrawer.value = drawer ? JSON.parse(drawer) : false
  })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkScreenSize)
  window.removeEventListener('sidebarToggle', () => {})
})
</script>

<style scoped>
.sidebar {
  width: 262px;
  background: linear-gradient(180deg, #1e3a8a 0%, #1e40af 100%);
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: fixed;
  left: 0;
  top: 0;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.25);
  z-index: 100;
  font-family: 'Sarabun', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.sidebar-header {
  padding: 25px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo-container {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logo-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #ffffff;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
}

.logo-container:hover .logo-icon {
  background: linear-gradient(135deg, #93c5fd 0%, #60a5fa 100%);
  transform: scale(1.08);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.6);
}

.logo-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.logo-title {
  font-size: 18px;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  letter-spacing: -0.3px;
}

.logo-subtitle {
  font-size: 11px;
  color: #93c5fd;
  margin: 0;
  font-weight: 400;
}

.sidebar-menu {
  flex: 1;
  overflow-y: auto;
  padding: 15px 10px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  color: #cbd5e1;
  text-decoration: none;
  border-radius: 12px;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  background: transparent;
  width: 100%;
  text-align: left;
  position: relative;
}

.menu-item i {
  font-size: 18px;
  min-width: 20px;
  text-align: center;
}

.menu-item:hover {
  background: rgba(59, 130, 246, 0.15);
  color: #ffffff;
  transform: translateX(6px);
  padding-left: 20px;
}

.menu-item.active {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: #ffffff;
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
  font-weight: 600;
}

.menu-item.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 5px;
  background: linear-gradient(180deg, #60a5fa 0%, #3b82f6 100%);
  border-radius: 0 4px 4px 0;
  box-shadow: 0 0 10px rgba(96, 165, 250, 0.5);
}

.logout-btn {
  background: rgba(239, 68, 68, 0.1);
  color: #fecaca;
  margin-top: auto;
  border: 1px solid rgba(239, 68, 68, 0.3);
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: #ffffff;
  border-color: #ef4444;
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
  transform: translateX(4px);
}

.sidebar-footer {
  padding: 15px 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* Sidebar Header Styles */
.sidebar-header {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  gap: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.header-content {
  flex: 1;
  min-width: 0;
}

/* Backdrop */
.sidebar-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 99;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Collapsed State */
.sidebar.collapsed {
  width: 80px;
}

.sidebar.collapsed .logo-text {
  display: none;
}

.sidebar.collapsed .menu-label {
  display: none;
}

.sidebar.collapsed .menu-item {
  padding: 14px;
  justify-content: center;
  gap: 0;
}

.sidebar.collapsed .menu-item i {
  font-size: 20px;
}

.sidebar.collapsed .menu-item:hover {
  padding-left: 14px;
  transform: scale(1.1);
}

.sidebar.collapsed .logo-icon {
  width: 40px;
  height: 40px;
  font-size: 20px;
}

.sidebar.collapsed .sidebar-header {
  flex-direction: column;
  gap: 8px;
}

.sidebar.collapsed .header-content {
  flex: 0;
}

/* Drawer Mode (Overlay when collapsed on mobile) */
.sidebar.collapsed.drawer-open {
  width: 262px;
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  z-index: 100;
  box-shadow: 4px 0 20px rgba(0, 0, 0, 0.3);
}

.sidebar.collapsed.drawer-open .logo-text {
  display: flex;
}

.sidebar.collapsed.drawer-open .menu-label {
  display: inline;
}

.sidebar.collapsed.drawer-open .menu-item {
  padding: 14px 16px;
  justify-content: flex-start;
  gap: 14px;
}

.sidebar.collapsed.drawer-open .menu-item i {
  font-size: 18px;
}

.sidebar.collapsed.drawer-open .logo-icon {
  width: 48px;
  height: 48px;
  font-size: 24px;
}

.sidebar.collapsed.drawer-open .sidebar-header {
  flex-direction: row;
  gap: 12px;
}

.sidebar.collapsed.drawer-open .header-content {
  flex: 1;
}

/* Desktop: Drawer mode is not used, only collapse/expand width */
@media (min-width: 768px) {
  .sidebar.collapsed.drawer-open {
    /* ไม่ใช้ drawer mode บน desktop */
    /* เพียงแค่เปลี่ยน width */
  }
}


/* Smooth Transition */
.sidebar {
  transition: width 0.3s ease;
}

.menu-item {
  transition: all 0.3s ease;
}

/* Menu Label Animation */
.menu-label {
  transition: opacity 0.3s ease;
}

/* Scrollbar Styling */
.sidebar-menu::-webkit-scrollbar {
  width: 6px;
}

.sidebar-menu::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-menu::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.sidebar-menu::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

@media (max-width: 768px) {
  /* ซ่อนเมนูไปเลยบน Mobile */
  .sidebar {
    display: none;
    width: 80px;
  }

  /* แสดงเป็น Overlay เมื่อ drawer-open */
  .sidebar.drawer-open {
    display: flex;
    width: 262px;
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    z-index: 100;
    box-shadow: 4px 0 20px rgba(0, 0, 0, 0.3);
  }

  .sidebar.drawer-open .logo-text {
    display: flex;
  }

  .sidebar.drawer-open .menu-label {
    display: inline;
  }

  .sidebar.drawer-open .menu-item {
    padding: 14px 16px;
    justify-content: flex-start;
    gap: 14px;
  }

  .sidebar.drawer-open .menu-item i {
    font-size: 18px;
  }

  .sidebar.drawer-open .logo-icon {
    width: 48px;
    height: 48px;
    font-size: 24px;
  }

  .sidebar.drawer-open .sidebar-header {
    flex-direction: row;
    gap: 12px;
  }

  .sidebar.drawer-open .header-content {
    flex: 1;
  }

  .logo-text {
    display: none;
  }

  .menu-label {
    display: none;
  }

  .logo-icon {
    width: 40px;
    height: 40px;
    font-size: 20px;
  }

  .menu-item {
    padding: 14px;
    justify-content: center;
  }

  .menu-item i {
    font-size: 20px;
  }

  .sidebar-header {
    flex-direction: column;
    gap: 8px;
  }
}
</style>
