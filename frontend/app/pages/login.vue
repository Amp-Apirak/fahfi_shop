<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-5">
        <div class="card shadow">
          <div class="card-body">
            <h3 class="card-title text-center mb-4">เข้าสู่ระบบ (fahfe_shop)</h3>
            
            <form @submit.prevent="handleLogin">
              <div class="mb-3">
                <label for="username" class="form-label">Username</label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="username" 
                  v-model="username" 
                  required
                >
              </div>
              
              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input 
                  type="password" 
                  class="form-control" 
                  id="password" 
                  v-model="password" 
                  required
                >
              </div>
              
              <div v-if="errorMessage" class="alert alert-danger" role="alert">
                {{ errorMessage }}
              </div>
              
              <div class="d-grid">
                <button type="submit" class="btn btn-primary">
                  เข้าสู่ระบบ
                </button>
              </div>
            </form>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

definePageMeta({
  layout: false // ไม่ใช้ layout สำหรับหน้า login
});

// 1. ตัวแปรสำหรับเก็บค่าในฟอร์ม
const username = ref('');
const password = ref('');
const errorMessage = ref(null);

// 2. เรียกใช้ useCookie (เหมือนเดิม)
const token = useCookie('token'); 
const user = useCookie('user');   

// ฟังก์ชันที่จะรันเมื่อกดปุ่ม "เข้าสู่ระบบ"
const handleLogin = async () => {
  try {
    const response = await axios.post('http://localhost:3001/api/login', {
      username: username.value,
      password: password.value
    });

    // บันทึก Token และ User ลงใน Cookies
    token.value = response.data.token;
    user.value = JSON.stringify(response.data.user);

    console.log('Login สำเร็จ!', response.data);

    // Redirect ไปหน้าหลัก (บังคับให้ reload)
    window.location.href = '/';

  } catch (error) {
    console.error('Login ล้มเหลว:', error);
    errorMessage.value = 'Username หรือ Password ไม่ถูกต้อง';
  }
};
</script>
<style>
/* เราสามารถเพิ่ม CSS เฉพาะหน้าได้ที่นี่ (ถ้าต้องการ) */
</style>