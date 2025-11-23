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
                    <button class="btn btn-sm btn-outline-warning" @click="openEditModal(sale.id)" title="แก้ไขบิล">
                      <i class="fas fa-edit"></i>
                    </button>
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
    <div class="modal fade" id="saleDetailModal" tabindex="-1" aria-hidden="true">
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

    <!-- Modal: Edit Sale -->
    <div class="modal fade" id="editSaleModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-xl modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header bg-warning text-dark">
            <h5 class="modal-title fw-bold"><i class="fas fa-edit me-2"></i>แก้ไขบิล #{{ editSaleId }}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body p-0">
            <div v-if="editModalPending" class="text-center py-5">
              <div class="spinner-border text-warning"></div>
            </div>
            <div v-else-if="editModalError" class="alert alert-danger m-3">{{ editModalError }}</div>
            
            <div class="row g-0" v-if="!editModalPending && !editModalError">
              <!-- Left: Product Selection -->
              <div class="col-lg-5 border-end bg-light">
                <div class="p-3 border-bottom bg-white sticky-top">
                  <h6 class="mb-0 fw-bold text-secondary"><i class="fas fa-box me-2"></i>เลือกสินค้าเพิ่ม</h6>
                </div>
                <div class="p-3" style="max-height: 60vh; overflow-y: auto;">
                  <div v-for="product in allProducts" :key="product.id" 
                       class="card mb-2 cursor-pointer product-card" 
                       @click="addToEditCart(product)">
                    <div class="card-body p-2 d-flex justify-content-between align-items-center">
                      <div>
                        <div class="fw-bold text-dark">{{ product.name }}</div>
                        <small class="text-muted">สต็อก: {{ product.stock_quantity }}</small>
                      </div>
                      <span class="badge bg-primary rounded-pill">฿{{ product.sell_price }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right: Cart -->
              <div class="col-lg-7 bg-white">
                <div class="p-3 border-bottom bg-white sticky-top d-flex justify-content-between align-items-center">
                  <h6 class="mb-0 fw-bold text-secondary"><i class="fas fa-shopping-cart me-2"></i>รายการในบิล</h6>
                  <span class="badge bg-warning text-dark">กำลังแก้ไข</span>
                </div>
                <div class="p-3" style="max-height: 50vh; overflow-y: auto;">
                  <div v-if="editCart.length === 0" class="text-center py-5 text-muted">
                    <i class="fas fa-shopping-basket fa-3x mb-3 opacity-25"></i>
                    <p>ไม่มีสินค้าในรายการ</p>
                  </div>
                  <div v-else v-for="(item, index) in editCart" :key="index" class="card mb-2 border-start-0 border-end-0 border-top-0 rounded-0">
                    <div class="card-body p-2">
                      <div class="d-flex justify-content-between mb-2">
                        <span class="fw-bold">{{ item.name }}</span>
                        <button class="btn btn-sm text-danger p-0" @click="removeFromEditCart(index)">
                          <i class="fas fa-times"></i>
                        </button>
                      </div>
                      <div class="row g-2 align-items-center">
                        <div class="col-auto">
                          <label class="small text-muted">จำนวน:</label>
                          <input type="number" class="form-control form-control-sm" v-model.number="item.quantity" style="width: 70px;" min="1">
                        </div>
                        <div class="col-auto">
                          <label class="small text-muted">ราคา/ชิ้น:</label>
                          <input type="number" class="form-control form-control-sm" v-model.number="item.sell_price" style="width: 90px;" disabled>
                        </div>
                        <div class="col text-end">
                          <span class="fw-bold text-success">฿{{ (item.sell_price * item.quantity).toLocaleString() }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="p-3 bg-light border-top">
                  <div class="d-flex justify-content-between align-items-center">
                    <span class="fw-bold">ยอดรวมใหม่:</span>
                    <h4 class="fw-bold text-success mb-0">฿{{ editTotalAmount.toLocaleString() }}</h4>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer bg-light">
            <button type="button" class="btn btn-outline-secondary" data-bs-dismiss="modal">ยกเลิก</button>
            <button type="button" class="btn btn-warning fw-bold" @click="submitEditSale">
              <i class="fas fa-save me-2"></i>บันทึกการแก้ไข
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from "vue";
import axios from "axios";

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

const editModalPending = ref(false);
const editModalError = ref(null);
const editSaleId = ref(null);
const allProducts = ref([]);
const editCart = ref([]);

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
  const modal = new window.bootstrap.Modal(document.getElementById('saleDetailModal'));
  modal.show();
  
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
  if (!window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการ "ยกเลิกบิล ID: ${saleId}"?\n(การกระทำนี้จะคืนสต็อกสินค้ากลับเข้าระบบ)`)) return;
  
  try {
    const response = await axios.delete(`http://localhost:3001/api/sales/${saleId}`, {
      headers: { Authorization: `Bearer ${token.value}` }
    });
    alert(response.data.message);
    fetchSalesHistory();
  } catch (err) {
    alert(`เกิดข้อผิดพลาด: ${err.response ? err.response.data.message : err.message}`);
  }
};

// Edit Logic
const editTotalAmount = computed(() => {
  return editCart.value.reduce((total, item) => {
    return total + (item.sell_price * item.quantity);
  }, 0);
});

const openEditModal = async (saleId) => {
  const modal = new window.bootstrap.Modal(document.getElementById('editSaleModal'));
  modal.show();

  editModalPending.value = true;
  editModalError.value = null;
  editSaleId.value = saleId;
  editCart.value = [];
  allProducts.value = [];

  try {
    const [productsRes, saleRes] = await Promise.all([
      axios.get("http://localhost:3001/api/products", { headers: { Authorization: `Bearer ${token.value}` } }),
      axios.get(`http://localhost:3001/api/sales/${saleId}`, { headers: { Authorization: `Bearer ${token.value}` } })
    ]);

    allProducts.value = productsRes.data;
    
    // Map existing items
    editCart.value = saleRes.data.saleDetails.map((item) => {
      const product = allProducts.value.find((p) => p.id === item.product_id);
      return {
        product_id: item.product_id,
        quantity: item.quantity,
        discount_amount: item.discount_amount,
        name: product ? product.name : "สินค้าถูกลบ",
        sell_price: item.price_at_sale,
        stock: product ? product.stock_quantity : 0,
      };
    });
  } catch (err) {
    editModalError.value = err.response ? err.response.data.message : err.message;
  } finally {
    editModalPending.value = false;
  }
};

const addToEditCart = (product) => {
  const existingItem = editCart.value.find((item) => item.product_id === product.id);
  if (existingItem) {
    existingItem.quantity++;
  } else {
    editCart.value.push({
      product_id: product.id,
      quantity: 1,
      discount_amount: 0,
      name: product.name,
      sell_price: product.sell_price,
      stock: product.stock_quantity,
    });
  }
};

const removeFromEditCart = (index) => {
  editCart.value.splice(index, 1);
};

const submitEditSale = async () => {
  if (!confirm("ยืนยันการแก้ไขบิล?")) return;
  
  try {
    const saleData = {
      newCart: editCart.value.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        discount_amount: item.discount_amount,
      })),
      newTotalAmount: editTotalAmount.value,
    };

    const response = await axios.put(`http://localhost:3001/api/sales/${editSaleId.value}`, saleData, {
      headers: { Authorization: `Bearer ${token.value}` }
    });

    alert(response.data.message);
    const modal = window.bootstrap.Modal.getInstance(document.getElementById('editSaleModal'));
    modal.hide();
    fetchSalesHistory();
  } catch (err) {
    editModalError.value = `เกิดข้อผิดพลาด: ${err.response ? err.response.data.message : err.message}`;
  }
};
</script>

<style scoped>
.product-card:hover {
  background-color: #f8f9fa;
  border-color: #0d6efd;
}
.cursor-pointer {
  cursor: pointer;
}
</style>
