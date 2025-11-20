<template>
  <div class="container-fluid my-4">
    <!-- Font Awesome CDN (Ensure it's loaded) -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css" />

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
                <th class="text-center" style="width: 100px;">รูปภาพ</th>
                <th>ชื่อสินค้า</th>
                <th>หมวดหมู่</th>
                <th class="text-end">ราคาขาย</th>
                <th class="text-center">สต็อก</th>
                <th class="text-center" style="width: 120px;">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!products || products.length === 0">
                <td colspan="7" class="text-center text-muted py-4">ไม่พบข้อมูลสินค้า</td>
              </tr>
              <tr v-for="product in products" :key="product.id">
                <td class="text-center">{{ product.id }}</td>
                <td class="text-center">
                  <div v-if="product.product_image_url" class="product-image-cell">
                    <img
                      :src="product.product_image_url"
                      :alt="product.name"
                      class="product-thumbnail"
                      onerror="this.src='https://via.placeholder.com/80?text=No+Image'"
                    />
                  </div>
                  <div v-else class="product-image-placeholder">
                    <i class="fas fa-image"></i>
                  </div>
                </td>
                <td>
                  <h6 class="mb-0">{{ product.name }}</h6>
                  <small v-if="product.details" class="text-muted">{{ product.details }}</small>
                </td>
                <td><span class="badge bg-secondary bg-opacity-25 text-secondary-emphasis">{{ product.category }}</span></td>
                <td class="text-end">฿{{ product.sell_price.toLocaleString() }}</td>
                <td class="text-center">{{ product.stock_quantity }}</td>
                <td class="text-center">
                  <button class="btn btn-sm btn-outline-primary border-0 me-2 action-btn-edit" title="แก้ไข" data-bs-toggle="modal" data-bs-target="#productModal" @click="openEditModal(product)">
                    <i class="fas fa-pen-to-square"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger border-0 action-btn-delete" title="ลบ" @click="handleDelete(product.id, product.name)">
                    <i class="fas fa-trash"></i>
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

              <!-- Image Upload Section -->
              <div class="mb-3">
                <label for="product_image" class="form-label">รูปภาพสินค้า</label>
                <div class="image-upload-area">
                  <!-- Preview Image -->
                  <div v-if="currentProduct.product_image_url || imagePreview" class="mb-2">
                    <img
                      :src="imagePreview || currentProduct.product_image_url"
                      alt="Product Preview"
                      class="product-preview-img"
                    />
                    <small class="d-block text-muted mt-2">
                      {{ currentProduct.product_image_url ? 'URL รูปภาพปัจจุบัน' : 'ตัวอย่างรูปภาพที่เลือก' }}
                    </small>
                  </div>

                  <!-- File Input or URL Input -->
                  <div class="upload-options">
                    <div class="mb-2">
                      <label class="form-label small">อัปโหลดรูปภาพ</label>
                      <input
                        type="file"
                        class="form-control"
                        accept="image/jpeg,image/png,image/jpg"
                        @change="handleImageUpload"
                        :disabled="uploadingImage"
                      />
                      <small class="text-muted">รองรับไฟล์ JPG, PNG เท่านั้น (ไม่เกิน 5MB)</small>
                      <div v-if="uploadingImage" class="mt-2">
                        <div class="spinner-border spinner-border-sm" role="status">
                          <span class="visually-hidden">กำลังอัปโหลด...</span>
                        </div>
                        <span class="ms-2">กำลังอัปโหลดรูปภาพ...</span>
                      </div>
                    </div>

                    <div class="mb-2">
                      <label class="form-label small">หรือใส่ URL รูปภาพ</label>
                      <input
                        type="url"
                        class="form-control"
                        placeholder="https://example.com/image.jpg"
                        v-model="currentProduct.product_image_url"
                      />
                    </div>
                  </div>
                </div>
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
const { handleApiError } = useApiError();

// 4. ตัวแปร State สำหรับ Modal (กล่องเด้ง)
const modalMode = ref("add"); // 'add' หรือ 'edit'
const modalError = ref(null);
const uploadingImage = ref(false); // สถานะการอัปโหลดรูปภาพ
const imagePreview = ref(null); // Preview รูปภาพที่เลือก

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
    // ตรวจสอบ Auth Error (403, 401)
    const isAuthError = await handleApiError(err);
    if (isAuthError) return;

    error.value = err.response ? err.response.data : err;
  } finally {
    pending.value = false; // โหลดเสร็จแล้ว (ไม่ว่าจะสำเร็จหรือล้มเหลว)
  }
};

// (เพิ่มใหม่) ฟังก์ชันอัปโหลดรูปภาพ
const handleImageUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // ตรวจสอบขนาดไฟล์ (ไม่เกิน 5MB)
  if (file.size > 5 * 1024 * 1024) {
    modalError.value = "ขนาดไฟล์ไม่ควรเกิน 5MB";
    return;
  }

  // สร้าง preview สำหรับแสดงให้ผู้ใช้เห็นก่อน
  const reader = new FileReader();
  reader.onload = (e) => {
    imagePreview.value = e.target.result;
  };
  reader.readAsDataURL(file);

  // อัปโหลดรูปไปยัง Backend
  uploadingImage.value = true;
  try {
    const formData = new FormData();
    formData.append("image", file);

    const response = await axios.post(
      "http://localhost:3001/api/upload",
      formData,
      {
        headers: {
          Authorization: `Bearer ${token.value}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    // ถ้าอัปโหลดสำเร็จ ให้เก็บ URL รูปภาพ
    currentProduct.value.product_image_url = response.data.imageUrl;
    modalError.value = null;
  } catch (err) {
    // ตรวจสอบ Auth Error (403, 401)
    const isAuthError = await handleApiError(err);
    if (isAuthError) return;

    modalError.value =
      "ไม่สามารถอัปโหลดรูปภาพได้: " +
      (err.response ? err.response.data.message : err.message);
  } finally {
    uploadingImage.value = false;
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
  imagePreview.value = null; // รีเซ็ต preview รูปภาพ
};

// (เมื่อกดปุ่ม "แก้ไข" ในตาราง)
const openEditModal = (product) => {
  modalMode.value = "edit";
  currentProduct.value = { ...product }; // คัดลอกข้อมูลสินค้ามาใส่ฟอร์ม
  modalError.value = null;
  imagePreview.value = null; // รีเซ็ต preview รูปภาพ
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
    // ตรวจสอบ Auth Error (403, 401)
    const isAuthError = await handleApiError(err);
    if (isAuthError) return;

    // 4. จัดการ Error (เช่น ลบไม่ได้เพราะมีประวัติการขาย)
    const message = err.response ? err.response.data.message : err.message;
    console.error('Error deleting product:', message);
    window.alert(`เกิดข้อผิดพลาด: ${message}`); // แสดง Error ให้ผู้ใช้ทราบ
  }
};
</script>

<style scoped>
* {
  font-family: 'Sarabun', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.table td,
.table th {
  vertical-align: middle;
}

/* Product Image Styles */
.product-image-cell {
  display: flex;
  justify-content: center;
  align-items: center;
}

.product-thumbnail {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.product-thumbnail:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.product-image-placeholder {
  width: 80px;
  height: 80px;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f3f4f6;
  border-radius: 8px;
  border: 2px dashed #d1d5db;
  color: #9ca3af;
  font-size: 24px;
}

/* Image Upload Styles */
.image-upload-area {
  background: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.product-preview-img {
  max-width: 200px;
  max-height: 200px;
  width: auto;
  height: auto;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.upload-options {
  background: white;
  padding: 12px;
  border-radius: 6px;
}

.upload-options .mb-2 {
  margin-bottom: 12px;
}

.upload-options .form-label {
  color: #374151;
  font-weight: 600;
  margin-bottom: 6px;
}

.upload-options small {
  display: block;
  color: #6b7280;
  margin-top: 4px;
}

/* Action Button Styles */
.action-btn-edit,
.action-btn-delete {
  padding: 8px 10px;
  font-size: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  transition: all 0.2s ease;
}

.action-btn-edit {
  color: #3b82f6;
}

.action-btn-edit:hover {
  background-color: #dbeafe;
  color: #1d4ed8;
  transform: scale(1.1);
}

.action-btn-delete {
  color: #ef4444;
}

.action-btn-delete:hover {
  background-color: #fee2e2;
  color: #b91c1c;
  transform: scale(1.1);
}

.action-btn-edit i,
.action-btn-delete i {
  font-size: 16px;
}
</style>
