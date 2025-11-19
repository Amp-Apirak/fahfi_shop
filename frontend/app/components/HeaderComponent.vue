<template>
  <header class="header-component">
    <div class="header-container">
      <!-- Toggle Button (Left Side) -->
      <button
        class="toggle-btn"
        @click="handleToggleClick"
        :title="isMobile ? (isDrawerOpen ? 'ปิดเมนู' : 'เปิดเมนู') : (isCollapsed ? 'ขยายเมนู' : 'ย่อเมนู')"
      >
        <i :class="isMobile ? (isDrawerOpen ? 'fas fa-chevron-left' : 'fas fa-chevron-right') : (isCollapsed ? 'fas fa-chevron-right' : 'fas fa-chevron-left')"></i>
      </button>

      <!-- Title -->
      <h1 class="header-title">ภาพรวมร้านค้า (Dashboard)</h1>

      <!-- AI Button (Right Side) -->
      <button class="btn-ai">
        <i class="fas fa-wand-magic-sparkles"></i>
        วิศวะรหัสอาศัยด้วย AI
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

const isCollapsed = ref(false)
const isDrawerOpen = ref(false)
const isMobile = ref(false)

// Monitor sidebar state from localStorage
const updateSidebarState = () => {
  const collapsed = localStorage.getItem('sidebarCollapsed')
  const drawer = localStorage.getItem('drawerOpen')
  isCollapsed.value = collapsed ? JSON.parse(collapsed) : false
  isDrawerOpen.value = drawer ? JSON.parse(drawer) : false
}

const handleToggleClick = () => {
  if (isMobile.value) {
    // Mobile: Toggle drawer
    isDrawerOpen.value = !isDrawerOpen.value
    localStorage.setItem('drawerOpen', JSON.stringify(isDrawerOpen.value))
  } else {
    // Desktop: Toggle collapse/expand
    isCollapsed.value = !isCollapsed.value
    localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed.value))
  }
  // Dispatch event to update other components
  window.dispatchEvent(new Event('sidebarToggle'))
}

// Check screen size
const checkScreenSize = () => {
  const width = window.innerWidth
  isMobile.value = width < 768
}

onMounted(() => {
  updateSidebarState()
  checkScreenSize()

  // Listen to storage changes
  window.addEventListener('storage', updateSidebarState)

  // Listen to sidebar toggle events
  window.addEventListener('sidebarToggle', updateSidebarState)

  // Listen to window resize
  window.addEventListener('resize', checkScreenSize)

  // Poll localStorage changes
  const interval = setInterval(updateSidebarState, 200)

  onBeforeUnmount(() => {
    clearInterval(interval)
    window.removeEventListener('storage', updateSidebarState)
    window.removeEventListener('sidebarToggle', updateSidebarState)
    window.removeEventListener('resize', checkScreenSize)
  })
})
</script>

<style scoped>
.header-component {
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  padding: 20px 30px;
  border-bottom: 1px solid #e9ecef;
  font-family: 'Sarabun', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.header-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  max-width: 100%;
  font-family: 'Sarabun', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* Toggle Button */
.toggle-btn {
  width: 44px;
  height: 44px;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 10px;
  color: #3b82f6;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-size: 16px;
  flex-shrink: 0;
}

.toggle-btn:hover {
  background: rgba(59, 130, 246, 0.2);
  color: #1d4ed8;
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.toggle-btn:active {
  transform: scale(0.95);
}

.toggle-btn i {
  font-size: 18px;
}

.header-title {
  font-size: 32px;
  font-weight: 700;
  color: #2c3e50;
  margin: 0;
  letter-spacing: -0.5px;
  flex: 1;
  text-align: center;
}

.btn-ai {
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(107, 114, 207, 0.3);
  flex-shrink: 0;
}

.btn-ai:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(107, 114, 207, 0.4);
}

.btn-ai i {
  font-size: 16px;
}

@media (max-width: 768px) {
  .header-component {
    padding: 15px 20px;
  }

  .header-container {
    gap: 12px;
  }

  .toggle-btn {
    width: 40px;
    height: 40px;
  }

  .header-title {
    font-size: 20px;
  }

  .btn-ai {
    padding: 10px 16px;
    font-size: 12px;
  }
}
</style>
