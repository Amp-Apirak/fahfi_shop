<template>
  <div class="login-container">
    <!-- Background Elements -->
    <div class="bg-overlay"></div>
    <div class="decorative-circle circle-1"></div>
    <div class="decorative-circle circle-2"></div>

    <div class="login-content">
      <div class="brand-section">
        <div class="logo-wrapper">
          <span class="logo-icon">FS</span>
        </div>
        <h1 class="brand-title">FAHFI SHOP</h1>
        <p class="brand-subtitle">Fashion & Lifestyle POS System</p>
      </div>

      <div class="card-glass">
        <div class="card-header">
          <h2>ยินดีต้อนรับ</h2>
          <p>เข้าสู่ระบบเพื่อจัดการร้านค้าของคุณ</p>
        </div>

        <form @submit.prevent="handleLogin" class="login-form">
          <div class="input-group">
            <label for="username">ชื่อผู้ใช้งาน</label>
            <div class="input-wrapper">
              <i class="fas fa-user input-icon"></i>
              <input
                id="username"
                type="text"
                v-model="username"
                placeholder="Username"
                autocomplete="username"
                required
              />
            </div>
          </div>

          <div class="input-group">
            <label for="password">รหัสผ่าน</label>
            <div class="input-wrapper">
              <i class="fas fa-lock input-icon"></i>
              <input
                id="password"
                type="password"
                v-model="password"
                placeholder="Password"
                autocomplete="current-password"
                required
              />
            </div>
          </div>

          <div v-if="errorMessage" class="error-message">
            <i class="fas fa-exclamation-circle"></i>
            {{ errorMessage }}
          </div>

          <button type="submit" class="btn-submit">
            <span>เข้าสู่ระบบ</span>
            <i class="fas fa-arrow-right"></i>
          </button>
        </form>
      </div>
      
      <div class="footer-text">
        &copy; {{ new Date().getFullYear() }} FAHFI SHOP. All rights reserved.
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

const { login } = useAuth();

const handleLogin = async () => {
  errorMessage.value = null; // Reset error
  try {
    const response = await axios.post("/api/login", {
      username: username.value,
      password: password.value,
    });

    login(response.data.token, response.data.user);
    window.location.href = "/";
  } catch (error) {
    console.error("Login failed:", error);
    errorMessage.value = "ชื่อผู้ใช้งานหรือรหัสผ่านไม่ถูกต้อง";
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&family=Sarabun:wght@300;400;500;700&display=swap');
@import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');

:root {
  --primary-color: #ff4081; /* Pink */
  --secondary-color: #7c4dff; /* Violet */
  --bg-dark: #0f172a;
  --text-light: #f8fafc;
  --text-muted: #94a3b8;
  --glass-bg: rgba(255, 255, 255, 0.05);
  --glass-border: rgba(255, 255, 255, 0.1);
  --input-bg: rgba(15, 23, 42, 0.6);
}

.login-container {
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-dark);
  position: relative;
  overflow: hidden;
  font-family: 'Sarabun', sans-serif;
  color: var(--text-light);
}

/* Background Effects */
.bg-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at top right, #1e1b4b, #0f172a);
  z-index: 0;
}

.decorative-circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.6;
  z-index: 0;
  animation: float 10s infinite ease-in-out;
}

.circle-1 {
  width: 400px;
  height: 400px;
  background: var(--primary-color);
  top: -100px;
  left: -100px;
  animation-delay: 0s;
}

.circle-2 {
  width: 300px;
  height: 300px;
  background: var(--secondary-color);
  bottom: -50px;
  right: -50px;
  animation-delay: 5s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(20px, 40px); }
}

/* Content Layout */
.login-content {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 450px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
}

/* Brand Section */
.brand-section {
  text-align: center;
  animation: slideDown 0.8s ease-out;
}

.logo-wrapper {
  width: 70px;
  height: 70px;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 15px;
  box-shadow: 0 10px 25px rgba(124, 77, 255, 0.4);
  transform: rotate(-5deg);
  transition: transform 0.3s ease;
}

.logo-wrapper:hover {
  transform: rotate(0deg) scale(1.05);
}

.logo-icon {
  font-family: 'Outfit', sans-serif;
  font-weight: 700;
  font-size: 28px;
  color: white;
}

.brand-title {
  font-family: 'Outfit', sans-serif;
  font-size: 32px;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(to right, #fff, #cbd5e1);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 1px;
}

.brand-subtitle {
  margin: 5px 0 0;
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 300;
}

/* Glass Card */
.card-glass {
  width: 100%;
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  border-radius: 24px;
  padding: 40px 30px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  animation: fadeIn 1s ease-out;
}

.card-header {
  margin-bottom: 30px;
  text-align: center;
}

.card-header h2 {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 8px;
  color: white;
}

.card-header p {
  font-size: 14px;
  color: var(--text-muted);
  margin: 0;
}

/* Form Styles */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  font-size: 14px;
  font-weight: 500;
  color: #cbd5e1;
  margin-left: 4px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 16px;
  color: var(--text-muted);
  font-size: 14px;
  pointer-events: none;
  transition: color 0.3s ease;
}

.input-wrapper input {
  width: 100%;
  padding: 14px 16px 14px 45px;
  background: var(--input-bg);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  color: white;
  font-size: 15px;
  transition: all 0.3s ease;
}

.input-wrapper input:focus {
  outline: none;
  border-color: var(--secondary-color);
  background: rgba(15, 23, 42, 0.8);
  box-shadow: 0 0 0 4px rgba(124, 77, 255, 0.15);
}

.input-wrapper input:focus + .input-icon {
  color: var(--secondary-color);
}

.input-wrapper input::placeholder {
  color: #475569;
}

/* Error Message */
.error-message {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #fca5a5;
  padding: 12px;
  border-radius: 12px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

/* Button */
.btn-submit {
  margin-top: 10px;
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, var(--secondary-color), var(--primary-color));
  border: none;
  border-radius: 16px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  transition: all 0.3s ease;
  box-shadow: 0 10px 20px rgba(124, 77, 255, 0.3);
}

.btn-submit:hover {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px rgba(124, 77, 255, 0.4);
}

.btn-submit:active {
  transform: translateY(0);
}

/* Footer */
.footer-text {
  color: #475569;
  font-size: 12px;
  margin-top: 20px;
}

/* Animations */
@keyframes slideDown {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
}

/* Responsive */
@media (max-width: 480px) {
  .card-glass {
    padding: 30px 20px;
  }
  
  .brand-title {
    font-size: 28px;
  }
}
</style>
