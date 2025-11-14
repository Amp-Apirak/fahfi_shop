<template>
  <div>
    <nav v-if="isLoggedIn" class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container-fluid">
        <NuxtLink class="navbar-brand" to="/">ระบบจัดการร้าน Fahfe Shop</NuxtLink>
        
        <div class="navbar-nav ms-auto">
          <NuxtLink to="/pos" class="nav-link text-white fw-bold me-3">หน้าขาย (POS)</NuxtLink>
          
          <NuxtLink to="/products" class="nav-link text-white me-3">จัดการสินค้า</NuxtLink>

          <template v-if="isAdmin">
            <NuxtLink to="/expenses" class="nav-link text-white me-3">จัดการรายจ่าย</NuxtLink>
            <NuxtLink to="/sales-history" class="nav-link text-white me-3">ประวัติการขาย</NuxtLink>
          </template>

          <span class="navbar-text text-white me-3">
            สวัสดี, {{ userName }}
          </span>
          <button @click="logout" class="btn btn-outline-light btn-sm">
            ออกจากระบบ
          </button>
        </div>
      </div>
    </nav>

    <main>
      <slot />
    </main>
  </div>
</template>

<script setup>
// (ใหม่!) เรียกใช้ useAuth ที่เราสร้างไว้
// เราไม่ต้องเขียน computed เองอีกแล้ว!
const { isLoggedIn, isAdmin, userName, logout } = useAuth();

// (หมายเหตุ: เราลบ computed เก่าทิ้งทั้งหมด)
</script>

<style scoped>
/* (Optional) เพิ่มสไตล์สำหรับเมนูที่ Active */
.router-link-active {
  color: #fff !important;
  font-weight: bold;
  border-bottom: 2px solid #fff;
}
</style>