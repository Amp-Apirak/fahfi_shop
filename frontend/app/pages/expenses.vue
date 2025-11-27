<template>
  <div class="container-fluid py-4">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold text-primary-emphasis mb-1">
          <i class="fas fa-hand-holding-dollar me-2"></i>บันทึกรายจ่าย (Expenses)
        </h2>
        <p class="text-muted mb-0">จัดการรายการค่าใช้จ่ายต่างๆ ของร้าน</p>
      </div>
      <button class="btn btn-primary" @click="openModal()">
        <i class="fas fa-plus me-2"></i>เพิ่มรายจ่าย
      </button>
    </div>

    <!-- Filters -->
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body">
        <form @submit.prevent="fetchExpenses" class="row g-3 align-items-end">
          <div class="col-md-3">
            <label class="form-label small fw-bold text-muted">หมวดหมู่</label>
            <select class="form-select" v-model="filters.category">
              <option value="">ทั้งหมด</option>
              <option value="ค่าเดินทาง">ค่าเดินทาง</option>
              <option value="ค่าอุปกรณ์">ค่าอุปกรณ์</option>
              <option value="ค่าน้ำ/ค่าไฟ">ค่าน้ำ/ค่าไฟ</option>
              <option value="เงินเดือน">เงินเดือน</option>
              <option value="ค่าเช่า">ค่าเช่า</option>
              <option value="อื่นๆ">อื่นๆ</option>
            </select>
          </div>
          <div class="col-md-3">
            <label class="form-label small fw-bold text-muted">ตั้งแต่วันที่</label>
            <input type="date" class="form-control" v-model="filters.startDate">
          </div>
          <div class="col-md-3">
            <label class="form-label small fw-bold text-muted">ถึงวันที่</label>
            <input type="date" class="form-control" v-model="filters.endDate">
          </div>
          <div class="col-md-3">
            <div class="d-flex gap-2">
              <button type="submit" class="btn btn-primary w-100 fw-bold">
                <i class="fas fa-search me-1"></i> ค้นหา
              </button>
              <button type="button" class="btn btn-outline-secondary" @click="resetFilters" title="ล้างค่า">
                <i class="fas fa-undo"></i>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Expenses Table -->
    <div class="card border-0 shadow-sm">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light">
              <tr>
                <th class="py-3 ps-4">วันที่</th>
                <th class="py-3">หมวดหมู่</th>
                <th class="py-3">รายละเอียด</th>
                <th class="py-3 text-end">จำนวนเงิน</th>
                <th class="py-3 text-center">ผู้บันทึก</th>
                <th class="py-3 text-center">ใบเสร็จ</th>
                <th class="py-3 text-center pe-4">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="expenses.length === 0">
                <td colspan="7" class="text-center py-5 text-muted">
                  <i class="fas fa-file-invoice-dollar fa-3x mb-3 opacity-25"></i>
                  <p>ไม่พบข้อมูลรายจ่าย</p>
                </td>
              </tr>
              <tr v-for="expense in expenses" :key="expense.id">
                <td class="ps-4">
                  <div class="d-flex flex-column">
                    <span class="fw-medium">{{ formatDate(expense.expense_date) }}</span>
                  </div>
                </td>
                <td>
                  <span class="badge bg-secondary bg-opacity-10 text-secondary border border-secondary border-opacity-25">
                    {{ expense.category }}
                  </span>
                </td>
                <td>{{ expense.details }}</td>
                <td class="text-end fw-bold text-danger">
                  -฿{{ formatPrice(expense.amount) }}
                </td>
                <td class="text-center">
                   <span class="badge bg-light text-dark border">
                    <i class="fas fa-user-circle me-1"></i>{{ expense.created_by_username || '-' }}
                  </span>
                </td>
                <td class="text-center">
                  <img
                    v-if="expense.receipt_image_url"
                    :src="formatImageUrl(expense.receipt_image_url)"
                    alt="Receipt"
                    class="receipt-thumbnail border shadow-sm"
                    @click="viewImage(expense.receipt_image_url)"
                  />
                  <span v-else class="text-muted small">-</span>
                </td>
                <td class="text-center pe-4">
                  <div class="btn-group">
                    <button
                      class="btn btn-sm btn-outline-warning"
                      @click="openModal(expense)"
                      title="แก้ไข"
                    >
                      <i class="fas fa-pen"></i>
                    </button>
                    <button
                      class="btn btn-sm btn-outline-danger"
                      @click="deleteExpense(expense.id)"
                      title="ลบ"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Form -->
    <div
      class="modal fade"
      id="expenseModal"
      tabindex="-1"
      aria-hidden="true"
      ref="expenseModalRef"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title fw-bold">
              <i class="fas" :class="isEditing ? 'fa-edit' : 'fa-plus-circle'"></i>
              {{ isEditing ? "แก้ไขรายจ่าย" : "เพิ่มรายจ่ายใหม่" }}
            </h5>
            <button
              type="button"
              class="btn-close btn-close-white"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body p-4">
            <form @submit.prevent="saveExpense">
              <div class="mb-3">
                <label class="form-label fw-bold text-muted small">วันที่</label>
                <input
                  type="date"
                  class="form-control"
                  v-model="currentExpense.expense_date"
                  required
                />
              </div>
              <div class="mb-3">
                <label class="form-label fw-bold text-muted small">หมวดหมู่</label>
                <select class="form-select" v-model="currentExpense.category">
                  <option value="ค่าเดินทาง">ค่าเดินทาง</option>
                  <option value="ค่าอุปกรณ์">ค่าอุปกรณ์</option>
                  <option value="ค่าน้ำ/ค่าไฟ">ค่าน้ำ/ค่าไฟ</option>
                  <option value="เงินเดือน">เงินเดือน</option>
                  <option value="ค่าเช่า">ค่าเช่า</option>
                  <option value="อื่นๆ">อื่นๆ</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label fw-bold text-muted small">รายละเอียด</label>
                <textarea
                  class="form-control"
                  rows="3"
                  v-model="currentExpense.details"
                  required
                  placeholder="เช่น ค่าน้ำมันรถไปซื้อของ"
                ></textarea>
              </div>
              <div class="mb-3">
                <label class="form-label fw-bold text-muted small">จำนวนเงิน (บาท)</label>
                <div class="input-group">
                  <span class="input-group-text bg-light">฿</span>
                  <input
                    type="number"
                    class="form-control"
                    v-model="currentExpense.amount"
                    required
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              
              <!-- Image Upload -->
              <div class="mb-3">
                <label class="form-label fw-bold text-muted small">รูปใบเสร็จ (ถ้ามี)</label>
                <div class="card p-2 bg-light border mb-2 text-center" v-if="currentExpense.receipt_image_url">
                    <img :src="formatImageUrl(currentExpense.receipt_image_url)" class="img-fluid rounded shadow-sm" style="max-height: 150px; object-fit: contain;">
                </div>
                <div class="input-group mb-2">
                    <input type="file" class="form-control" @change="handleImageUpload" accept="image/*">
                </div>
              </div>

              <div class="text-end mt-4 pt-2 border-top">
                <button
                  type="button"
                  class="btn btn-light me-2"
                  data-bs-dismiss="modal"
                >
                  ยกเลิก
                </button>
                <button type="submit" class="btn btn-primary fw-bold px-4">
                  {{ isEditing ? "บันทึกการแก้ไข" : "บันทึก" }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Image Preview Modal -->
    <div class="modal fade" id="imagePreviewModal" tabindex="-1" ref="imagePreviewModalRef">
      <div class="modal-dialog modal-dialog-centered modal-lg">
        <div class="modal-content bg-transparent border-0 shadow-none">
          <div class="modal-body p-0 text-center position-relative">
             <button type="button" class="btn-close btn-close-white position-absolute top-0 end-0 m-3 bg-dark p-2 rounded-circle opacity-75" data-bs-dismiss="modal" aria-label="Close"></button>
             <img :src="previewImageUrl" class="img-fluid rounded shadow-lg" style="max-height: 85vh;">
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import Swal from "sweetalert2";

definePageMeta({
  layout: "default",
});

const expenses = ref([]);
const expenseModalRef = ref(null);
const imagePreviewModalRef = ref(null);
let expenseModal = null;
let imagePreviewModal = null;

const isEditing = ref(false);
const currentExpense = ref({
  id: null,
  expense_date: new Date().toISOString().split('T')[0],
  category: "อื่นๆ",
  details: "",
  amount: 0,
  receipt_image_url: "",
});
const previewImageUrl = ref("");

// Filters
const filters = ref({
  category: "",
  startDate: "",
  endDate: "",
});

// Helper: Format Date
const formatDate = (dateString) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

// Helper: Format Price
const formatPrice = (price) => {
  return Number(price).toLocaleString("th-TH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

// Helper: Format Image URL (Fix Localhost Issue)
const formatImageUrl = (url) => {
  if (!url) return null;
  if (url.includes('localhost:3001/uploads')) {
    return url.replace('http://localhost:3001/uploads', '/api/uploads');
  }
  return url;
};

// Fetch Expenses
const fetchExpenses = async () => {
  try {
    const token = useCookie("token");
    const params = new URLSearchParams();
    if (filters.value.category) params.append("category", filters.value.category);
    if (filters.value.startDate) params.append("startDate", filters.value.startDate);
    if (filters.value.endDate) params.append("endDate", filters.value.endDate);

    const response = await axios.get(`/api/expenses?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token.value}` },
    });
    expenses.value = response.data;
  } catch (error) {
    console.error("Error fetching expenses:", error);
    Swal.fire("Error", "ไม่สามารถดึงข้อมูลรายจ่ายได้", "error");
  }
};

const resetFilters = () => {
  filters.value = { category: "", startDate: "", endDate: "" };
  fetchExpenses();
};

// Open Modal
const openModal = (expense = null) => {
  if (expense) {
    isEditing.value = true;
    // Clone object and format date for input type="date"
    currentExpense.value = { 
        ...expense,
        expense_date: expense.expense_date.split('T')[0] 
    };
  } else {
    isEditing.value = false;
    currentExpense.value = {
      id: null,
      expense_date: new Date().toISOString().split('T')[0],
      category: "อื่นๆ",
      details: "",
      amount: 0,
      receipt_image_url: "",
    };
  }
  expenseModal.show();
};

// Handle Image Upload
const handleImageUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("image", file);

  try {
    const token = useCookie("token");
    const response = await axios.post("/api/upload", formData, {
      headers: {
        Authorization: `Bearer ${token.value}`,
        "Content-Type": "multipart/form-data",
      },
    });
    // Use the relative path returned or construct it if backend returns full URL
    let imageUrl = response.data.imageUrl;
    // Fix if backend returns localhost absolute URL
    if (imageUrl.includes('localhost:3001/uploads')) {
        imageUrl = imageUrl.replace('http://localhost:3001/uploads', '/api/uploads');
    }
    currentExpense.value.receipt_image_url = imageUrl;
    
  } catch (error) {
    console.error("Upload error:", error);
    Swal.fire("Error", "อัปโหลดรูปภาพไม่สำเร็จ", "error");
  }
};

// Save Expense
const saveExpense = async () => {
  try {
    const token = useCookie("token");
    if (isEditing.value) {
      await axios.put(
        `/api/expenses/${currentExpense.value.id}`,
        currentExpense.value,
        { headers: { Authorization: `Bearer ${token.value}` } }
      );
      Swal.fire("Success", "แก้ไขรายจ่ายสำเร็จ", "success");
    } else {
      await axios.post("/api/expenses", currentExpense.value, {
        headers: { Authorization: `Bearer ${token.value}` },
      });
      Swal.fire("Success", "บันทึกรายจ่ายสำเร็จ", "success");
    }
    expenseModal.hide();
    fetchExpenses();
  } catch (error) {
    console.error("Error saving expense:", error);
    Swal.fire("Error", "บันทึกข้อมูลไม่สำเร็จ", "error");
  }
};

// Delete Expense
const deleteExpense = async (id) => {
  const result = await Swal.fire({
    title: "ยืนยันการลบ?",
    text: "คุณต้องการลบรายการนี้ใช่หรือไม่?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "ลบเลย",
    cancelButtonText: "ยกเลิก",
  });

  if (result.isConfirmed) {
    try {
      const token = useCookie("token");
      await axios.delete(`/api/expenses/${id}`, {
        headers: { Authorization: `Bearer ${token.value}` },
      });
      Swal.fire("Deleted!", "ลบรายการสำเร็จ", "success");
      fetchExpenses();
    } catch (error) {
      console.error("Error deleting expense:", error);
      Swal.fire("Error", "ลบรายการไม่สำเร็จ", "error");
    }
  }
};

// View Image
const viewImage = (url) => {
    previewImageUrl.value = formatImageUrl(url);
    imagePreviewModal.show();
}

onMounted(() => {
  // Initialize Bootstrap Modals
  // Use window.bootstrap since it's loaded via CDN
  const Modal = window.bootstrap.Modal;
  if (Modal) {
    expenseModal = new Modal(expenseModalRef.value);
    imagePreviewModal = new Modal(imagePreviewModalRef.value);
  } else {
    console.error("Bootstrap Modal is not available");
  }
  
  fetchExpenses();
});
</script>

<style scoped>
.receipt-thumbnail {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 6px;
  cursor: pointer;
  transition: transform 0.2s;
}

.receipt-thumbnail:hover {
  transform: scale(1.1);
}
</style>
