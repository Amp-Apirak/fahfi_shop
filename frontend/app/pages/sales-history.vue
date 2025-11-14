<template>
  <div class="container mt-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2>ประวัติการขาย (Sales History)</h2>
    </div>

    <div v-if="error" class="alert alert-danger">{{ error.message }}</div>
    <div v-if="pending" class="text-center">
      <div class="spinner-border"></div>
    </div>

    <div v-if="sales" class="card shadow-sm">
      <div class="card-body">
        <table class="table table-hover table-striped">
          <thead class="table-dark">
            <tr>
              <th>บิล ID</th>
              <th>วันที่ขาย</th>
              <th>ยอดรวมสุทธิ</th>
              <th>ขายโดย</th>
              <th>การจัดการ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="sale in sales" :key="sale.id">
              <td>{{ sale.id }}</td>
              <td>{{ new Date(sale.sale_date).toLocaleString("th-TH") }}</td>
              <td>{{ sale.total_amount }} บาท</td>
              <td>{{ sale.created_by_username }}</td>
              <td>
                <button
                  class="btn btn-sm btn-info me-2"
                  data-bs-toggle="modal"
                  data-bs-target="#saleDetailModal"
                  @click="openDetailsModal(sale.id)"
                >
                  ดูรายละเอียด
                </button>
                <button
                  class="btn btn-sm btn-warning me-2"
                  data-bs-toggle="modal"
                  data-bs-target="#editSaleModal"
                  @click="openEditModal(sale.id)"
                >
                  แก้ไขบิล
                </button>
                <button
                  class="btn btn-sm btn-danger"
                  @click="handleDeleteSale(sale.id)"
                >
                  ยกเลิกบิล
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div
      class="modal fade"
      id="saleDetailModal"
      tabindex="-1"
      aria-labelledby="saleDetailModalLabel"
      aria-hidden="true"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="saleDetailModalLabel">
              รายละเอียดบิล ID: {{ selectedSale.saleHeader?.id }}
            </h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div class="modal-body">
            <div v-if="modalPending" class="text-center">
              <div class="spinner-border"></div>
            </div>
            <div v-if="modalError" class="alert alert-danger">
              {{ modalError }}
            </div>

            <div v-if="selectedSale.saleHeader">
              <p>
                <strong>วันที่ขาย:</strong>
                {{
                  new Date(selectedSale.saleHeader.sale_date).toLocaleString(
                    "th-TH"
                  )
                }}
              </p>
              <p>
                <strong>ขายโดย:</strong>
                {{ selectedSale.saleHeader.created_by_username }}
              </p>

              <h6 class="mt-4">รายการสินค้า:</h6>
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>สินค้า</th>
                    <th>ราคา (ณ วันขาย)</th>
                    <th>จำนวน</th>
                    <th>ส่วนลด (ชิ้น)</th>
                    <th>รวม</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in selectedSale.saleDetails" :key="item.id">
                    <td>{{ item.product_name }}</td>
                    <td>{{ item.price_at_sale }}</td>
                    <td>{{ item.quantity }}</td>
                    <td>{{ item.discount_amount }}</td>
                    <td>{{ item.line_total }}</td>
                  </tr>
                </tbody>
              </table>
              <hr />
              <h5 class="text-end">
                ยอดรวมสุทธิ: {{ selectedSale.saleHeader.total_amount }} บาท
              </h5>
            </div>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              ปิด
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="modal fade" id="editSaleModal" tabindex="-1">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">แก้ไขบิล ID: {{ editSaleId }}</h5>
            <button
              type="button"
              class="btn-close"
              data-bs-dismiss="modal"
            ></button>
          </div>
          <div class="modal-body">
            <div v-if="editModalPending" class="text-center">
              <div class="spinner-border"></div>
            </div>
            <div v-if="editModalError" class="alert alert-danger">
              {{ editModalError }}
            </div>

            <div class="row" v-if="!editModalPending && !editModalError">
              <div class="col-md-5" style="max-height: 60vh; overflow-y: auto">
                <h6>เพิ่มสินค้าในบิล</h6>
                <div
                  v-for="product in allProducts"
                  :key="product.id"
                  class="card card-body mb-2"
                  style="cursor: pointer"
                  @click="addToEditCart(product)"
                >
                  {{ product.name }} ({{ product.sell_price }} บ.) - สต็อก:
                  {{ product.stock_quantity }}
                </div>
              </div>

              <div class="col-md-7">
                <h6>ตะกร้า (บิล ID: {{ editSaleId }})</h6>

                <div
                  v-if="editCart.length === 0"
                  class="text-center text-muted"
                >
                  - ตะกร้าว่าง -
                </div>

                <ul
                  class="list-group"
                  style="max-height: 60vh; overflow-y: auto"
                >
                  <li
                    v-for="(item, index) in editCart"
                    :key="index"
                    class="list-group-item"
                  >
                    <div class="d-flex w-100 justify-content-between">
                      <h6 class="mb-1">{{ item.name }}</h6>
                      <button
                        class="btn-close btn-sm"
                        @click="removeFromEditCart(index)"
                      ></button>
                    </div>
                    <div class="d-flex align-items-center">
                      <span class="me-2">จำนวน:</span>
                      <input
                        type="number"
                        class="form-control form-control-sm me-2"
                        v-model.number="item.quantity"
                        style="width: 70px"
                        min="1"
                      />
                      <span class="me-2">ส่วนลด (บ.):</span>
                      <input
                        type="number"
                        class="form-control form-control-sm"
                        v-model.number="item.discount_amount"
                        style="width: 90px"
                        min="0"
                      />
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              class="btn btn-success"
              @click="submitEditSale"
            >
              บันทึกการแก้ไข (ปรับปรุงสต็อก)
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import axios from "axios";

// 1. การตั้งค่า Layout
definePageMeta({
  layout: "default",
});

// 2. ตัวแปร State (ตารางหลัก)
const sales = ref(null);
const pending = ref(true);
const error = ref(null);
const token = ref(null);

// 3. (Modal 1) "ดูรายละเอียด"
const modalPending = ref(false);
const modalError = ref(null);
const selectedSale = ref({});

// 4. (ใหม่ - Modal 2) "แก้ไขบิล"
const editModalPending = ref(false);
const editModalError = ref(null);
const editSaleId = ref(null); // ID ของบิลที่กำลังแก้
const allProducts = ref([]); // สินค้าทั้งหมด (สำหรับฝั่งซ้าย)
const editCart = ref([]); // ตะกร้าที่กำลังแก้ไข (สำหรับฝั่งขวา)

// 5. ฟังก์ชันดึงข้อมูล (ตารางหลัก)
const fetchSalesHistory = async () => {
  pending.value = true;
  try {
    const response = await axios.get("http://localhost:3001/api/sales", {
      headers: { Authorization: `Bearer ${token.value}` },
    });
    sales.value = response.data;
  } catch (err) {
    error.value = err.response ? err.response.data : err;
  } finally {
    pending.value = false;
  }
};

// 6. Lifecycle Hook (ดึงข้อมูลตารางหลัก)
onMounted(() => {
  // Get token from cookie on client side
  if (process.client) {
    const tokenCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='));
    if (tokenCookie) {
      token.value = tokenCookie.split('=')[1];
    }
  }
  fetchSalesHistory();
});

// 7. (Modal 1) ฟังก์ชัน "ดูรายละเอียด"
const openDetailsModal = async (saleId) => {
  modalPending.value = true;
  modalError.value = null;
  selectedSale.value = {};

  try {
    const response = await axios.get(
      `http://localhost:3001/api/sales/${saleId}`,
      {
        headers: { Authorization: `Bearer ${token.value}` },
      }
    );
    selectedSale.value = response.data; // { saleHeader, saleDetails }
  } catch (err) {
    modalError.value = err.response ? err.response.data.message : err.message;
  } finally {
    modalPending.value = false;
  }
};

// 8. ฟังก์ชัน "ยกเลิกบิล" (คืนสต็อก)
const handleDeleteSale = async (saleId) => {
  if (
    !window.confirm(
      `คุณแน่ใจหรือไม่ว่าต้องการ "ยกเลิกบิล ID: ${saleId}"?\n(การกระทำนี้จะ "คืนสต็อก" สินค้ากลับเข้าระบบ)`
    )
  ) {
    return;
  }
  try {
    const response = await axios.delete(
      `http://localhost:3001/api/sales/${saleId}`,
      {
        headers: { Authorization: `Bearer ${token.value}` }
      }
    );
    alert(response.data.message); // "ยกเลิกบิล...สำเร็จ!"
    await fetchSalesHistory(); // รีเฟรชตาราง
  } catch (err) {
    const message = err.response ? err.response.data.message : err.message;
    window.alert(`เกิดข้อผิดพลาด: ${message}`);
  }
};

// --- (ใหม่!) 9. ฟังก์ชันสำหรับ "แก้ไขบิล" (Modal 2) ---

// (คำนวณยอดรวมของ "ตะกร้าที่กำลังแก้ไข" อัตโนมัติ)
const editTotalAmount = computed(() => {
  return editCart.value.reduce((total, item) => {
    // (เราต้องดึงราคาขายจริงจาก allProducts เพราะในตะกร้าเก่าอาจไม่มี)
    const product = allProducts.value.find((p) => p.id === item.product_id);
    const price = product ? product.sell_price : 0;

    const lineTotal = price * item.quantity - item.discount_amount;
    return total + lineTotal;
  }, 0);
});

// (เมื่อกดปุ่ม "แก้ไขบิล" สีเหลือง)
const openEditModal = async (saleId) => {
  editModalPending.value = true;
  editModalError.value = null;
  editSaleId.value = saleId;
  editCart.value = [];
  allProducts.value = [];

  try {
    // 1. ดึง "สินค้าทั้งหมด" (สำหรับฝั่งซ้าย)
    const productsRes = await axios.get("http://localhost:3001/api/products", {
      headers: { Authorization: `Bearer ${token.value}` },
    });
    allProducts.value = productsRes.data;

    // 2. ดึง "บิลเก่า" (สำหรับฝั่งขวา)
    const saleRes = await axios.get(
      `http://localhost:3001/api/sales/${saleId}`,
      {
        headers: { Authorization: `Bearer ${token.value}` },
      }
    );

    // 3. ตั้งค่า "ตะกร้าที่กำลังแก้ไข" (สำคัญ!)
    // เราต้อง "แมพ" ข้อมูลบิลเก่า ให้มี "ชื่อ" และ "สต็อก" (เหมือนหน้า POS)
    editCart.value = saleRes.data.saleDetails.map((item) => {
      const product = allProducts.value.find((p) => p.id === item.product_id);
      return {
        product_id: item.product_id,
        quantity: item.quantity,
        discount_amount: item.discount_amount,
        name: product ? product.name : "สินค้าถูกลบ",
        sell_price: item.price_at_sale, // (ใช้ราคา ณ วันขาย)
        stock: product ? product.stock_quantity : 0,
      };
    });
  } catch (err) {
    editModalError.value = err.response ? err.response.data.message : err.message;
  } finally {
    editModalPending.value = false;
  }
};

// (ฟังก์ชันใน Modal 2 - คล้ายหน้า POS)
const addToEditCart = (product) => {
  const existingItem = editCart.value.find(
    (item) => item.product_id === product.id
  );
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

// (เมื่อกดปุ่ม "บันทึกการแก้ไข" สีเขียว)
const submitEditSale = async () => {
  editModalError.value = null;

  try {
    // 1. เตรียม "ตะกร้าใหม่" (New Cart) ให้ตรงกับที่ Backend (ขั้นตอน 18) ต้องการ
    const saleData = {
      newCart: editCart.value.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        discount_amount: item.discount_amount,
      })),
      newTotalAmount: editTotalAmount.value, // ส่งยอดรวมใหม่
    };

    // 2. ยิง API "PUT" (Backend ขั้นตอนที่ 18)
    const response = await axios.put(
      `http://localhost:3001/api/sales/${editSaleId.value}`,
      saleData,
      { headers: { Authorization: `Bearer ${token.value}` } }
    );

    // 3. ถ้าสำเร็จ
    alert(response.data.message); // "แก้ไขบิล...สำเร็จ!"

    // (ปิด Modal)
    const modalElement = document.getElementById("editSaleModal");
    const bsModal = window.bootstrap.Modal.getInstance(modalElement);
    if (bsModal) bsModal.hide();

    // (รีเฟรชตารางประวัติการขาย)
    await fetchSalesHistory();
  } catch (err) {
    const message = err.response ? err.response.data.message : err.message;
    editModalError.value = `เกิดข้อผิดพลาด: ${message}`;
    // (เช่น Error "สต็อกสินค้า...ไม่เพียงพอ" จาก Backend)
  }
};
</script>

<style>
.table td,
.table th {
  vertical-align: middle;
}
</style>
