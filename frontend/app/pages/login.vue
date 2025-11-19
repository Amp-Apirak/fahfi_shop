<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-5">
        <div class="card shadow">
          <div class="card-body">
            <h3 class="card-title text-center mb-4">
              เข้าสู่ระบบ (fahfe_shop)
            </h3>

            <form @submit.prevent="handleLogin">
              <div class="mb-3">
                <label for="username" class="form-label">Username</label>
                <input
                  type="text"
                  class="form-control"
                  id="username"
                  v-model="username"
                  required
                />
              </div>

              <div class="mb-3">
                <label for="password" class="form-label">Password</label>
                <input
                  type="password"
                  class="form-control"
                  id="password"
                  v-model="password"
                  required
                />
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
import { ref } from "vue";
import axios from "axios";

definePageMeta({
  layout: false,
});

const username = ref("");
const password = ref("");
const errorMessage = ref(null);

// (ใหม่) เรียกใช้ฟังก์ชัน login จาก useAuth
const { login } = useAuth();

const handleLogin = async () => {
  try {
    const response = await axios.post("http://localhost:3001/api/login", {
      username: username.value,
      password: password.value,
    });

    // (ใหม่) เรียกใช้ฟังก์ชัน login ที่เราสร้างไว้
    // มันจะจัดการ Cookie และ State ให้เราเอง
    login(response.data.token, response.data.user);

    console.log("Login สำเร็จ! (ใช้ useAuth)");

    // Redirect (ใช้ window.location.href ดีที่สุดหลัง Login)
    window.location.href = "/";
  } catch (error) {
    console.error("Login ล้มเหลว:", error);
    errorMessage.value = "Username หรือ Password ไม่ถูกต้อง";
  }
};
</script>

<style>
* {
  font-family: 'Sarabun', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

body {
  font-family: 'Sarabun', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* เราสามารถเพิ่ม CSS เฉพาะหน้าได้ที่นี่ (ถ้าต้องการ) */
</style>
