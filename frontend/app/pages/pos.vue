<template>
  <div class="container-fluid mt-4">
    <div class="row">
      
      <div class="col-md-7">
        <h3>เลือกสินค้า</h3>
        <div v-if="pending" class="text-center"><div class="spinner-border"></div></div>
        <div v-if="error" class="alert alert-danger">Error: {{ error.message }}</div>
        
        <div class="row" style="max-height: 80vh; overflow-y: auto;">
          <div v-for="product in products" :key="product.id" class="col-md-4 mb-3">
            <div 
              class="card h-100" 
              @click="addToCart(product)" 
              style="cursor: pointer;"
              :class="{'border-success': product.stock_quantity > 0, 'border-danger': product.stock_quantity <= 0}"
            >
              <div class="card-body">
                <h6 class="card-title">{{ product.name }}</h6>
                <small class="text-muted">{{ product.sell_price }} บาท</small>
                <small 
                  class="d-block" 
                  :class="{'text-success': product.stock_quantity > 0, 'text-danger': product.stock_quantity <= 0}"
                >
                  สต็อก: {{ product.stock_quantity }}
                </small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-5">
        <h3>ตะกร้าสินค้า</h3>
        <div class="card shadow-sm">
          <div class="card-body">
            
            <div v-if="cart.length === 0" class="text-center text-muted">
              - ยังไม่มีสินค้าในตะกร้า -
            </div>

            <ul class="list-group list-group-flush" style="max-height: 40vh; overflow-y: auto;">
              <li v-for="(item, index) in cart" :key="index" class="list-group-item">
                <div class="d-flex w-100 justify-content-between">
                  <h6 class="mb-1">{{ item.name }} ({{ item.sell_price }} บ.)</h6>
                  <button class="btn-close btn-sm" @click="removeFromCart(index)"></button>
                </div>
                
                <div class="d-flex align-items-center">
                  <span class="me-2">จำนวน:</span>
                  <input 
                    type="number" 
                    class="form-control form-control-sm me-2" 
                    v-model.number="item.quantity" 
                    style="width: 70px;"
                    min="1"
                    @change="updateQuantity(item)"
                  >
                  <span class="me-2">ส่วนลด (บ.):</span>
                  <input 
                    type="number" 
                    class="form-control form-control-sm" 
                    v-model.number="item.discount_amount" 
                    style="width: 90px;"
                    min="0"
                  >
                </div>
              </li>
            </ul>

            <hr>
            <h4 class="text-end">
              ยอดรวมสุทธิ: <span class="text-success">{{ totalAmount.toFixed(2) }}</span> บาท
            </h4>

            <div class="d-grid mt-3">
              <button 
                class="btn btn-success btn-lg" 
                @click="submitSale" 
                :disabled="cart.length === 0 || isSubmitting"
              >
                <span v-if="isSubmitting" class="spinner-border spinner-border-sm"></span>
                {{ isSubmitting ? 'กำลังบันทึก...' : 'ยืนยันการขาย' }}
              </button>
            </div>
            <div v-if="saleError" class="alert alert-danger mt-3">
              {{ saleError }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import axios from 'axios';
import { ref, onMounted, computed } from 'vue';

// 1. การตั้งค่า Layout
definePageMeta({
  layout: 'default'
});

const token = useCookie('token');
const { handleApiError } = useApiError();

// 2. State สำหรับ "รายการสินค้า" (ฝั่งซ้าย)
const products = ref([]);
const pending = ref(true);
const error = ref(null);

// 3. State สำหรับ "ตะกร้าสินค้า" (ฝั่งขวา)
const cart = ref([]); // นี่คือหัวใจของหน้านี้
const isSubmitting = ref(false); // สถานะกำลังบันทึก
const saleError = ref(null);

// 4. ฟังก์ชันดึงข้อมูลสินค้า (เมื่อเปิดหน้า)
const fetchProducts = async () => {
  pending.value = true;
  try {
    const response = await axios.get('http://localhost:3001/api/products', {
      headers: { 'Authorization': `Bearer ${token.value}` }
    });
    // กรองเอาเฉพาะสินค้าที่ "มีสต็อก" (มากกว่า 0)
    products.value = response.data; //.filter(p => p.stock_quantity > 0); (อาจจะเก็บไว้กรองทีหลัง)
  } catch (err) {
    // ตรวจสอบ Auth Error (403, 401)
    const isAuthError = await handleApiError(err);
    if (isAuthError) return;

    error.value = err.response ? err.response.data : err;
  } finally {
    pending.value = false;
  }
};

onMounted(() => {
  fetchProducts();
});

// 5. ฟังก์ชันจัดการ "ตะกร้าสินค้า" (Cart)

const addToCart = (product) => {
  if (product.stock_quantity <= 0) {
    alert('สินค้านี้หมดสต็อก');
    return;
  }
  
  // ตรวจสอบว่ามีในตะกร้าหรือยัง
  const existingItem = cart.value.find(item => item.product_id === product.id);

  if (existingItem) {
    // ถ้ามีแล้ว ให้เพิ่มจำนวน
    existingItem.quantity++;
  } else {
    // ถ้ายังไม่มี ให้เพิ่มเข้าไปใหม่
    cart.value.push({
      product_id: product.id,
      name: product.name,
      sell_price: product.sell_price,
      quantity: 1,
      discount_amount: 0, // (สำคัญ) ส่วนลดต่อชิ้น ตามข้อกำหนด 3
      stock: product.stock_quantity // เก็บสต็อกไว้เช็ค
    });
  }
};

const removeFromCart = (index) => {
  cart.value.splice(index, 1); // ลบออกจาก Array
};

const updateQuantity = (item) => {
  // ตรวจสอบว่าใส่จำนวนเกินสต็อกหรือไม่
  if (item.quantity > item.stock) {
    alert(`สต็อกไม่พอ! (มี ${item.stock} ชิ้น)`);
    item.quantity = item.stock; // บังคับให้เป็นค่าสูงสุด
  }
  if (item.quantity < 1) {
    item.quantity = 1;
  }
};

// 6. (สำคัญ) การคำนวณยอดรวม (Computed Property)
// (ฟังก์ชันนี้จะรันใหม่ "อัตโนมัติ" ทุกครั้งที่ 'cart.value' เปลี่ยนแปลง)
const totalAmount = computed(() => {
  return cart.value.reduce((total, item) => {
    // (ราคา * จำนวน) - ส่วนลด
    const lineTotal = (item.sell_price * item.quantity) - item.discount_amount;
    return total + lineTotal;
  }, 0); // 0 คือค่าเริ่มต้น
});

// 7. ฟังก์ชัน "ยืนยันการขาย" (Submit)
const submitSale = async () => {
  isSubmitting.value = true;
  saleError.value = null;

  try {
    // 1. เตรียม "ตะกร้า" (Cart) ให้ตรงกับที่ Backend (ขั้นตอน 15) ต้องการ
    const saleData = {
      cart: cart.value.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        discount_amount: item.discount_amount
      })),
      totalAmount: totalAmount.value // ส่งยอดรวมที่คำนวณแล้ว
    };

    // 2. ยิง API (Backend ขั้นตอนที่ 15)
    await axios.post(
      'http://localhost:3001/api/sales',
      saleData,
      { headers: { 'Authorization': `Bearer ${token.value}` } }
    );

    // 3. ถ้าสำเร็จ
    alert('บันทึกการขายสำเร็จ!');
    cart.value = []; // ล้างตะกร้า
    await fetchProducts(); // รีเฟรชรายการสินค้า (เพื่อให้เห็นสต็อกที่อัปเดต)

  } catch (err) {
    // ตรวจสอบ Auth Error (403, 401)
    const isAuthError = await handleApiError(err);
    if (isAuthError) return;

    const message = err.response ? err.response.data.message : err.message;
    saleError.value = `เกิดข้อผิดพลาด: ${message}`;
    // (เช่น Error "สต็อกสินค้า...ไม่เพียงพอ" ที่เราทำไว้ใน Backend)
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
* {
  font-family: 'Sarabun', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* (Optional) ทำให้การ์ดสินค้าดูดีขึ้น */
.card:hover {
  transform: scale(1.03);
  box-shadow: 0 4px 8px rgba(0,0,0,.12);
  transition: all 0.2s ease-in-out;
}
</style>