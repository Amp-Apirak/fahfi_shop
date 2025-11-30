<template>
  <div class="container-fluid py-4">
    <!-- Header -->
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="fw-bold text-primary-emphasis mb-1">
          <i class="fas fa-coins me-2"></i>บริหารเงินลงทุน (Capital)
        </h2>
        <p class="text-muted mb-0">จัดการเงินลงทุน เพิ่มทุน และถอนทุน/ปันผล</p>
      </div>
      <button class="btn btn-primary" @click="openModal()">
        <i class="fas fa-plus me-2"></i>บันทึกรายการ
      </button>
    </div>

    <!-- Summary Cards -->
    <div class="row g-3 mb-4">
      <div class="col-md-4">
        <div class="card border-0 shadow-sm h-100 bg-success bg-opacity-10 border-success border-opacity-25">
          <div class="card-body">
            <h6 class="text-success fw-bold text-uppercase mb-2">เงินลงทุนรวม (Total Deposit)</h6>
            <h3 class="fw-bold text-success mb-0">฿{{ formatPrice(summary.totalDeposit) }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card border-0 shadow-sm h-100 bg-danger bg-opacity-10 border-danger border-opacity-25">
          <div class="card-body">
            <h6 class="text-danger fw-bold text-uppercase mb-2">ถอนทุน/ปันผล (Total Withdraw)</h6>
            <h3 class="fw-bold text-danger mb-0">฿{{ formatPrice(summary.totalWithdraw) }}</h3>
          </div>
        </div>
      </div>
      <div class="col-md-4">
        <div class="card border-0 shadow-sm h-100 bg-primary bg-opacity-10 border-primary border-opacity-25">
          <div class="card-body">
            <h6 class="text-primary fw-bold text-uppercase mb-2">เงินทุนสุทธิ (Net Capital)</h6>
            <h3 class="fw-bold text-primary mb-0">฿{{ formatPrice(summary.netCapital) }}</h3>
          </div>
        </div>
      </div>
    </div>

    <!-- Capital Logs Table -->
    <div class="card border-0 shadow-sm">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="bg-light">
              <tr>
                <th class="py-3 ps-4">วันที่</th>
                <th class="py-3">ประเภท</th>
                <th class="py-3">รายละเอียด</th>
                <th class="py-3 text-end">จำนวนเงิน</th>
                <th class="py-3 text-center pe-4">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="capitalLogs.length === 0">
                <td colspan="5" class="text-center py-5 text-muted">
                  <i class="fas fa-piggy-bank fa-3x mb-3 opacity-25"></i>
                  <p>ยังไม่มีรายการเงินลงทุน</p>
                </td>
              </tr>
              <tr v-for="log in capitalLogs" :key="log.id">
                <td class="ps-4">
                  <span class="fw-medium">{{ formatDate(log.transaction_date) }}</span>
                </td>
                <td>
                  <span class="badge border" :class="getTypeColor(log.type)">
                    {{ log.type === 'deposit' ? 'เพิ่มทุน' : 'ถอนทุน/ปันผล' }}
                  </span>
                </td>
                <td>{{ log.description }}</td>
                <td class="text-end fw-bold" :class="log.type === 'deposit' ? 'text-success' : 'text-danger'">
                  {{ log.type === 'deposit' ? '+' : '-' }}฿{{ formatPrice(log.amount) }}
                </td>
                <td class="text-center pe-4">
                  <button
                    class="btn btn-sm btn-outline-danger"
                    @click="deleteLog(log.id)"
                    title="ลบ"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
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
      id="capitalModal"
      tabindex="-1"
      ref="capitalModalRef"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-primary text-white">
            <h5 class="modal-title fw-bold">
              <i class="fas fa-plus-circle me-2"></i>บันทึกรายการใหม่
            </h5>
            <button
              type="button"
              class="btn-close btn-close-white"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body p-4">
            <form @submit.prevent="saveLog">
              <div class="mb-3">
                <label class="form-label fw-bold text-muted small">วันที่ทำรายการ</label>
                <input
                  type="date"
                  class="form-control"
                  v-model="currentLog.transaction_date"
                  required
                />
              </div>
              <div class="mb-3">
                <label class="form-label fw-bold text-muted small">ประเภทรายการ</label>
                <select class="form-select" v-model="currentLog.type" required>
                  <option value="deposit">เพิ่มทุน (Deposit)</option>
                  <option value="withdraw">ถอนทุน/ปันผล (Withdraw)</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label fw-bold text-muted small">รายละเอียด</label>
                <textarea
                  class="form-control"
                  rows="3"
                  v-model="currentLog.description"
                  required
                  placeholder="เช่น เงินลงทุนก้อนแรก, ปันผลประจำเดือน"
                ></textarea>
              </div>
              <div class="mb-3">
                <label class="form-label fw-bold text-muted small">จำนวนเงิน (บาท)</label>
                <div class="input-group">
                  <span class="input-group-text bg-light">฿</span>
                  <input
                    type="number"
                    class="form-control"
                    v-model="currentLog.amount"
                    required
                    min="0"
                    step="0.01"
                  />
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
                  บันทึก
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
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import Swal from "sweetalert2";

definePageMeta({
  layout: "default",
});

const capitalLogs = ref([]);
const capitalModalRef = ref(null);
let capitalModal = null;

const currentLog = ref({
  transaction_date: new Date().toISOString().split('T')[0],
  type: "deposit",
  description: "",
  amount: 0,
});

// Computed Summary
const summary = computed(() => {
  let totalDeposit = 0;
  let totalWithdraw = 0;

  capitalLogs.value.forEach(log => {
    const amount = Number(log.amount);
    if (log.type === 'deposit') {
      totalDeposit += amount;
    } else {
      totalWithdraw += amount;
    }
  });

  return {
    totalDeposit,
    totalWithdraw,
    netCapital: totalDeposit - totalWithdraw
  };
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

// Helper: Type Color
const getTypeColor = (type) => {
  if (type === 'deposit') return "bg-success bg-opacity-10 text-success border-success border-opacity-25";
  return "bg-danger bg-opacity-10 text-danger border-danger border-opacity-25";
};

// Fetch Logs
const fetchLogs = async () => {
  try {
    const token = useCookie("token");
    const response = await axios.get("/api/capital", {
      headers: { Authorization: `Bearer ${token.value}` },
    });
    capitalLogs.value = response.data;
  } catch (error) {
    console.error("Error fetching capital logs:", error);
    Swal.fire("Error", "ไม่สามารถดึงข้อมูลได้", "error");
  }
};

// Open Modal
const openModal = () => {
  currentLog.value = {
    transaction_date: new Date().toISOString().split('T')[0],
    type: "deposit",
    description: "",
    amount: 0,
  };
  capitalModal.show();
};

// Save Log
const saveLog = async () => {
  try {
    const token = useCookie("token");
    await axios.post("/api/capital", currentLog.value, {
      headers: { Authorization: `Bearer ${token.value}` },
    });
    Swal.fire("Success", "บันทึกรายการสำเร็จ", "success");
    capitalModal.hide();
    fetchLogs();
  } catch (error) {
    console.error("Error saving log:", error);
    Swal.fire("Error", "บันทึกข้อมูลไม่สำเร็จ", "error");
  }
};

// Delete Log
const deleteLog = async (id) => {
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
      await axios.delete(`/api/capital/${id}`, {
        headers: { Authorization: `Bearer ${token.value}` },
      });
      Swal.fire("Deleted!", "ลบรายการสำเร็จ", "success");
      fetchLogs();
    } catch (error) {
      console.error("Error deleting log:", error);
      Swal.fire("Error", "ลบรายการไม่สำเร็จ", "error");
    }
  }
};

onMounted(() => {
  const Modal = window.bootstrap.Modal;
  if (Modal) {
    capitalModal = new Modal(capitalModalRef.value);
  }
  fetchLogs();
});
</script>
