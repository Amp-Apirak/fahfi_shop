// Composable สำหรับจัดการ API Error แบบรวมศูนย์
export const useApiError = () => {
  const auth = useAuth()

  // ฟังก์ชันตรวจสอบ Error จาก API
  const handleApiError = async (error: any) => {
    console.error('❌ API Error:', error)

    // ถ้า Status 403 = Token หมดอายุ
    if (error.response?.status === 403) {
      console.warn('⚠️ Token Expired - Logging out...')
      await auth.handleTokenExpired()
      return true // ส่งกลับ true เพื่อบอกว่าเป็น 403
    }

    // ถ้า Status 401 = ไม่มี Token หรือ Unauthorized
    if (error.response?.status === 401) {
      console.warn('⚠️ Unauthorized - Logging out...')
      await auth.logout()
      return true
    }

    return false // ไม่ใช่ Auth error
  }

  return {
    handleApiError
  }
}
