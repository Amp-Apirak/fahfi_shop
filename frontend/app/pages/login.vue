<template>
  <div class="login-page">
    <div class="bg-shape shape-1"></div>
    <div class="bg-shape shape-2"></div>
    <div class="bg-shape shape-3"></div>

    <div class="login-card shadow-lg">
      <div class="brand">
        <div class="logo-circle">
          <span class="logo-text">FS</span>
        </div>
        <div>
          <p class="brand-top">Fahfi Shop</p>
          <p class="brand-sub">POS | Fashion & Lifestyle</p>
        </div>
      </div>

      <div class="headline">
        <h1>เข้าสู่ระบบ</h1>
        <p>แดชบอร์ดจัดการหน้าร้าน ครบทุกออเดอร์</p>
      </div>

      <form class="login-form" @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="username">Username</label>
          <input
            id="username"
            type="text"
            v-model="username"
            placeholder="ระบุชื่อผู้ใช้"
            autocomplete="username"
            required
          />
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input
            id="password"
            type="password"
            v-model="password"
            placeholder="รหัสผ่าน"
            autocomplete="current-password"
            required
          />
        </div>

        <div v-if="errorMessage" class="error-box">
          {{ errorMessage }}
        </div>

        <button type="submit" class="btn-login">เข้าสู่ระบบ</button>
      </form>
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

const { login } = useAuth();

const handleLogin = async () => {
  try {
    const response = await axios.post("/api/login", {
      username: username.value,
      password: password.value,
    });

    login(response.data.token, response.data.user);
    window.location.href = "/";
  } catch (error) {
    console.error("Login failed:", error);
    errorMessage.value = "Username หรือ Password ไม่ถูกต้อง";
  }
};
</script>

<style>
:root {
  --bg: #0c0f1a;
  --card: rgba(255, 255, 255, 0.9);
  --accent: #4060ff;
  --accent-2: #f24b88;
  --text: #1f2937;
  --muted: #6b7280;
  --danger: #ef4444;
  --shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
  --radius: 18px;
  --font: "Sarabun", "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif;
}

* {
  box-sizing: border-box;
  font-family: var(--font);
}

body {
  margin: 0;
  background: var(--bg);
}

.login-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  overflow: hidden;
  background: radial-gradient(circle at 20% 20%, #182447 0, #0c0f1a 45%),
    radial-gradient(circle at 80% 0%, #171f37 0, #0c0f1a 45%);
}

.bg-shape {
  position: absolute;
  filter: blur(70px);
  opacity: 0.5;
  z-index: 0;
}

.shape-1 {
  width: 380px;
  height: 380px;
  background: #4060ff;
  top: 5%;
  left: 10%;
}

.shape-2 {
  width: 420px;
  height: 420px;
  background: #f24b88;
  bottom: 0%;
  right: 5%;
}

.shape-3 {
  width: 260px;
  height: 260px;
  background: #22d3ee;
  top: 45%;
  left: 60%;
}

.login-card {
  position: relative;
  z-index: 1;
  width: min(420px, 100%);
  background: var(--card);
  border-radius: var(--radius);
  padding: 32px;
  box-shadow: var(--shadow);
  backdrop-filter: blur(14px);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 20px;
}

.logo-circle {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  display: grid;
  place-items: center;
  color: #fff;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.logo-text {
  font-size: 16px;
}

.brand-top {
  margin: 0;
  font-weight: 700;
  color: var(--text);
  font-size: 16px;
}

.brand-sub {
  margin: 2px 0 0;
  color: var(--muted);
  font-size: 13px;
}

.headline h1 {
  margin: 6px 0 4px;
  color: var(--text);
  font-size: 24px;
  font-weight: 800;
}

.headline p {
  margin: 0;
  color: var(--muted);
  font-size: 14px;
}

.login-form {
  margin-top: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  color: var(--text);
  font-weight: 600;
  font-size: 14px;
}

.form-group input {
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  background: #f8fafc;
  color: var(--text);
  font-size: 14px;
  transition: all 0.2s ease;
}

.form-group input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(64, 96, 255, 0.15);
  background: #fff;
}

.error-box {
  padding: 12px 14px;
  border-radius: 12px;
  background: rgba(239, 68, 68, 0.1);
  color: var(--danger);
  border: 1px solid rgba(239, 68, 68, 0.25);
  font-weight: 600;
  font-size: 14px;
}

.btn-login {
  margin-top: 4px;
  padding: 12px 16px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  color: #fff;
  font-weight: 700;
  font-size: 15px;
  cursor: pointer;
  box-shadow: 0 14px 40px rgba(64, 96, 255, 0.25);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.btn-login:hover {
  transform: translateY(-1px);
  box-shadow: 0 18px 50px rgba(64, 96, 255, 0.32);
}

.btn-login:active {
  transform: translateY(0);
}

@media (max-width: 640px) {
  .login-card {
    padding: 26px 22px;
  }

  .headline h1 {
    font-size: 22px;
  }

  .headline p {
    font-size: 13px;
  }
}
</style>
