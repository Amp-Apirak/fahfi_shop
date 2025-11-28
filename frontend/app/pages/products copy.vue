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
        <!-- Search Bar -->
        <div class="mb-3">
          <div class="input-group">
            <span class="input-group-text bg-white"><i class="fas fa-search text-muted"></i></span>
            <input type="text" class="form-control" v-model="searchQuery" placeholder="ค้นหาสินค้า (ชื่อ, หมวดหมู่, รายละเอียด)...">
          </div>
        </div>
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
                <th class="text-center cursor-pointer" style="width: 80px;" @click="sortBy('id')">ID <i class="fas" :class="getSortIcon('id')"></i></th>
                <th class="text-center" style="width: 100px;">รูปภาพ</th>
                <th class="cursor-pointer" @click="sortBy('name')">ชื่อสินค้า <i class="fas" :class="getSortIcon('name')"></i></th>
                <th class="cursor-pointer" @click="sortBy('category')">หมวดหมู่ <i class="fas" :class="getSortIcon('category')"></i></th>
                <th class="text-end cursor-pointer" @click="sortBy('sell_price')">ราคาขาย <i class="fas" :class="getSortIcon('sell_price')"></i></th>
                <th class="text-center cursor-pointer" @click="sortBy('stock_quantity')">สต็อก <i class="fas" :class="getSortIcon('stock_quantity')"></i></th>
                <th class="text-center" style="width: 120px;">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!filteredProducts || filteredProducts.length === 0">
                <td colspan="7" class="text-center text-muted py-4">ไม่พบข้อมูลสินค้า</td>
              </tr>
              <tr v-for="product in filteredProducts" :key="product.id">
                <td class="text-center">{{ product.id }}</td>
                <td class="text-center">
                  <div class="product-image-cell">
                    <div
                      v-if="product.product_image_url"
                      class="product-image-wrapper"
                      :key="product.product_image_url"
                    >
                      <img
                        :src="formatImageUrl(product.product_image_url)"
                        :alt="product.name"
                        class="product-thumbnail"
                        loading="lazy"
                        @error="handleImageError"
                      />
                    </div>
                    <div v-else class="product-image-placeholder">
                      <i class="fas fa-image"></i>
                      <small>No Image</small>
                    </div>
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
                      :src="imagePreview || formatImageUrl(currentProduct.product_image_url)"
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
                        type="text"
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
import { ref, onMounted, computed } from "vue";
import Swal from "sweetalert2";
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

// Search & Sort State
const searchQuery = ref("");
const sortKey = ref("id");
const sortOrder = ref("desc");

const filteredProducts = computed(() => {
  if (!products.value) return [];
  
  let result = [...products.value];

  // Search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(p => 
      p.name.toLowerCase().includes(query) ||
      (p.category && p.category.toLowerCase().includes(query)) ||
      (p.details && p.details.toLowerCase().includes(query)) ||
      p.id.toString().includes(query)
    );
  }

  // Sort
  if (sortKey.value) {
    result.sort((a, b) => {
      let modifier = sortOrder.value === "asc" ? 1 : -1;
      let valA = a[sortKey.value];
      let valB = b[sortKey.value];
      
      // Handle nulls
      if (valA === null) valA = "";
      if (valB === null) valB = "";

      // Check if numbers
      if (!isNaN(valA) && !isNaN(valB) && valA !== "" && valB !== "") {
          valA = Number(valA);
          valB = Number(valB);
      } else {
          valA = valA.toString().toLowerCase();
          valB = valB.toString().toLowerCase();
      }

      if (valA < valB) return -1 * modifier;
      if (valA > valB) return 1 * modifier;
      return 0;
    });
  }

  return result;
});

const sortBy = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === "asc" ? "desc" : "asc";
  } else {
    sortKey.value = key;
    sortOrder.value = "asc";
  }
};

const getSortIcon = (key) => {
  if (sortKey.value !== key) return "fa-sort text-muted opacity-25";
  return sortOrder.value === "asc" ? "fa-sort-up text-primary" : "fa-sort-down text-primary";
};

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
    const response = await axios.get("/api/products", {
      headers: { Authorization: `Bearer ${token.value}` },
    });
    products.value = response.data; // เก็บข้อมูล
    console.log('✅ Products loaded:', products.value.length, 'items');

    // Debug: check image URLs
    products.value.forEach((product) => {
      if (product.product_image_url) {
        console.log(`✅ Product ${product.id} (${product.name}) image URL:`, product.product_image_url);
      } else {
        console.warn(`⚠️ Product ${product.id} (${product.name}) has no image URL`);
      }
    });
  } catch (err) {
    // ตรวจสอบ Auth Error (403, 401)
    const isAuthError = await handleApiError(err);
    if (isAuthError) return;

    error.value = err.response ? err.response.data : err;
    console.error('❌ Error loading products:', error.value);
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
        "/api/upload",
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
    console.log('✅ Image uploaded successfully:', response.data.imageUrl);
    console.log('📦 Product object after image upload:', currentProduct.value);
    modalError.value = null;
  } catch (err) {
    // ตรวจสอบ Auth Error (403, 401)
    const isAuthError = await handleApiError(err);
    if (isAuthError) return;

    modalError.value =
      "ไม่สามารถอัปโหลดรูปภาพได้: " +
      (err.response ? err.response.data.message : err.message);
    console.error('❌ Image upload failed:', err);
  } finally {
    uploadingImage.value = false;
  }
};

// (เพิ่มใหม่) ฟังก์ชันจัดการเมื่อรูปภาพโหลดไม่ได้
const handleImageError = (event) => {
  console.warn('⚠️ Image failed to load:', event.target.src);
  event.target.style.display = 'none';
  // ให้แสดง placeholder แทน
  const placeholder = event.target.parentElement.nextElementSibling;
  if (placeholder) {
    placeholder.style.display = 'flex';
  }
};

// (เพิ่มใหม่) ฟังก์ชันแปลง URL รูปภาพให้ถูกต้อง (แก้ปัญหา Localhost)
const formatImageUrl = (url) => {
  if (!url) return null;
  // ถ้า URL เป็น localhost:3001 (จากข้อมูลเก่า) ให้เปลี่ยนเป็น /api/uploads
  if (url.includes('localhost:3001/uploads')) {
    return url.replace('http://localhost:3001/uploads', '/api/uploads');
  }
  // ถ้าเป็น URL ปกติ หรือ Relative URL อยู่แล้ว ก็คืนค่าเดิม
  return url;
};

// 6. Lifecycle Hook
let bsModal = null;

onMounted(() => {
  // ดึงข้อมูลสินค้า
  fetchProducts();

  // เชื่อม Modal (ตรวจสอบว่า Bootstrap โหลดแล้ว)
  const modalElement = document.getElementById("productModal");
  if (modalElement && typeof window !== "undefined" && window.bootstrap) {
    // ตรวจสอบว่า Bootstrap Modal ดำเนิน
    if (!window.bootstrap.Modal) {
      console.error('❌ Bootstrap.Modal is not available!');
    } else {
      bsModal = new window.bootstrap.Modal(modalElement);
      console.log('✅ Bootstrap Modal initialized successfully');

      // ตรวจสอบ Modal events
      modalElement.addEventListener('hidden.bs.modal', () => {
        console.log('📢 Modal hidden event fired');
      });

      modalElement.addEventListener('show.bs.modal', () => {
        console.log('📢 Modal show event fired');
      });
    }
  } else {
    console.warn('⚠️ Bootstrap not loaded or Modal element not found');
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

  console.log('📝 Edit modal opened for product:', {
    id: product.id,
    name: product.name,
    product_image_url: product.product_image_url,
  });
};

// (เมื่อกด "บันทึก" (Submit) ในฟอร์ม)
const handleSubmit = async () => {
  modalError.value = null;

  try {
    console.log('📝 Submitting product:', modalMode.value);
    console.log('📦 Product data being sent:', {
      id: currentProduct.value.id,
      name: currentProduct.value.name,
      product_image_url: currentProduct.value.product_image_url,
      product_image_url_length: currentProduct.value.product_image_url ? currentProduct.value.product_image_url.length : 0,
    });

    if (modalMode.value === "add") {
      const response = await axios.post(
        "/api/products",
        currentProduct.value,
        { headers: { Authorization: `Bearer ${token.value}` } }
      );
      console.log('✅ Product added:', response.data);
    } else if (modalMode.value === "edit") {
      const response = await axios.put(
        `/api/products/${currentProduct.value.id}`,
        currentProduct.value,
        { headers: { Authorization: `Bearer ${token.value}` } }
      );
      console.log('✅ Product updated:', response.data);
    }

    // 1. ดึงข้อมูลใหม่จาก DB ก่อน (สำคัญ!)
    console.log('🔄 Refreshing products list...');
    await fetchProducts();
    console.log('✅ Products refreshed');

    // 2. ปิด Bootstrap Modal อย่างชัดเจน
    console.log('🔄 Closing Bootstrap Modal...');
    const modalElement = document.getElementById('productModal');
    if (modalElement) {
      try {
        // วิธีที่ 1: ใช้ Bootstrap Modal API
        const modal = window.bootstrap?.Modal.getInstance(modalElement);
        if (modal) {
          modal.hide();
          console.log('✅ Modal.hide() called via Bootstrap API');
        } else {
          console.warn('⚠️ Bootstrap Modal instance not found, using fallback');
          // วิธีที่ 2: ใช้ jQuery Bootstrap
          if (typeof $ !== 'undefined' && $.fn.modal) {
            $(modalElement).modal('hide');
            console.log('✅ Modal hidden via jQuery fallback');
          } else {
            // วิธีที่ 3: ลบ class และ style ด้วยมือ
            modalElement.classList.remove('show');
            modalElement.style.display = 'none';
            console.log('✅ Modal hidden via manual CSS');
          }
        }
      } catch (e) {
        console.error('❌ Error closing modal:', e);
      }

      // ลบ backdrop และ scroll lock อย่างชัดเจน
      await new Promise(resolve => setTimeout(resolve, 500));

      // ลบ modal-open class จาก body
      document.body.classList.remove('modal-open');
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';

      // ลบ backdrop element ถ้ายังมี
      const backdrops = document.querySelectorAll('.modal-backdrop');
      backdrops.forEach(backdrop => {
        backdrop.remove();
      });
      if (backdrops.length > 0) {
        console.log(`✅ Removed ${backdrops.length} modal backdrop(s)`);
      }

      console.log('✅ Modal cleanup completed');
    }

    // 3. แสดง Success message (Sweet Alert)
    const successTitle = modalMode.value === "add" ? "เพิ่มสินค้าสำเร็จ!" : "แก้ไขสินค้าสำเร็จ!";
    const successMessage = modalMode.value === "add"
      ? `เพิ่มสินค้า "${currentProduct.value.name}" เสร็จแล้ว`
      : `แก้ไขสินค้า "${currentProduct.value.name}" เสร็จแล้ว`;

    console.log('🎉 Showing success alert...');
    await Swal.fire({
      icon: "success",
      title: successTitle,
      text: successMessage,
      confirmButtonText: "ตกลง",
      confirmButtonColor: "#3b82f6",
      timer: 2000,
      timerProgressBar: true,
      allowOutsideClick: false,
      allowEscapeKey: false,
      didClose: async () => {
        console.log('✨ Alert closed - resetting form');
        // รีเซ็ต form หลังปิด Alert
        currentProduct.value = { ...defaultProductForm };
        imagePreview.value = null;
        modalError.value = null;
      }
    });

    console.log('✨ Submit completed successfully - Modal closed and alert shown');
  } catch (err) {
    // ตรวจสอบ Auth Error (403, 401)
    const isAuthError = await handleApiError(err);
    if (isAuthError) return;

    const errorMessage =
      "เกิดข้อผิดพลาด: " +
      (err.response ? err.response.data.message : err.message);

    modalError.value = errorMessage;
    console.error('❌ Submit error:', err);

    // แสดง Error Alert
    await Swal.fire({
      icon: "error",
      title: "เกิดข้อผิดพลาด!",
      text: errorMessage,
      confirmButtonText: "ตกลง",
      confirmButtonColor: "#ef4444",
    });
  }
};

// 8. ฟังก์ชันสำหรับลบสินค้า
const handleDelete = async (productId, productName) => {
  // 1. (สำคัญ) ถามเพื่อยืนยันก่อนลบ (ใช้ Sweet Alert)
  const result = await Swal.fire({
    icon: "warning",
    title: "ยืนยันการลบ",
    text: `คุณแน่ใจหรือไม่ว่าต้องการลบ "${productName}" (ID: ${productId})?`,
    showCancelButton: true,
    confirmButtonText: "ใช่ ลบเลย",
    cancelButtonText: "ยกเลิก",
    confirmButtonColor: "#ef4444",
    cancelButtonColor: "#6b7280",
  });

  if (!result.isConfirmed) {
    return; // ถ้าเลือก "ยกเลิก" ให้ออกจากฟังก์ชัน
  }

  try {
    // 2. ยิง API "DELETE"
    console.log(`🗑️ Deleting product ID: ${productId}`);
    await axios.delete(
      `/api/products/${productId}`,
      { headers: { 'Authorization': `Bearer ${token.value}` } }
    );

    console.log(`✅ Product ${productId} deleted successfully`);

    // 3. (สำคัญ) ถ้าลบสำเร็จ ให้รีเฟรชตาราง
    await fetchProducts();

    // 4. แสดง Success Alert
    await Swal.fire({
      icon: "success",
      title: "ลบสินค้าสำเร็จ!",
      text: `ลบ "${productName}" เสร็จแล้ว`,
      confirmButtonText: "ตกลง",
      confirmButtonColor: "#3b82f6",
      timer: 2000,
      timerProgressBar: true,
    });

  } catch (err) {
    // ตรวจสอบ Auth Error (403, 401)
    const isAuthError = await handleApiError(err);
    if (isAuthError) return;

    // 5. จัดการ Error (เช่น ลบไม่ได้เพราะมีประวัติการขาย)
    const message = err.response ? err.response.data.message : err.message;
    console.error('❌ Error deleting product:', message);

    // แสดง Error Alert
    await Swal.fire({
      icon: "error",
      title: "ไม่สามารถลบสินค้า!",
      text: message,
      confirmButtonText: "ตกลง",
      confirmButtonColor: "#ef4444",
    });
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

.product-image-wrapper {
  position: relative;
  display: inline-block;
  width: 80px;
  height: 80px;
}

.product-image-placeholder {
  width: 80px;
  height: 80px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: #f3f4f6;
  border-radius: 8px;
  border: 2px dashed #d1d5db;
  color: #9ca3af;
  font-size: 24px;
  gap: 4px;
}

.product-image-placeholder small {
  font-size: 10px;
  color: #9ca3af;
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

.cursor-pointer {
  cursor: pointer;
  user-select: none;
}

.cursor-pointer:hover {
  background-color: #f1f5f9;
}
</style>
