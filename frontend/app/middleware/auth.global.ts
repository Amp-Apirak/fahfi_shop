export default defineNuxtRouteMiddleware(async (to) => {
  // อ่าน Token จาก Cookie
  const token = useCookie('token');
  const auth = useAuth();

  // กรณีที่ 1: ยังไม่ Login และพยายามเข้าหน้าที่ไม่ใช่ Login
  if (!token.value && to.path !== '/login') {
    return navigateTo('/login');
  }

  // กรณีที่ 2: Login แล้ว แต่พยายามเข้าหน้า Login
  if (token.value && to.path === '/login') {
    return navigateTo('/');
  }

  // กรณีที่ 3: (เพิ่มใหม่) ตรวจสอบว่า Token ยังมีอยู่ใน Cookie ไหม
  // ถ้าหายไป = เด้งไปหน้า Login
  if (!token.value && to.path !== '/login') {
    console.warn('⚠️ Token Lost - Redirecting to login...');
    await auth.logout();
    return navigateTo('/login');
  }

  // ปล่อยผ่าน
});