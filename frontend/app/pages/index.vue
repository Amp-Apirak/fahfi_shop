<template>
  <div class="container mt-5">
    <div class="row">
      <div class="col-md-12">
        <h1 class="mb-4">ยินดีต้อนรับสู่ Dashboard (สรุปผลวันนี้)</h1>
        
        <div v-if="pending" class="text-center"><div class="spinner-border"></div></div>
        <div v-if="error" class="alert alert-danger">
          เกิดข้อผิดพลาดในการดึงข้อมูลสรุป: {{ error.message }}
        </div>

        <div v-if="summary" class="row">
          <div class="col-md-4 mb-3">
            <div class="card text-white bg-success shadow">
              <div class="card-body">
                <h5 class="card-title">ยอดขาย (วันนี้)</h5>
                <h2 class="card-text">{{ formatNumber(summary.totalSales) }} บาท</h2>
              </div>
            </div>
          </div>
          <div class="col-md-4 mb-3">
            <div class="card text-white bg-danger shadow">
              <div class="card-body">
                <h5 class="card-title">รายจ่าย (วันนี้)</h5>
                <h2 class="card-text">{{ formatNumber(summary.totalExpenses) }} บาท</h2>
              </div>
            </div>
          </div>
          <div class="col-md-4 mb-3">
            <div class="card text-white bg-info shadow">
              <div class="card-body">
                <h5 class="card-title">กำไร/ขาดทุน (วันนี้)</h5>
                <h2 class="card-text">{{ formatNumber((summary.totalSales || 0) - (summary.totalExpenses || 0)) }} บาท</h2>
              </div>
            </div>
          </div>
        </div>

        <div class="row mt-4">
          <div class="col-md-4">
            <div class="card">
              <div class="card-body text-center">
                <h5 class="card-title">จัดการสินค้า</h5>
                <p class="card-text">เพิ่ม แก้ไข ลบสินค้า</p>
                <NuxtLink to="/products" class="btn btn-primary">เข้าสู่หน้าสินค้า</NuxtLink>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card">
              <div class="card-body text-center">
                <h5 class="card-title">จัดการรายจ่าย</h5>
                <p class="card-text">บันทึกรายจ่ายต่างๆ</p>
                <NuxtLink to="/expenses" class="btn btn-primary">เข้าสู่หน้ารายจ่าย</NuxtLink>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card">
              <div class="card-body text-center">
                <h5 class="card-title">ประวัติการขาย</h5>
                <p class="card-text">ดู/แก้ไข บิลย้อนหลัง</p>
                <NuxtLink to="/sales-history" class="btn btn-primary">เข้าสู่หน้าประวัติ</NuxtLink>
              </div>
            </div>
          </div>
        </div>

        <div v-if="summary && summary.lowStockProducts.length > 0" class="row mt-5">
          <div class="col-md-12">
            <h4><span class="text-danger">!!</span> สินค้าใกล้หมด (น้อยกว่า 10 ชิ้น)</h4>
            <div class="card shadow-sm">
              <div class="card-body">
                <table class="table table-sm table-hover">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>ชื่อสินค้า</th>
                      <th>สต็อกคงเหลือ</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in summary.lowStockProducts" :key="item.id">
                      <td>{{ item.id }}</td>
                      <td>{{ item.name }}</td>
                      <td><span class="badge bg-danger">{{ item.stock_quantity }} ชิ้น</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import axios from 'axios';

definePageMeta({
  layout: 'default'
});

const summary = ref(null);
const pending = ref(true);
const error = ref(null);
const token = useCookie('token');

// ฟังก์ชันดึงข้อมูลสรุป
const fetchSummary = async () => {
  pending.value = true;
  error.value = null;

  console.log('🔑 Token:', token.value);

  if (!token.value) {
    console.warn('⚠️ ไม่มี Token - กรุณา Login');
    pending.value = false;
    return;
  }

  try {
    const response = await axios.get('http://localhost:3001/api/dashboard/summary', {
      headers: { 'Authorization': `Bearer ${token.value}` }
    });
    summary.value = response.data;
    console.log('✅ Dashboard data:', response.data);
  } catch (err) {
    console.error('❌ Error fetching dashboard:', err);
    console.error('Error details:', err.response?.data || err.message);
    error.value = err;
  } finally {
    pending.value = false;
  }
};

// ฟังก์ชันแปลงตัวเลขให้เป็นทศนิยม 2 ตำแหน่ง
const formatNumber = (value) => {
  const num = Number(value) || 0;
  return num.toFixed(2);
};

// เรียกใช้เมื่อ component โหลด
onMounted(() => {
  fetchSummary();
});
</script>

<style scoped>
/* (Optional) ทำให้การ์ดสรุปผลดูเด่นขึ้น */
.card-text {
  font-weight: 600;
}
</style>