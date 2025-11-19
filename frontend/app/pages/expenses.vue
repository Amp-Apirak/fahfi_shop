<template>
  <div class="container-fluid my-4">
    <div v-if="error" class="alert alert-danger">
      เกิดข้อผิดพลาดในการดึงข้อมูล: {{ error.message }}
    </div>

    <div class="card shadow-sm">
      <div class="card-header bg-white p-3">
        <div class="d-flex justify-content-between align-items-center">
          <h2 class="h4 mb-0 text-primary-emphasis">
            <i class="fas fa-money-bill-wave me-2"></i>จัดการรายจ่าย
          </h2>
          <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#expenseModal" @click="openAddModal">
            <i class="fas fa-plus me-2"></i>บันทึกรายจ่ายใหม่
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
                <th scope="col">วันที่</th>
                <th scope="col">หมวดหมู่</th>
                <th scope="col">รายละเอียด</th>
                <th scope="col" class="text-end">จำนวนเงิน</th>
                <th scope="col">บันทึกโดย</th>
                <th scope="col" class="text-center">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="!expenses || expenses.length === 0">
                <td colspan="6" class="text-center text-muted py-4">ไม่พบข้อมูลรายจ่าย</td>
              </tr>
              <tr v-for="expense in expenses" :key="expense.id">
                <td>{{ new Date(expense.expense_date).toLocaleDateString('th-TH') }}</td>
                <td><span class="badge bg-secondary bg-opacity-25 text-secondary-emphasis">{{ expense.category }}</span></td>
                <td>{{ expense.details }}</td>
                <td class="text-end">฿{{ expense.amount.toLocaleString() }}</td>
                <td>{{ expense.created_by_username }}</td>
                <td class="text-center">
                  <button class="btn btn-sm btn-outline-primary border-0 me-1" data-bs-toggle="modal" data-bs-target="#expenseModal" @click="openEditModal(expense)">
                    <i class="fas fa-edit"></i>
                  </button>
                  <button class="btn btn-sm btn-outline-danger border-0" @click="handleDelete(expense.id, expense.details)">
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
    <div class="modal fade" id="expenseModal" tabindex="-1" aria-labelledby="expenseModalLabel" aria-hidden="true">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="expenseModalLabel">{{ modalMode === 'add' ? 'บันทึกรายจ่ายใหม่' : 'แก้ไขรายจ่าย' }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="handleSubmit">
              <div class="mb-3">
                <label for="expense_date" class="form-label">วันที่</label>
                <input type="date" class="form-control" v-model="currentExpense.expense_date" required>
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label for="category" class="form-label">หมวดหมู่</label>
                  <input type="text" class="form-control" v-model="currentExpense.category">
                </div>
                <div class="col-md-6 mb-3">
                  <label for="amount" class="form-label">จำนวนเงิน</label>
                  <input type="number" step="0.01" class="form-control" v-model="currentExpense.amount" required>
                </div>
              </div>
              <div class="mb-3">
                <label for="details" class="form-label">รายละเอียด</label>
                <textarea class="form-control" rows="2" v-model="currentExpense.details" required></textarea>
              </div>

              <div v-if="modalError" class="alert alert-danger mt-3">
                {{ modalError }}
              </div>

              <div class="modal-footer pt-4">
                <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">ยกเลิก</button>
                <button type="submit" class="btn btn-primary">
                  <i class="fas fa-save me-2"></i>
                  {{ modalMode === 'add' ? 'บันทึก' : 'บันทึกการแก้ไข' }}
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
import axios from 'axios';
import { ref, onMounted } from 'vue';

// 1. การตั้งค่า Layout
definePageMeta({
  layout: 'default'
});

// 2. ตัวแปร State หลัก
const expenses = ref(null);
const pending = ref(true);
const error = ref(null);
const token = useCookie('token');

// 3. ตัวแปร State สำหรับ Modal
const modalMode = ref('add');
const modalError = ref(null);

// (ฟังก์ชันช่วยแปลงวันที่ YYYY-MM-DD สำหรับ <input type="date">)
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toISOString().split('T')[0];
};

const defaultExpenseForm = {
  id: null,
  expense_date: formatDateForInput(new Date().toISOString()), // ใช้วันที่ปัจจุบันเป็นค่าเริ่มต้น
  category: '',
  details: '',
  amount: 0.00
};

const currentExpense = ref({ ...defaultExpenseForm });

// 4. ฟังก์ชันดึงข้อมูล (Read)
const fetchExpenses = async () => {
  pending.value = true;
  try {
    const response = await axios.get('http://localhost:3001/api/expenses', {
      headers: { 'Authorization': `Bearer ${token.value}` }
    });
    expenses.value = response.data;
  } catch (err) {
    error.value = err.response ? err.response.data : err;
  } finally {
    pending.value = false;
  }
};

// 5. Lifecycle Hook (ดึงข้อมูล + เชื่อม Modal)
let bsModal = null;
onMounted(() => {
  fetchExpenses();
  
  const modalElement = document.getElementById('expenseModal');
  if (modalElement && typeof window !== 'undefined' && window.bootstrap) {
    bsModal = new window.bootstrap.Modal(modalElement);
  }
});

// 6. ฟังก์ชันจัดการ Modal

const openAddModal = () => {
  modalMode.value = 'add';
  currentExpense.value = { ...defaultExpenseForm, expense_date: formatDateForInput(new Date().toISOString()) };
  modalError.value = null;
};

const openEditModal = (expense) => {
  modalMode.value = 'edit';
  // (สำคัญ) เราต้องแปลง format วันที่กลับไปเป็น YYYY-MM-DD
  currentExpense.value = { ...expense, expense_date: formatDateForInput(expense.expense_date) };
  modalError.value = null;
};

// 7. ฟังก์ชัน (Create / Update)
const handleSubmit = async () => {
  modalError.value = null;
  try {
    if (modalMode.value === 'add') {
      await axios.post(
        'http://localhost:3001/api/expenses',
        currentExpense.value,
        { headers: { 'Authorization': `Bearer ${token.value}` } }
      );
    } 
    else if (modalMode.value === 'edit') {
      await axios.put(
        `http://localhost:3001/api/expenses/${currentExpense.value.id}`,
        currentExpense.value,
        { headers: { 'Authorization': `Bearer ${token.value}` } }
      );
    }
    
    if (bsModal) bsModal.hide();
    await fetchExpenses();

  } catch (err) {
    modalError.value = "เกิดข้อผิดพลาด: " + (err.response ? err.response.data.message : err.message);
  }
};

// 8. ฟังก์ชัน (Delete)
const handleDelete = async (expenseId, expenseDetails) => {
  if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบ "${expenseDetails}"?`)) {
    return;
  }
  try {
    await axios.delete(
      `http://localhost:3001/api/expenses/${expenseId}`,
      { headers: { 'Authorization': `Bearer ${token.value}` } }
    );
    await fetchExpenses();
  } catch (err) {
    const message = err.response ? err.response.data.message : err.message;
    window.alert(`เกิดข้อผิดพลาด: ${message}`);
  }
};
</script>

<style>
* {
  font-family: 'Sarabun', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

.table td, .table th {
  vertical-align: middle;
}
</style>