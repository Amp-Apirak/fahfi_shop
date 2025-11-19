<template>
  <div class="container-fluid my-4">
    <div v-if="error" class="alert alert-danger">
      เกิดข้อผิดพลาดในการดึงข้อมูล: {{ error.message }}
    </div>

    <div class="card shadow-sm">
      <div class="card-header bg-white p-3">
        <div class="d-flex justify-content-between align-items-center">
          <h2 class="h4 mb-0 text-primary-emphasis">
            <i class="fas fa-box-open me-2"></i>จัดการสต็อกสินค้า
          </h2>
          <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#productModal" @click="openAddModal">
            <i class="fas fa-plus me-2"></i>เพิ่มสินค้าใหม่
          </button>
        </div>
      </div>

      <div class="card-body">
        <div v-if="pending" class="text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="mt-2">กำลังโหลดข้อมูล...</p>
        </div>

        <div v-else class="table-responsive">
          <table class="table table-hover align-middle">
            <thead class="table-light">
              <tr>
                <th class="text-center" style="width: 80px;">ID</th>
                <th>ชื่อสินค้า</th>
                <th>หมวดหมู่</th>
                <th class="text-end">ราคาขาย</th>
                <th class="text-center">สต็อก</th>
                <th class="text-center" style="width: 120px;">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!products || products.length === 0">
                <td colspan="6" class="text-center text-muted py-4">ไม่พบข้อมูลสินค้า</td>
              </tr>
              <tr v-for="product in products" :key="product.id">
                <td class="text-center">{{ product.id }}</td>
                <td>
                  <h6 class="mb-0">{{ product.name }}</h6>
                  <small v-if="product.details" class="text-muted">{{ product.details }}</small>
                </td>
                <td><span class="badge bg-secondary bg-opacity-25 text-secondary-emphasis">{{ product.category }}</span></td>
                <td class="text-end">฿{{ product.sell_price.toLocaleString() }}</td>
                <td class="text-center">{{ product.stock_quantity }}</td>
                <td class="text-center">
                  <button class="btn btn-sm btn-outline-primary border-0 me-1" data-bs-toggle="modal" data-bs-target="#productModal" @click="openEditModal(product)">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger border-0" @click="handleDelete(product.id, product.name)">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal (structure from original file is preserved to ensure functionality) -->
    <div class="modal fade" id="productModal" tabindex="-1" aria-labelledby="productModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="productModalLabel">
              {{ modalMode === "add" ? "เพิ่มสินค้าใหม่" : "แก้ไขสินค้า" }}
            </h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSubmit">
              <div class="mb-3">
                <label for="name" class="form-label">ชื่อสินค้า</label>
                <input type="text" class="form-control" v-model="currentProduct.name" required />
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="category" class="form-label">หมวดหมู่</label>
                  <input type="text" class="form-control" v-model="currentProduct.category" />
                </div>
                <div class="col-md-6 mb-3">
                  <label for="grade" class="form-label">เกรด</label>
                  <input type="text" class="form-control" v-model="currentProduct.grade" />
                </div>
              </div>
              <div class="row">
                <div class="col-md-4 mb-3">
                  <label for="cost_price" class="form-label">ราคาต้นทุน</label>
                  <input type="number" step="0.01" class="form-control" v-model="currentProduct.cost_price" />
                </div>
                <div class="col-md-4 mb-3">
                  <label for="sell_price" class="form-label">ราคาขาย</label>
                  <input type="number" step="0.01" class="form-control" v-model="currentProduct.sell_price" required />
                </div>
                <div class="col-md-4 mb-3">
                  <label for="stock_quantity" class="form-label">สต็อก</label>
                  <input type="number" class="form-control" v-model="currentProduct.stock_quantity" />
                </div>
              </div>
              <div class="mb-3">
                <label for="details" class="form-label">รายละเอียด</label>
                <textarea class="form-control" rows="2" v-model="currentProduct.details"></textarea>
              </div>

              <div v-if="modalError" class="alert alert-danger mt-3">
                {{ modalError }}
              </div>

              <div class="modal-footer pt-4">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">
                  ยกเลิก
                </button>
                <button type="submit" class="btn btn-primary">
                  <i class="fas fa-save me-2"></i>
                  {{ modalMode === "add" ? "บันทึก" : "บันทึกการแก้ไข" }}
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
// 1. Imports
import axios from "axios";
import { ref, onMounted } from "vue";
// (เรา "ไม่" import { Modal } from 'bootstrap' ที่นี่ เพื่อป้องกัน Error ฝั่ง Server (SSR))

// 2. การตั้งค่า Layout
definePageMeta({
  layout: "default",
});

// 3. ตัวแปร State หลักของหน้า
const products = ref(null);
const pending = ref(true); // สถานะกำลังโหลด (สำคัญ)
const error = ref(null);
const token = useCookie("token");

// 4. ตัวแปร State สำหรับ Modal (กล่องเด้ง)
const modalMode = ref("add"); // 'add' หรือ 'edit'
const modalError = ref(null);

// (นี่คือ "พิมพ์เขียว" หรือ "กล่องเปล่า" สำหรับฟอร์ม)
const defaultProductForm = {
  id: null,
  name: "",
  category: "",
  grade: "",
  cost_price: 0.0,
  sell_price: 0.0,
  stock_quantity: 0,
  details: "",
};

// (นี่คือตัวแปรที่ "ผูก" (v-model) กับฟอร์มใน Modal)
const currentProduct = ref({ ...defaultProductForm });

// 5. (สำคัญ!) ฟังก์ชันดึงข้อมูล (ต้องประกาศ "ก่อน" onMounted)
// ฟังก์ชันสำหรับดึงข้อมูลสินค้าทั้งหมดจาก API
const fetchProducts = async () => {
  pending.value = true; // เริ่มโหลด
  try {
    const response = await axios.get("http://localhost:3001/api/products", {
      headers: { Authorization: `Bearer ${token.value}` },
    });
    products.value = response.data; // เก็บข้อมูล
  } catch (err) {
    error.value = err.response ? err.response.data : err;
  } finally {
    pending.value = false; // โหลดเสร็จแล้ว (ไม่ว่าจะสำเร็จหรือล้มเหลว)
  }
};

// 6. Lifecycle Hook
let bsModal = null;

onMounted(() => {
  // ดึงข้อมูลสินค้า
  fetchProducts();

  // เชื่อม Modal (ตรวจสอบว่า Bootstrap โหลดแล้ว)
  const modalElement = document.getElementById("productModal");
  if (modalElement && typeof window !== "undefined" && window.bootstrap) {
    bsModal = new window.bootstrap.Modal(modalElement);
  }
});

// 7. ฟังก์ชันสำหรับจัดการ Modal (Helper Functions)

// (เมื่อกดปุ่ม "เพิ่มสินค้าใหม่")
const openAddModal = () => {
  modalMode.value = "add";
  currentProduct.value = { ...defaultProductForm }; // รีเซ็ตฟอร์มให้ว่าง
  modalError.value = null;
};

// (เมื่อกดปุ่ม "แก้ไข" ในตาราง)
const openEditModal = (product) => {
  modalMode.value = "edit";
  currentProduct.value = { ...product }; // คัดลอกข้อมูลสินค้ามาใส่ฟอร์ม
  modalError.value = null;
};

// (เมื่อกด "บันทึก" (Submit) ในฟอร์ม)
const handleSubmit = async () => {
  modalError.value = null;

  try {
    if (modalMode.value === "add") {
      await axios.post(
        "http://localhost:3001/api/products",
        currentProduct.value,
        { headers: { Authorization: `Bearer ${token.value}` } }
      );
    } else if (modalMode.value === "edit") {
      await axios.put(
        `http://localhost:3001/api/products/${currentProduct.value.id}`,
        currentProduct.value,
        { headers: { Authorization: `Bearer ${token.value}` } }
      );
    }

    // ปิด Modal (ตรวจสอบว่ามี bsModal ก่อน)
    if (bsModal) {
      bsModal.hide();
    }
    await fetchProducts();
  } catch (err) {
    modalError.value =
      "เกิดข้อผิดพลาด: " +
      (err.response ? err.response.data.message : err.message);
  }
};

// 8. ฟังก์ชันสำหรับลบสินค้า
const handleDelete = async (productId, productName) => {
  // 1. (สำคัญ) ถามเพื่อยืนยันก่อนลบ
  if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ "${productName}" (ID: ${productId})?`)) {
    return; // ถ้ากด "Cancel" ให้ออกจากฟังก์ชัน
  }

  try {
    // 2. ยิง API "DELETE" (Backend ขั้นตอนที่ 10)
    await axios.delete(
      `http://localhost:3001/api/products/${productId}`,
      { headers: { 'Authorization': `Bearer ${token.value}` } }
    );

    // 3. (สำคัญ) ถ้าลบสำเร็จ ให้รีเฟรชตาราง
    await fetchProducts();
    
    // (อาจจะเพิ่ม Toast Notification "ลบสำเร็จ" ที่นี่ในอนาคต)

  } catch (err) {
    // 4. จัดการ Error (เช่น ลบไม่ได้เพราะมีประวัติการขาย)
    const message = err.response ? err.response.data.message : err.message;
    console.error('Error deleting product:', message);
    window.alert(`เกิดข้อผิดพลาด: ${message}`); // แสดง Error ให้ผู้ใช้ทราบ
  }
};
</script>

<style>
* {
  font-family: 'Sarabun', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.table td,
.table th {
  vertical-align: middle;
}
</style>
