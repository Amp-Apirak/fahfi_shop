<template>
  <div class="fahfi-layout" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
    <!-- Sidebar (ถ้า login แล้ว) -->
    <SidebarComponent v-if="isLoggedIn" />

    <!-- Main Content Wrapper -->
    <div class="main-wrapper" :class="{ 'with-sidebar': isLoggedIn }">
      <!-- Header (ถ้า login แล้ว) -->
      <HeaderComponent v-if="isLoggedIn" />

      <!-- Content Area -->
      <main class="fahfi-content" v-if="isLoggedIn">
        <slot />
      </main>

      <!-- No Header for Non-Logged Users -->
      <main v-else>
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useAuth } from '~/composables/useAuth'

const { isLoggedIn } = useAuth()
const sidebarCollapsed = ref(false)

// Monitor sidebar collapsed state from localStorage
const updateSidebarState = () => {
  const saved = localStorage.getItem('sidebarCollapsed')
  sidebarCollapsed.value = saved ? JSON.parse(saved) : false
}

onMounted(() => {
  updateSidebarState()

  // Listen to storage changes from SidebarComponent
  window.addEventListener('storage', updateSidebarState)

  // Also listen to custom event
  window.addEventListener('sidebarToggle', updateSidebarState)

  // Poll localStorage changes (for same tab)
  const interval = setInterval(updateSidebarState, 200)

  onBeforeUnmount(() => {
    clearInterval(interval)
    window.removeEventListener('storage', updateSidebarState)
    window.removeEventListener('sidebarToggle', updateSidebarState)
  })
})
</script>

<style scoped>
.fahfi-layout {
  display: flex;
  min-height: 100vh;
  background-color: #f5f7fa;
  transition: all 0.3s ease;
  font-family: 'Sarabun', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: margin-left 0.3s ease;
}

.main-wrapper.with-sidebar {
  margin-left: 262px;  /* Default: Expanded sidebar on desktop */
}

/* Collapsed Sidebar State (Desktop only) */
.fahfi-layout.sidebar-collapsed .main-wrapper.with-sidebar {
  margin-left: 80px;  /* Collapsed: Icon only sidebar on desktop */
}

.fahfi-content {
  flex: 1;
  overflow-y: auto;
  padding: 30px;
  background-color: #f5f7fa;
}

@media (max-width: 768px) {
  .main-wrapper.with-sidebar {
    margin-left: 0;  /* ซ่อนเมนูไปเลย */
  }

  .fahfi-layout.sidebar-collapsed .main-wrapper.with-sidebar {
    margin-left: 0;  /* ซ่อนเมนูไปเลย */
  }

  .fahfi-content {
    padding: 20px;
  }
}

/* Scrollbar Styling */
.fahfi-content::-webkit-scrollbar {
  width: 8px;
}

.fahfi-content::-webkit-scrollbar-track {
  background: transparent;
}

.fahfi-content::-webkit-scrollbar-thumb {
  background: #ddd;
  border-radius: 4px;
}

.fahfi-content::-webkit-scrollbar-thumb:hover {
  background: #bbb;
}
</style>