<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
// (สำคัญ!) เรียกใช้ useAuth และสั่ง Sync State 1 ครั้ง
// เมื่อ App โหลด (ทุกครั้งที่ Refresh), มันจะดึงข้อมูลจาก Cookie มาใส่ใน State
const { syncUserState } = useAuth();
syncUserState();
</script>

<style>
* {
  font-family: 'Sarabun', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

html, body {
  font-family: 'Sarabun', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
</style>