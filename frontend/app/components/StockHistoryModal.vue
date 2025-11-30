<template>
  <div class="modal fade" id="stockHistoryModal" aria-hidden="true">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title"><i class="fas fa-history me-2"></i>ประวัติสต็อกสินค้า</h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div v-if="loading" class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>

          <div v-else-if="error" class="alert alert-danger">
            {{ error }}
          </div>

          <div v-else>
            <div class="mb-3 d-flex justify-content-between align-items-center">
              <h6 class="mb-0 text-primary">{{ productName }}</h6>
              <span class="badge bg-secondary">{{ history.length }} รายการ</span>
            </div>

            <div class="table-responsive">
              <table class="table table-striped table-hover table-sm">
                <thead>
                  <tr>
                    <th>วันที่</th>
                    <th>ประเภท</th>
                    <th>จำนวน</th>
                    <th>ต้นทุน/หน่วย</th>
                    <th>เหตุผล</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="history.length === 0">
                    <td colspan="5" class="text-center text-muted py-3">ไม่มีประวัติการเคลื่อนไหว</td>
                  </tr>
                  <tr v-for="log in history" :key="log.id">
                    <td>{{ formatDate(log.created_at) }}</td>
                    <td>
                      <span class="badge" :class="getTypeBadge(log.type)">
                        {{ getTypeLabel(log.type) }}
                      </span>
                    </td>
                    <td :class="log.type === 'out' ? 'text-danger' : 'text-success'">
                      {{ log.type === 'out' ? '-' : '+' }}{{ log.quantity }}
                    </td>
                    <td>{{ log.cost_per_unit }}</td>
                    <td>{{ log.reason || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div class="modal-footer d-flex justify-content-between">
          <button type="button" class="btn btn-warning" @click="openAdjustModal">
            <i class="fas fa-wrench me-2"></i>ปรับปรุงยอด (Adjust)
          </button>
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">ปิด</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import axios from 'axios';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';
import 'dayjs/locale/th';

dayjs.locale('th');

const props = defineProps({
  productId: {
    type: Number,
    default: null
  },
  productName: {
    type: String,
    default: ''
  },
  currentStock: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['refresh']);

const history = ref([]);
const loading = ref(false);
const error = ref(null);

const fetchHistory = async () => {
  if (!props.productId) return;
  
  loading.value = true;
  error.value = null;
  try {
    const token = useCookie('token');
    const response = await axios.get(`/api/products/${props.productId}/history`, {
      headers: { Authorization: `Bearer ${token.value}` }
    });
    history.value = response.data;
  } catch (err) {
    console.error('Error fetching history:', err);
    if (err.response && err.response.status === 403) {
      error.value = 'Session หมดอายุ กรุณาออกจากระบบแล้วเข้าใหม่';
    } else {
      error.value = err.response?.data?.message || err.message || 'ไม่สามารถดึงข้อมูลประวัติได้';
    }
  } finally {
    loading.value = false;
  }
};

// Watch for productId changes to fetch data
watch(() => props.productId, (newId) => {
  if (newId) {
    fetchHistory();
  } else {
    history.value = [];
  }
});

// Helpers
const formatDate = (date) => {
  return dayjs(date).format('D MMM BB HH:mm');
};

const getTypeBadge = (type) => {
  switch (type) {
    case 'in': return 'bg-success';
    case 'out': return 'bg-danger';
    case 'adjust': return 'bg-warning text-dark';
    default: return 'bg-secondary';
  }
};

const getTypeLabel = (type) => {
  switch (type) {
    case 'in': return 'รับเข้า';
    case 'out': return 'ขายออก';
    case 'adjust': return 'ปรับปรุง';
    default: return type;
  }
};

// Adjust Stock Logic
const openAdjustModal = async () => {
  // 1. ซ่อน Modal ประวัติก่อน (เพื่อแก้ปัญหา Focus)
  const modalEl = document.getElementById('stockHistoryModal');
  let bsModal = null;
  if (window.bootstrap && modalEl) {
    bsModal = window.bootstrap.Modal.getInstance(modalEl);
    if (bsModal) bsModal.hide();
  }

  // 2. แสดง SweetAlert
  const { value: formValues } = await Swal.fire({
    title: 'ปรับปรุงยอดสต็อก',
    html:
      `<div class="mb-3 text-start">
         <label class="form-label">สินค้า: <strong>${props.productName}</strong></label><br>
         <label class="form-label">ยอดปัจจุบัน: <strong>${props.currentStock}</strong></label>
       </div>
       <div class="mb-3 text-start">
         <label for="swal-input1" class="form-label">ยอดที่นับได้จริง (Actual Quantity)</label>
         <input id="swal-input1" class="form-control" type="number" min="0" value="${props.currentStock}">
       </div>
       <div class="mb-3 text-start">
         <label for="swal-input2" class="form-label">สาเหตุการปรับปรุง</label>
         <input id="swal-input2" class="form-control" placeholder="เช่น นับผิด, ของหาย, เจอของเพิ่ม">
       </div>`,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'บันทึก',
    cancelButtonText: 'ยกเลิก',
    preConfirm: () => {
      const newQty = document.getElementById('swal-input1').value;
      const reason = document.getElementById('swal-input2').value;
      if (!newQty || newQty < 0) {
        Swal.showValidationMessage('กรุณาระบุจำนวนที่ถูกต้อง');
        return false;
      }
      if (!reason) {
        Swal.showValidationMessage('กรุณาระบุสาเหตุ');
        return false;
      }
      return { newQty: parseInt(newQty), reason: reason };
    }
  });

  // 3. ถ้ากดยกเลิก ให้เปิด Modal ประวัติกลับมา
  if (!formValues) {
    if (bsModal) bsModal.show();
    return;
  }

  // 4. ถ้ากดบันทึก
  if (formValues) {
    try {
        const token = useCookie('token');
        await axios.post(`/api/products/${props.productId}/adjust`, {
            new_quantity: formValues.newQty,
            reason: formValues.reason
        }, {
            headers: { Authorization: `Bearer ${token.value}` }
        });

        await Swal.fire('สำเร็จ', 'ปรับปรุงยอดเรียบร้อยแล้ว', 'success');
        
        // เปิด Modal ประวัติกลับมา + รีเฟรชข้อมูล
        if (bsModal) bsModal.show();
        fetchHistory(); 
        emit('refresh'); 
    } catch (err) {
        Swal.fire('เกิดข้อผิดพลาด', err.response?.data?.message || err.message, 'error');
        // เปิด Modal ประวัติกลับมาแม้จะ error
        if (bsModal) bsModal.show();
    }
  }
};

// Expose method to refresh manually if needed
defineExpose({ fetchHistory });
</script>
