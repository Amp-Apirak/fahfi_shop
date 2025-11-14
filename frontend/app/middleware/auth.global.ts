export default defineNuxtRouteMiddleware((to) => {
  // อ่าน Token จาก Cookie
  const token = useCookie('token');

  // กรณีที่ 1: ยังไม่ Login และพยายามเข้าหน้าที่ไม่ใช่ Login
  if (!token.value && to.path !== '/login') {
    return navigateTo('/login');
  }

  // กรณีที่ 2: Login แล้ว แต่พยายามเข้าหน้า Login
  if (token.value && to.path === '/login') {
    return navigateTo('/');
  }

  // ปล่อยผ่าน
});