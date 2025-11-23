<template>
  <div class="container-fluid py-4">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold text-primary-emphasis mb-1">
          <i class="fas fa-history me-2"></i>ประวัติการขาย
        </h2>
        <p class="text-muted mb-0">ดูรายการขายย้อนหลังและสรุปยอดขาย</p>
      </div>
    </div>

    <!-- Summary Cards -->
    <div class="row g-3 mb-4">
      <div class="col-md-4">
        <div class="card border-0 shadow-sm h-100 bg-primary text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h6 class="text-white-50 mb-1">ยอดขายรวม (Total Sales)</h6>
                <h3 class="fw-bold mb-0">฿{{ totalSales.toLocaleString("th-TH", { minimumFractionDigits: 2 }) }}</h3>
              </div>
              <div class="bg-white bg-opacity-25 rounded p-2">
                <i class="fas fa-coins fa-lg"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card border-0 shadow-sm h-100 bg-success text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h6 class="text-white-50 mb-1">จำนวนบิล (Total Orders)</h6>
                <h3 class="fw-bold mb-0">{{ totalOrders }} <span class="fs-6 fw-normal">รายการ</span></h3>
              </div>
              <div class="bg-white bg-opacity-25 rounded p-2">
                <i class="fas fa-receipt fa-lg"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card border-0 shadow-sm h-100 bg-info text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <h6 class="text-white-50 mb-1">ยอดเฉลี่ยต่อบิล (Avg. Order Value)</h6>
                <h3 class="fw-bold mb-0">฿{{ avgOrderValue.toLocaleString("th-TH", { minimumFractionDigits: 2 }) }}</h3>
              </div>
              <div class="bg-white bg-opacity-25 rounded p-2">
                <i class="fas fa-chart-line fa-lg"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="card border-0 shadow-sm mb-4">
      <div class="card-body">
        <form @submit.prevent="fetchSalesHistory" class="row g-3 align-items-end">
          <div class="col-md-3">
            <label class="form-label small fw-bold text-muted">ตั้งแต่วันที่</label>
            <input type="date" class="form-control" v-model="filters.startDate">
          </div>
          <div class="col-md-3">
            <label class="form-label small fw-bold text-muted">ถึงวันที่</label>
            <input type="date" class="form-control" v-model="filters.endDate">
          </div>
          <div class="col-md-4">
            <label class="form-label small fw-bold text-muted">ค้นหา (เลขบิล / ผู้ขาย)</label>
            <div class="input-group">
              <span class="input-group-text bg-light border-end-0"><i class="fas fa-search text-muted"></i></span>
              <input type="text" class="form-control border-start-0" placeholder="ระบุคำค้นหา..." v-model="filters.search">
            </div>
          </div>
          <div class="col-md-2">
            <div class="d-flex gap-2">
              <button type="submit" class="btn btn-primary w-100 fw-bold">
                ค้นหา
              </button>
              <button type="button" class="btn btn-outline-secondary" @click="resetFilters" title="ล้างค่า">
                <i class="fas fa-undo"></i>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>

    <!-- Sales Table -->
    <div class="card border-0 shadow-sm">
      <div class="card-body p-0">
        <div v-if="pending" class="text-center py-5">
          <div class="spinner-border text-primary mb-2"></div>
          <p class="text-muted">กำลังโหลดข้อมูล...</p>
        </div>
        <div v-else-if="error" class="alert alert-danger m-3">
          <i class="fas fa-exclamation-triangle me-2"></i>{{ error.message }}
        </div>
        <div v-else class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light">
              <tr>
                <th class="py-3 ps-4">บิล ID</th>
                <th class="py-3">วันที่ขาย</th>
                <th class="py-3 text-end">ยอดรวมสุทธิ</th>
                <th class="py-3 text-end">ส่วนลด</th>
                <th class="py-3 text-center">ผู้ขาย</th>
                <th class="py-3 text-center pe-4">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="sales && sales.length === 0">
                <td colspan="6" class="text-center py-5 text-muted">
                  <i class="fas fa-inbox fa-3x mb-3 opacity-25"></i>
                  <p>ไม่พบข้อมูลการขายในช่วงเวลานี้</p>
                </td>
              </tr>
              <tr v-for="sale in sales" :key="sale.id">
                <td class="ps-4 fw-bold text-primary">#{{ sale.id }}</td>
                <td>
                  <div class="d-flex flex-column">
                    <span class="fw-medium">{{ new Date(sale.sale_date).toLocaleDateString("th-TH") }}</span>
                    <small class="text-muted">{{ new Date(sale.sale_date).toLocaleTimeString("th-TH", { hour: '2-digit', minute: '2-digit' }) }} น.</small>
                  </div>
                </td>
                <td class="text-end fw-bold text-success">
                  ฿{{ Number(sale.total_amount).toLocaleString("th-TH", { minimumFractionDigits: 2 }) }}
                </td>
                <td class="text-end">
                  <span v-if="sale.discount > 0" class="badge bg-danger bg-opacity-10 text-danger">
                    -฿{{ Number(sale.discount).toLocaleString("th-TH", { minimumFractionDigits: 2 }) }}
                  </span>
                  <span v-else class="text-muted small">-</span>
                </td>
                <td class="text-center">
                  <span class="badge bg-light text-dark border">
                    <i class="fas fa-user-circle me-1"></i>{{ sale.created_by_username }}
                  </span>
                </td>
                <td class="text-center pe-4">
                  <div class="btn-group">
                    <button class="btn btn-sm btn-outline-primary" @click="openDetailsModal(sale.id)" title="ดูรายละเอียด">
                      <i class="fas fa-eye"></i>
                    </button>
                    <!-- ปุ่มแก้ไขถูกลบออกตามคำขอ -->
                    <button class="btn btn-sm btn-outline-danger" @click="handleDeleteSale(sale.id)" title="ยกเลิกบิล">
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal: Sale Details -->
    <!-- เพิ่ม ref="saleDetailModalRef" เพื่อใช้อ้างอิงใน Script -->
    <div class="modal fade" id="saleDetailModal" ref="saleDetailModalRef" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title fw-bold"><i class="fas fa-file-invoice me-2"></i>รายละเอียดบิล #{{ selectedSale.saleHeader?.id }}</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body p-4">
            <div v-if="modalPending" class="text-center py-4">
              <div class="spinner-border text-primary"></div>
            </div>
            <div v-else-if="modalError" class="alert alert-danger">{{ modalError }}</div>
            <div v-else-if="selectedSale.saleHeader">
              <div class="row mb-4">
                <div class="col-6">
                  <p class="text-muted mb-1 small">วันที่ขาย</p>
                  <h6 class="fw-bold">{{ new Date(selectedSale.saleHeader.sale_date).toLocaleString("th-TH") }}</h6>
                </div>
                <div class="col-6 text-end">
                  <p class="text-muted mb-1 small">พนักงานขาย</p>
                  <span class="badge bg-light text-dark border">{{ selectedSale.saleHeader.created_by_username }}</span>
                </div>
              </div>

              <div class="table-responsive mb-3 border rounded">
                <table class="table table-sm mb-0">
                  <thead class="bg-light">
                    <tr>
                      <th class="ps-3">สินค้า</th>
                      <th class="text-end">ราคา/หน่วย</th>
                      <th class="text-center">จำนวน</th>
                      <th class="text-end pe-3">รวม</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in selectedSale.saleDetails" :key="item.id">
                      <td class="ps-3">{{ item.product_name }}</td>
                      <td class="text-end">{{ Number(item.price_at_sale).toLocaleString() }}</td>
                      <td class="text-center">{{ item.quantity }}</td>
                      <td class="text-end pe-3 fw-bold">{{ Number(item.line_total).toLocaleString() }}</td>
                    </tr>
                  </tbody>
                  <tfoot class="border-top">
                    <tr>
                      <td colspan="3" class="text-end pt-3">ยอดรวมสินค้า:</td>
                      <td class="text-end pt-3 pe-3 fw-bold">฿{{ (Number(selectedSale.saleHeader.total_amount) + Number(selectedSale.saleHeader.discount || 0)).toLocaleString() }}</td>
                    </tr>
                    <tr v-if="selectedSale.saleHeader.discount > 0">
                      <td colspan="3" class="text-end text-danger border-0">ส่วนลดท้ายบิล:</td>
                      <td class="text-end text-danger border-0 pe-3">-฿{{ Number(selectedSale.saleHeader.discount).toLocaleString() }}</td>
                    </tr>
                    <tr class="bg-light">
                      <td colspan="3" class="text-end fw-bold py-3">ยอดสุทธิ:</td>
                      <td class="text-end fw-bold py-3 pe-3 text-success h5 mb-0">฿{{ Number(selectedSale.saleHeader.total_amount).toLocaleString() }}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
          <div class="modal-footer bg-light">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ปิดหน้าต่าง</button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import Swal from "sweetalert2";

definePageMeta({
  layout: "default",
});

// State
const sales = ref([]);
const pending = ref(true);
const error = ref(null);
const token = ref(null);

// Filters
const filters = ref({
  startDate: "",
  endDate: "",
  search: "",
});

// Summary Stats
const totalSales = computed(() => {
  if (!sales.value) return 0;
  return sales.value.reduce((sum, sale) => sum + Number(sale.total_amount), 0);
});

const totalOrders = computed(() => {
  return sales.value ? sales.value.length : 0;
});

const avgOrderValue = computed(() => {
  if (totalOrders.value === 0) return 0;
  return totalSales.value / totalOrders.value;
});

// Modal State
const modalPending = ref(false);
const modalError = ref(null);
const selectedSale = ref({});
const saleDetailModalRef = ref(null); // Ref สำหรับ Modal Element

// Fetch Data
const fetchSalesHistory = async () => {
  pending.value = true;
  error.value = null;
  try {
    const params = new URLSearchParams();
    if (filters.value.startDate) params.append("startDate", filters.value.startDate);
    if (filters.value.endDate) params.append("endDate", filters.value.endDate);
    if (filters.value.search) params.append("search", filters.value.search);

    const response = await axios.get(`http://localhost:3001/api/sales?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token.value}` },
    });
    sales.value = response.data;
  } catch (err) {
    error.value = err.response ? err.response.data : err;
  } finally {
    pending.value = false;
  }
};

const resetFilters = () => {
  filters.value = { startDate: "", endDate: "", search: "" };
  fetchSalesHistory();
};

// Lifecycle
onMounted(() => {
  if (process.client) {
    const tokenCookie = document.cookie.split('; ').find(row => row.startsWith('token='));
    if (tokenCookie) token.value = tokenCookie.split('=')[1];
  }
  fetchSalesHistory();
});

// Actions
const openDetailsModal = async (saleId) => {
  // ตรวจสอบว่ามี Bootstrap หรือไม่
  if (!window.bootstrap) {
    console.error("Bootstrap is not loaded!");
    alert("ระบบยังโหลดไม่สมบูรณ์ กรุณารีเฟรชหน้าเว็บ");
    return;
  }

  // เปิด Modal
  // ใช้ saleDetailModalRef.value แทน document.getElementById เพื่อความชัวร์ใน Vue
  const modalElement = saleDetailModalRef.value;
  if (modalElement) {
    const modal = new window.bootstrap.Modal(modalElement);
    modal.show();
  }

  modalPending.value = true;
  modalError.value = null;
  selectedSale.value = {};

  try {
    const response = await axios.get(`http://localhost:3001/api/sales/${saleId}`, {
      headers: { Authorization: `Bearer ${token.value}` },
    });
    selectedSale.value = response.data;
  } catch (err) {
    modalError.value = err.response ? err.response.data.message : err.message;
  } finally {
    modalPending.value = false;
  }
};

const handleDeleteSale = async (saleId) => {
  const result = await Swal.fire({
    title: 'คุณแน่ใจหรือไม่?',
    text: `ต้องการยกเลิกบิล ID: ${saleId}? (การกระทำนี้จะคืนสต็อกสินค้ากลับเข้าระบบ)`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'ใช่, ยกเลิกบิล!',
    cancelButtonText: 'ยกเลิก'
  });

  if (!result.isConfirmed) return;
  
  try {
    const response = await axios.delete(`http://localhost:3001/api/sales/${saleId}`, {
      headers: { Authorization: `Bearer ${token.value}` }
    });
    
    await Swal.fire(
      'เรียบร้อย!',
      response.data.message,
      'success'
    );
    
    fetchSalesHistory();
  } catch (err) {
    Swal.fire(
      'เกิดข้อผิดพลาด!',
      err.response ? err.response.data.message : err.message,
      'error'
    );
  }
};
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}
</style>
