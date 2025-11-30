<template>
  <div class="modal fade" id="sackOpenerModal" tabindex="-1" aria-hidden="true" ref="modalRef">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <div class="modal-header bg-primary text-white">
          <h5 class="modal-title"><i class="fas fa-box-open me-2"></i>เปิดกระสอบ (Sack Opener)</h5>
          <button type="button" class="btn-close btn-close-white" @click="closeModal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <!-- Step Wizard -->
          <div class="mb-4">
            <div class="d-flex justify-content-between position-relative">
              <div class="progress position-absolute top-50 start-0 w-100 translate-middle-y" style="height: 2px; z-index: 0;">
                <div class="progress-bar" :style="{ width: progressWidth }"></div>
              </div>
              <button class="btn btn-sm position-relative rounded-pill" :class="step >= 1 ? 'btn-primary' : 'btn-secondary'" style="z-index: 1; width: 32px; height: 32px;">1</button>
              <button class="btn btn-sm position-relative rounded-pill" :class="step >= 2 ? 'btn-primary' : 'btn-secondary'" style="z-index: 1; width: 32px; height: 32px;">2</button>
              <button class="btn btn-sm position-relative rounded-pill" :class="step >= 3 ? 'btn-primary' : 'btn-secondary'" style="z-index: 1; width: 32px; height: 32px;">3</button>
            </div>
            <div class="d-flex justify-content-between mt-1 small text-muted">
              <span>ต้นทุน</span>
              <span>คัดแยกสินค้า</span>
              <span>สรุป & บันทึก</span>
            </div>
          </div>

          <!-- Step 1: Cost Input -->
          <div v-if="step === 1">
            <h6 class="fw-bold mb-3">ระบุต้นทุนกระสอบ</h6>
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">ราคาเหมากระสอบ (บาท)</label>
                <input type="number" class="form-control" v-model.number="sackData.sackPrice" min="0" placeholder="0.00">
              </div>
              <div class="col-md-6">
                <label class="form-label">ค่าขนส่ง/ค่าซัก (บาท)</label>
                <input type="number" class="form-control" v-model.number="sackData.extraCost" min="0" placeholder="0.00">
              </div>
              <div class="col-12">
                <div class="alert alert-info d-flex justify-content-between align-items-center mb-0">
                  <span><i class="fas fa-coins me-2"></i>ต้นทุนรวม:</span>
                  <span class="h4 mb-0 fw-bold text-primary">{{ totalCost.toLocaleString() }} บาท</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 2: Distribute Products -->
          <div v-if="step === 2">
            <h6 class="fw-bold mb-3">คัดแยกสินค้าลงสต็อก</h6>
            <div class="table-responsive mb-3" style="max-height: 300px; overflow-y: auto;">
              <table class="table table-bordered table-sm">
                <thead class="table-light">
                  <tr>
                    <th>สินค้า</th>
                    <th style="width: 120px;">จำนวน (ชิ้น)</th>
                    <th style="width: 50px;"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(item, index) in distributionList" :key="index">
                    <td>
                      <select class="form-select form-select-sm" v-model="item.productId">
                        <option :value="null">-- เลือกสินค้า --</option>
                        <option v-for="p in products" :key="p.id" :value="p.id">
                          {{ p.name }} ({{ p.grade || '-' }})
                        </option>
                      </select>
                    </td>
                    <td>
                      <input type="number" class="form-control form-control-sm text-center" v-model.number="item.quantity" min="1">
                    </td>
                    <td class="text-center">
                      <button class="btn btn-link text-danger p-0" @click="removeRow(index)" v-if="distributionList.length > 1">
                        <i class="fas fa-times"></i>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <button class="btn btn-outline-primary btn-sm w-100 mb-3" @click="addRow">
              <i class="fas fa-plus me-1"></i> เพิ่มรายการสินค้า
            </button>

            <div class="card bg-light border-0">
              <div class="card-body py-2">
                <div class="d-flex justify-content-between mb-1">
                  <span>จำนวนรวม:</span>
                  <strong>{{ totalQuantity }} ชิ้น</strong>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                  <span>ต้นทุนเฉลี่ยต่อชิ้น:</span>
                  <span class="h5 mb-0 text-success fw-bold">{{ averageCostPerUnit }} บาท/ชิ้น</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Step 3: Summary -->
          <div v-if="step === 3">
            <h6 class="fw-bold mb-3 text-success"><i class="fas fa-check-circle me-2"></i>ตรวจสอบความถูกต้อง</h6>
            <div class="list-group mb-3">
              <div class="list-group-item d-flex justify-content-between align-items-center bg-light">
                <span>ต้นทุนรวมกระสอบ</span>
                <span class="fw-bold">{{ totalCost.toLocaleString() }} บาท</span>
              </div>
              <div class="list-group-item d-flex justify-content-between align-items-center bg-light">
                <span>จำนวนสินค้าทั้งหมด</span>
                <span class="fw-bold">{{ totalQuantity }} ชิ้น</span>
              </div>
              <div class="list-group-item d-flex justify-content-between align-items-center bg-success text-white">
                <span>ต้นทุนเฉลี่ย/ชิ้น</span>
                <span class="fw-bold">{{ averageCostPerUnit }} บาท</span>
              </div>
            </div>

            <h6 class="small text-muted mb-2">รายการที่จะบันทึก:</h6>
            <ul class="list-group list-group-flush small border rounded">
              <li class="list-group-item d-flex justify-content-between" v-for="(item, index) in validDistributionList" :key="index">
                <span>{{ getProductName(item.productId) }}</span>
                <span>+{{ item.quantity }} ชิ้น</span>
              </li>
            </ul>
          </div>

        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" @click="prevStep" v-if="step > 1">ย้อนกลับ</button>
          <button type="button" class="btn btn-primary" @click="nextStep" v-if="step < 3">ถัดไป</button>
          <button type="button" class="btn btn-success" @click="submitSack" v-if="step === 3" :disabled="isSubmitting">
            <span v-if="isSubmitting" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            ยืนยันการรับของ
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';

const props = defineProps({
  products: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['close', 'submit']);

// State
const step = ref(1);
const isSubmitting = ref(false);
const sackData = ref({
  sackPrice: 0,
  extraCost: 0
});
const distributionList = ref([
  { productId: null, quantity: 1 }
]);

// Computed
const totalCost = computed(() => {
  return (sackData.value.sackPrice || 0) + (sackData.value.extraCost || 0);
});

const totalQuantity = computed(() => {
  return distributionList.value.reduce((sum, item) => sum + (item.quantity || 0), 0);
});

const averageCostPerUnit = computed(() => {
  if (totalQuantity.value === 0) return '0.00';
  return (totalCost.value / totalQuantity.value).toFixed(2);
});

const progressWidth = computed(() => {
  return ((step.value - 1) / 2) * 100 + '%';
});

const validDistributionList = computed(() => {
  return distributionList.value.filter(item => item.productId && item.quantity > 0);
});

// Methods
const getProductName = (id) => {
  const p = props.products.find(x => x.id === id);
  return p ? p.name : 'Unknown Product';
};

const addRow = () => {
  distributionList.value.push({ productId: null, quantity: 1 });
};

const removeRow = (index) => {
  distributionList.value.splice(index, 1);
};

const nextStep = () => {
  if (step.value === 1) {
    if (totalCost.value <= 0) {
      alert('กรุณาระบุต้นทุนให้ถูกต้อง');
      return;
    }
  } else if (step.value === 2) {
    if (validDistributionList.value.length === 0) {
      alert('กรุณาเลือกสินค้าและระบุจำนวนอย่างน้อย 1 รายการ');
      return;
    }
  }
  step.value++;
};

const prevStep = () => {
  step.value--;
};

const closeModal = () => {
  emit('close');
};

const submitSack = async () => {
  isSubmitting.value = true;
  try {
    // Prepare payload
    const payload = {
      items: validDistributionList.value.map(item => ({
        product_id: item.productId,
        quantity: item.quantity,
        cost_price: Number(averageCostPerUnit.value)
      })),
      total_cost: totalCost.value,
      total_quantity: totalQuantity.value,
      note: `Sack Opener: Cost ${totalCost.value} / Qty ${totalQuantity.value}`
    };

    emit('submit', payload);
  } catch (error) {
    console.error(error);
  } finally {
    isSubmitting.value = false;
  }
};

// Reset when modal opens (handled by parent usually, but good to have reset method)
const resetForm = () => {
  step.value = 1;
  sackData.value = { sackPrice: 0, extraCost: 0 };
  distributionList.value = [{ productId: null, quantity: 1 }];
};

defineExpose({ resetForm });

</script>

<style scoped>
.progress {
  background-color: #e9ecef;
}
</style>
