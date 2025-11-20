// D:\12. Dev\fahfi_shop\frontend\composables\useAuth.ts

export const useAuth = () => {
  const token = useCookie('token');
  const userCookie = useCookie('user');
  const router = useRouter();

  // (ฟังก์ชันนี้จะ Sync ข้อมูลจาก Cookie มาใส่ใน State ตอนที่เว็บโหลดครั้งแรก)
  const syncUserState = () => {
    // ไม่ต้องทำอะไร เพราะเราใช้ Cookie โดยตรง
  };

  // --- นี่คือ "ค่า" ที่เราจะให้ Component อื่นๆ เรียกใช้ ---

  // 1. ตรวจสอบว่า Login หรือยัง
  const isLoggedIn = computed(() => !!token.value);

  // 2. (สำคัญ!) ตรวจสอบว่าเป็น Admin หรือไม่
  const isAdmin = computed(() => {
    if (!userCookie.value) return false;
    try {
      const user = typeof userCookie.value === 'string'
        ? JSON.parse(userCookie.value)
        : userCookie.value;
      return user && user.role === 'Admin';
    } catch (e) {
      return false;
    }
  });

  // 3. ดึงชื่อผู้ใช้
  const userName = computed(() => {
    if (!userCookie.value) return 'ผู้ใช้';
    try {
      const user = typeof userCookie.value === 'string'
        ? JSON.parse(userCookie.value)
        : userCookie.value;
      return user?.username || 'ผู้ใช้';
    } catch (e) {
      return 'ผู้ใช้';
    }
  });

  // 4. ดึงข้อมูลผู้ใช้ทั้งหมด (ถ้าต้องการ)
  const user = computed(() => {
    if (!userCookie.value) return null;
    try {
      return typeof userCookie.value === 'string'
        ? JSON.parse(userCookie.value)
        : userCookie.value;
    } catch (e) {
      return null;
    }
  });

  // --- นี่คือ "ฟังก์ชัน" ที่เราจะให้ Component อื่นๆ เรียกใช้ ---

  // 5. ฟังก์ชัน Login (อัปเดต Cookie)
  const login = (tokenData: string, userData: any) => {
    token.value = tokenData;
    userCookie.value = JSON.stringify(userData);
  };

  // 6. ฟังก์ชัน Logout (ล้าง Cookie)
  const logout = async () => {
    token.value = null;
    userCookie.value = null;
    await navigateTo('/login');
  };

  // 7. (เพิ่มใหม่) ฟังก์ชันตรวจสอบ Token หมดอายุ
  const handleTokenExpired = async () => {
    console.warn('⚠️ Token Expired - Logging out...');
    await logout();
  };

  return {
    // ค่า
    isLoggedIn,
    isAdmin,
    userName,
    user,

    // ฟังก์ชัน
    login,
    logout,
    syncUserState,
    handleTokenExpired
  };
};