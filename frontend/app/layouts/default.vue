<template>
  <div>
    <nav v-if="isLoggedIn" class="navbar navbar-expand-lg navbar-dark bg-dark">
      <div class="container-fluid">
        <a class="navbar-brand" href="/">ระบบจัดการร้าน Fahfe Shop</a>
        <div class="navbar-nav ms-auto">
          <NuxtLink to="/pos" class="nav-link text-white fw-bold me-3"
            >หน้าขาย (POS)</NuxtLink
          >
          <NuxtLink to="/products" class="nav-link text-white me-3"
            >จัดการสินค้า</NuxtLink
          >
          <NuxtLink to="/expenses" class="nav-link text-white me-3"
            >จัดการรายจ่าย</NuxtLink
          >
          <NuxtLink to="/sales-history" class="nav-link text-white me-3"
            >ประวัติการขาย</NuxtLink
          >
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
const token = useCookie("token");
const user = useCookie("user");

const isLoggedIn = computed(() => !!token.value);
const userName = computed(() => {
  if (user.value) {
    try {
      const userData =
        typeof user.value === "string" ? JSON.parse(user.value) : user.value;
      return userData.username || "ผู้ใช้";
    } catch {
      return "ผู้ใช้";
    }
  }
  return "ผู้ใช้";
});

const logout = async () => {
  token.value = null;
  user.value = null;
  await navigateTo("/login");
};
</script>
