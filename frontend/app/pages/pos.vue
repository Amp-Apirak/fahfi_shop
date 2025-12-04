<template>
  <div class="container-fluid my-4">
    <!-- Font Awesome CDN -->
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css"
    />

    <div class="row g-3">
      <!-- ส่วนรายการสินค้า (ฝั่งซ้าย) -->
      <div class="col-lg-7 order-lg-1 order-2">
        <div class="card shadow-sm">
          <div class="card-header bg-white p-3">
            <h3 class="h5 mb-0 text-primary-emphasis">
              <i class="fas fa-shopping-cart me-2"></i>จัดการสินค้า
            </h3>
          </div>
          <div class="card-body">
            <!-- Loading State -->
            <div v-if="pending" class="text-center py-5">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="mt-2">กำลังโหลดข้อมูล...</p>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="alert alert-danger">
              <i class="fas fa-exclamation-circle me-2"></i>
              เกิดข้อผิดพลาด: {{ error.message }}
            </div>

            <!-- Products Table -->
            <div
              v-else
              class="table-responsive"
              style="max-height: 70vh; overflow-y: auto"
            >
              <table class="table table-hover align-middle">
                <thead class="table-light sticky-top">
                  <tr>
                    <th class="text-center cursor-pointer" style="width: 80px" @click="sortBy('id')">ID <i class="fas" :class="getSortIcon('id')"></i></th>
                    <th class="text-center" style="width: 100px">รูปภาพ</th>
                    <th class="cursor-pointer" @click="sortBy('name')">ชื่อสินค้า <i class="fas" :class="getSortIcon('name')"></i></th>
                    <th class="text-center cursor-pointer" @click="sortBy('category')">หมวดหมู่ <i class="fas" :class="getSortIcon('category')"></i></th>
                    <th class="text-end cursor-pointer" @click="sortBy('sell_price')">ราคาขาย <i class="fas" :class="getSortIcon('sell_price')"></i></th>
                    <th class="text-center cursor-pointer" @click="sortBy('stock_quantity')">สต็อก <i class="fas" :class="getSortIcon('stock_quantity')"></i></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="!sortedProducts || sortedProducts.length === 0">
                    <td colspan="6" class="text-center text-muted py-4">
                      ไม่พบข้อมูลสินค้า
                    </td>
                  </tr>
                  <tr
                    v-for="product in sortedProducts"
                    :key="product.id"
                    :class="{
                      'table-secondary': product.stock_quantity <= 0,
                      'cursor-pointer-row': product.stock_quantity > 0,
                    }"
                    @click="addToCart(product)"
                    :style="{
                      cursor:
                        product.stock_quantity > 0 ? 'pointer' : 'not-allowed',
                    }"
                  >
                    <td class="text-center fw-bold">{{ product.id }}</td>
                    <td class="text-center">
                      <div
                        v-if="product.product_image_url"
                        class="product-image-cell"
                      >
                        <img
                          :src="formatImageUrl(product.product_image_url)"
                          :alt="product.name"
                          class="product-thumbnail"
                          onerror="this.onerror=null; this.src='https://via.placeholder.com/80?text=No+Image'"
                        />
                      </div>
                      <div v-else class="product-image-placeholder">
                        <i class="fas fa-image"></i>
                      </div>
                    </td>
                    <td>
                      <h6 class="mb-0 fw-bold">{{ product.name }}</h6>
                    </td>
                    <td class="text-center">
                      <span
                        class="badge border"
                        :class="getCategoryColor(product.category)"
                      >
                        {{ product.category || "-" }}
                      </span>
                    </td>
                    <td class="text-end">
                      <span class="fw-bold text-success"
                        >฿{{
                          product.sell_price.toLocaleString("th-TH", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })
                        }}</span
                      >
                    </td>
                    <td class="text-center">
                      <span
                        class="badge"
                        :class="
                          product.stock_quantity > 0
                            ? 'bg-success'
                            : 'bg-danger'
                        "
                      >
                        {{ product.stock_quantity }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- ส่วนตะกร้าสินค้า (ฝั่งขวา) -->
      <div class="col-lg-5 order-lg-2 order-1">
        <!-- 1. ตะกร้าสินค้า -->
        <div class="card shadow-sm mb-3" style="top: 20px">
          <div class="card-header bg-white p-3">
            <h3 class="h5 mb-0 text-primary-emphasis">
              <i class="fas fa-shopping-bag me-2"></i>ตะกร้าสินค้า
            </h3>
          </div>
          <div class="card-body">
            <!-- Empty Cart State -->
            <div v-if="cart.length === 0" class="text-center text-muted py-4">
              <i
                class="fas fa-shopping-cart"
                style="font-size: 48px; opacity: 0.3"
              ></i>
              <p class="mt-3">ยังไม่มีสินค้าในตะกร้า</p>
            </div>

            <!-- Cart Items List -->
            <div v-else style="max-height: 40vh; overflow-y: auto">
              <div
                v-for="(item, index) in cart"
                :key="index"
                class="cart-item card border mb-3"
              >
                <div class="card-body p-3">
                  <div class="d-flex gap-3 mb-2">
                    <!-- รูปภาพสินค้า -->
                    <div class="flex-shrink-0">
                      <div v-if="products" class="cart-item-image">
                        <img
                          :src="
                            formatImageUrl(products.find((p) => p.id === item.product_id)
                              ?.product_image_url) ||
                            'https://via.placeholder.com/60?text=No+Image'
                          "
                          :alt="item.name"
                          class="cart-thumbnail"
                          onerror="this.src='https://via.placeholder.com/60?text=No+Image'"
                        />
                      </div>
                    </div>

                    <!-- รายละเอียดสินค้า -->
                    <div class="flex-grow-1">
                      <div
                        class="d-flex justify-content-between align-items-start mb-2"
                      >
                        <div>
                          <h6 class="mb-1 fw-bold">{{ item.name }}</h6>
                          <small class="text-muted"
                            >ราคา: ฿{{
                              item.sell_price.toLocaleString("th-TH", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })
                            }}</small
                          >
                        </div>
                        <button
                          class="btn btn-sm btn-outline-danger border-0"
                          @click="removeFromCart(index)"
                          title="ลบออกจากตะกร้า"
                        >
                          <i class="fas fa-trash-alt"></i>
                        </button>
                      </div>

                        <div class="d-flex align-items-center gap-2 mt-2">
                          <label class="form-label small mb-0 text-nowrap">จำนวน:</label>
                          <div class="input-group input-group-sm" style="width: 120px;">
                            <button class="btn btn-outline-secondary" type="button" @click="decreaseQuantity(item)">
                              <i class="fas fa-minus"></i>
                            </button>
                            <input
                              type="number"
                              class="form-control text-center"
                              v-model.number="item.quantity"
                              min="1"
                              @change="updateQuantity(item)"
                            />
                            <button class="btn btn-outline-secondary" type="button" @click="increaseQuantity(item)">
                              <i class="fas fa-plus"></i>
                            </button>
                          </div>
                          
                          <!-- Discount Button -->
                          <button 
                            class="btn btn-sm ms-auto" 
                            :class="item.discount > 0 ? 'btn-warning' : 'btn-outline-secondary'"
                            @click="editDiscount(item)"
                            title="ส่วนลดรายการ"
                          >
                            <i class="fas fa-tag me-1"></i>
                            <span v-if="item.discount > 0">-{{ item.discount.toLocaleString() }}</span>
                            <span v-else>ส่วนลด</span>
                          </button>
                        </div>

                      <div class="mt-2 pt-2 border-top">
                        <div class="d-flex justify-content-between">
                          <span class="text-muted small">รวม:</span>
                          <span class="fw-bold text-success small">
                            ฿{{
                              getLineTotal(item).toLocaleString("th-TH", {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })
                            }}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Cart Summary -->
            <div v-if="cart.length > 0" class="mt-3 pt-3 border-top">
              <div class="d-flex justify-content-between mb-2">
                <span>จำนวนรายการ:</span>
                <span class="fw-bold">{{ cart.length }}</span>
              </div>
              <div class="d-flex justify-content-between mb-2">
                <span class="h5 mb-0">ยอดรวมสุทธิ:</span>
                  <div class="input-group" style="width: 180px;">
                    <span class="input-group-text bg-success text-white border-success">฿</span>
                    <input
                      type="number"
                      class="form-control text-end fw-bold text-success fs-5"
                      v-model.number="totalAmount"
                      min="0"
                    />
                  </div>
              </div>

              <!-- Global Discount Section -->
              <div class="mb-3 border-top pt-2">
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <span class="small fw-bold">ส่วนลดท้ายบิล:</span>
                  <div class="input-group input-group-sm" style="width: 150px;">
                    <span class="input-group-text">฿</span>
                    <input type="number" class="form-control text-end" v-model.number="globalDiscount" min="0">
                  </div>
                </div>
                <div class="row g-2">
                  <div class="col-4">
                    <button class="btn btn-sm btn-outline-secondary w-100" @click="applyGlobalDiscount(3)">3%</button>
                  </div>
                  <div class="col-4">
                    <button class="btn btn-sm btn-outline-secondary w-100" @click="applyGlobalDiscount(7)">7%</button>
                  </div>
                  <div class="col-4">
                    <button class="btn btn-sm btn-outline-secondary w-100" @click="applyGlobalDiscount(10)">10%</button>
                  </div>
                </div>
              </div>

              <!-- Payment Method Selection -->
              <div class="mb-3 p-3 bg-light rounded">
                <label class="form-label fw-bold mb-2">
                  <i class="fas fa-credit-card me-2"></i>วิธีการชำระเงิน
                </label>
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="radio"
                    name="payment"
                    id="payment-cash"
                    value="cash"
                    v-model="paymentMethod"
                  />
                  <label class="form-check-label" for="payment-cash">
                    <i class="fas fa-money-bill-wave me-2"></i>เงินสด
                  </label>
                </div>
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="radio"
                    name="payment"
                    id="payment-qrcode"
                    value="qrcode"
                    v-model="paymentMethod"
                  />
                  <label class="form-check-label" for="payment-qrcode">
                    <i class="fas fa-qrcode me-2"></i>สแกน QR Code
                  </label>
                </div>

                <!-- Payment Details (Show for ALL methods) -->
                <div class="mt-3 border-top pt-3">
                  <div class="mb-2">
                    <label class="form-label small">รับเงินมา:</label>
                    <div class="input-group">
                      <span class="input-group-text">฿</span>
                      <input type="number" class="form-control" v-model.number="receivedAmount" placeholder="0.00">
                    </div>
                  </div>
                  <div class="d-flex justify-content-between align-items-center">
                    <span class="fw-bold">เงินทอน:</span>
                    <span class="h5 mb-0" :class="changeAmount < 0 ? 'text-danger' : 'text-success'">
                      ฿{{ changeAmount.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }}
                    </span>
                  </div>
                </div>
              </div>

              <div v-if="saleError" class="alert alert-danger small mb-3">
                <i class="fas fa-exclamation-circle me-2"></i>
                {{ saleError }}
              </div>

              <div class="d-grid gap-2">
                <button
                  class="btn btn-success btn-lg fw-bold"
                  @click="submitSale"
                  :disabled="cart.length === 0 || isSubmitting"
                >
                  <span
                    v-if="isSubmitting"
                    class="spinner-border spinner-border-sm me-2"
                  ></span>
                  <i v-else class="fas fa-check-circle me-2"></i>
                  {{ isSubmitting ? "กำลังบันทึก..." : "ยืนยันการขาย" }}
                </button>
                <button
                  class="btn btn-outline-secondary"
                  @click="clearCart"
                  :disabled="isSubmitting"
                >
                  <i class="fas fa-trash me-2"></i>
                  ล้างตะกร้า
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>




      <!-- 3. ประวัติการขายล่าสุด -->
      <div class="col-lg-5 offset-lg-7 order-lg-3 order-3">
        <div class="card shadow-sm">
          <div
            class="card-header bg-white p-3 d-flex justify-content-between align-items-center"
          >
            <h3 class="h5 mb-0 text-secondary-emphasis">
              <i class="fas fa-history me-2"></i>ประวัติการขายล่าสุด
            </h3>
            <NuxtLink
              to="/sales-history"
              class="btn btn-sm btn-outline-primary rounded-pill px-3"
            >
              ดูทั้งหมด
            </NuxtLink>
          </div>
          <div class="card-body p-0">
            <div v-if="salesPending" class="text-center py-4">
              <div
                class="spinner-border text-secondary spinner-border-sm"
                role="status"
              ></div>
            </div>
            <div
              v-else-if="recentSales.length === 0"
              class="text-center text-muted py-4"
            >
              <small>ยังไม่มีรายการขาย</small>
            </div>
            <div v-else class="list-group list-group-flush">
              <div
                v-for="sale in recentSales"
                :key="sale.id"
                class="list-group-item list-group-item-action px-3 py-3"
              >
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <div class="fw-bold text-dark mb-1">
                      บิล #{{ sale.id }} 
                      <span class="badge bg-light text-dark border ms-1">{{ sale.created_by_username }}</span>
                    </div>
                    <div class="small text-secondary mb-1 text-truncate" style="max-width: 200px;">
                      <i class="fas fa-box-open me-1 text-muted"></i>{{ sale.product_names || '-' }}
                    </div>
                    <div class="small text-muted">
                      <span class="me-2"><i class="fas fa-layer-group me-1"></i>{{ sale.total_quantity || 0 }} ชิ้น</span>
                      <span><i class="far fa-clock me-1"></i>{{ new Date(sale.sale_date).toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }) }}</span>
                    </div>
                  </div>
                  <div class="text-end">
                    <div class="fw-bold text-success fs-5">
                      ฿{{ sale.total_amount.toLocaleString("th-TH") }}
                    </div>
                    <small v-if="sale.discount > 0" class="d-block text-danger" style="font-size: 0.75rem;">
                      (ส่วนลด: {{ Number(sale.discount).toLocaleString("th-TH") }})
                    </small>
                  </div>
                </div>
                
                <!-- Payment Details & Actions -->
                <div class="d-flex justify-content-between align-items-center pt-2 border-top mt-2">
                  <div class="small text-muted">
                    <div v-if="sale.payment_method === 'cash'">
                      รับ: {{ Number(sale.received_amount || 0).toLocaleString("th-TH") }} | 
                      ทอน: {{ Number(sale.change_amount || 0).toLocaleString("th-TH") }}
                    </div>
                    <div v-else>
                      <span class="badge bg-info text-dark"><i class="fas fa-qrcode me-1"></i>QR Code</span>
                    </div>
                  </div>
                  <div>
                     <button class="btn btn-sm btn-outline-primary border-0 me-1" @click="editSale(sale)" title="แก้ไขบิล">
                        <i class="fas fa-edit"></i>
                     </button>
                     <button class="btn btn-sm btn-outline-danger border-0" @click="deleteSale(sale.id)" title="ยกเลิกบิล">
                        <i class="fas fa-trash-alt"></i>
                     </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- QR Code Payment Modal -->
    <teleport to="body">
      <div v-if="showPaymentModal" class="modal-overlay">
        <div class="modal-content payment-modal">
          <div class="modal-header">
            <h5 class="modal-title fw-bold">
              <i class="fas fa-qrcode me-2 text-primary"></i>สแกน QR Code
              เพื่อชำระเงิน
            </h5>
            <button
              type="button"
              class="btn-close"
              @click="cancelQRPayment"
              :disabled="isSubmitting"
            ></button>
          </div>
          <div class="modal-body text-center">
            <div class="mb-4">
              <p class="text-muted mb-2">ยอดรวม:</p>
              <h3 class="text-success fw-bold">
                ฿{{
                  totalAmount.toLocaleString("th-TH", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })
                }}
              </h3>
            </div>

            <div class="qr-code-container mb-4">
              <div class="qr-code-box">
                <img
                  src="/uploads/pay.jpg"
                  alt="QR Code Payment"
                  class="qr-code-image"
                />
              </div>
            </div>

            <p class="text-muted small mb-3">
              <i class="fas fa-info-circle me-2"></i>
              โปรดสแกน QR Code ด้านบนเพื่อชำระเงิน
            </p>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              class="btn btn-outline-secondary"
              @click="cancelQRPayment"
              :disabled="isSubmitting"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              class="btn btn-success fw-bold"
              @click="confirmPayment"
              :disabled="isSubmitting"
            >
              <span
                v-if="isSubmitting"
                class="spinner-border spinner-border-sm me-2"
              ></span>
              <i v-else class="fas fa-check me-2"></i>
              {{ isSubmitting ? "กำลังบันทึก..." : "ยืนยันการชำระเงิน" }}
            </button>
          </div>
        </div>
      </div>
    </teleport>

    <!-- Receipt Template (Hidden on Screen, Visible on Print) -->
    <teleport to="body">
      <div id="receipt-print-area" v-if="receiptData">
        <div class="receipt-container">
          <div class="receipt-header">
            <h4 class="shop-name">{{ merchantName }}</h4>
            <p class="receipt-info">
              วันที่: {{ receiptData.date }}<br>
              บิลเลขที่: #{{ receiptData.id }}<br>
              พนักงาน: {{ receiptData.cashier }}
            </p>
          </div>
          
          <div class="receipt-divider">--------------------------------</div>
          
          <table class="receipt-table">
            <thead>
              <tr>
                <th class="text-start">รายการ</th>
                <th class="text-end">รวม</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(item, index) in receiptData.items" :key="index">
                <td colspan="2">
                  <div class="item-row">
                    <span class="item-name">{{ item.name }}</span>
                  </div>
                  <div class="item-details">
                    {{ item.quantity }} x {{ item.sell_price.toLocaleString() }}
                    <span class="item-total">{{ ((item.quantity * item.sell_price) - (item.discount || 0)).toLocaleString() }}</span>
                  </div>
                  <div v-if="item.discount > 0" class="text-end" style="font-size: 10px;">
                    (ส่วนลด: -{{ item.discount.toLocaleString() }})
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <div class="receipt-divider">--------------------------------</div>

          <div class="receipt-summary">
            <div class="summary-row">
              <span>ยอดรวม:</span>
              <span>{{ receiptData.subtotal.toLocaleString('th-TH', { minimumFractionDigits: 2 }) }}</span>
            </div>
            <div class="summary-row" v-if="receiptData.discount > 0">
              <span>ส่วนลด:</span>
              <span>-{{ receiptData.discount.toLocaleString('th-TH', { minimumFractionDigits: 2 }) }}</span>
            </div>
            <div class="summary-row total-row">
              <span>สุทธิ:</span>
              <span>{{ receiptData.total.toLocaleString('th-TH', { minimumFractionDigits: 2 }) }}</span>
            </div>
            <div class="receipt-divider-dotted">................................</div>
            <div class="summary-row">
              <span>ชำระโดย:</span>
              <span>{{ receiptData.paymentMethod === 'qrcode' ? 'QR Code' : 'เงินสด' }}</span>
            </div>
            <div class="summary-row">
              <span>รับเงิน:</span>
              <span>{{ receiptData.received.toLocaleString('th-TH', { minimumFractionDigits: 2 }) }}</span>
            </div>
            <div class="summary-row">
              <span>เงินทอน:</span>
              <span>{{ receiptData.change.toLocaleString('th-TH', { minimumFractionDigits: 2 }) }}</span>
            </div>
          </div>

          <div class="receipt-footer">
            <p>ขอบคุณที่ใช้บริการ</p>
            <p>Thank You</p>
          </div>
        </div>
      </div>
    </teleport>
  </div>
</template>

<script setup>
import axios from "axios";
import { ref, onMounted, computed } from "vue";
import Swal from "sweetalert2";

// 1. การตั้งค่า Layout
definePageMeta({
  layout: "default",
});

const token = useCookie("token");
const { handleApiError } = useApiError();

// 2. State สำหรับ "รายการสินค้า" (ฝั่งซ้าย)
const products = ref([]);
const pending = ref(true);
const error = ref(null);

// Sort State
const sortKey = ref("id");
const sortOrder = ref("asc");

const sortedProducts = computed(() => {
  if (!products.value) return [];
  
  let result = [...products.value];

  if (sortKey.value) {
    result.sort((a, b) => {
      let modifier = sortOrder.value === "asc" ? 1 : -1;
      let valA = a[sortKey.value];
      let valB = b[sortKey.value];

      // Handle numbers
      if (!isNaN(valA) && !isNaN(valB)) {
          valA = Number(valA);
          valB = Number(valB);
      } else {
          valA = valA ? valA.toString().toLowerCase() : "";
          valB = valB ? valB.toString().toLowerCase() : "";
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


// 3. State สำหรับ "ตะกร้าสินค้า" (ฝั่งขวา)
const cart = ref([]); // นี่คือหัวใจของหน้านี้
const globalDiscount = ref(0); // ส่วนลดท้ายบิล
const isSubmitting = ref(false); // สถานะกำลังบันทึก
const saleError = ref(null);

// 4. State สำหรับการชำระเงิน
const paymentMethod = ref("cash"); // 'cash' หรือ 'qrcode'
const showPaymentModal = ref(false);
const qrCodeData = ref(null); // ข้อมูล QR code สำหรับสแกน
const merchantName = ref("Fahfi Shop"); // ชื่อร้านค้า
const receivedAmount = ref(0); // เงินที่รับมา

// Receipt Data
const receiptData = ref(null);

// คำนวณเงินทอน
const changeAmount = computed(() => {
  if (!receivedAmount.value || receivedAmount.value <= 0) return 0;
  return receivedAmount.value - totalAmount.value;
});

// 5. State สำหรับ "ประวัติการขายล่าสุด" (New!)
const recentSales = ref([]);
const salesPending = ref(false);

// 4. ฟังก์ชันดึงข้อมูลสินค้า (เมื่อเปิดหน้า)
const fetchProducts = async () => {
  pending.value = true;
  try {
    const response = await axios.get("/api/products", {
      headers: { Authorization: `Bearer ${token.value}` },
    });
    products.value = response.data;
  } catch (err) {
    // ตรวจสอบ Auth Error (403, 401)
    const isAuthError = await handleApiError(err);
    if (isAuthError) return;

    error.value = err.response ? err.response.data : err;
  } finally {
    pending.value = false;
  }
};

// ฟังก์ชันดึงประวัติการขายล่าสุด (New!)
const fetchRecentSales = async () => {
  salesPending.value = true;
  try {
    const response = await axios.get('/api/sales/recent', {
      headers: { 'Authorization': `Bearer ${token.value}` }
    });
    recentSales.value = response.data;
  } catch (err) {
    console.error("Error fetching recent sales:", err);
  } finally {
    salesPending.value = false;
  }
};

onMounted(() => {
  fetchProducts();
  fetchRecentSales(); // ดึงข้อมูลเมื่อเปิดหน้า
});

// Helper Functions for Quantity
const increaseQuantity = (item) => {
  if (item.quantity < item.stock) {
    item.quantity++;
    updateQuantity(item); // Recalculate discount
  } else {
    alert(`สต็อกไม่พอ! (มี ${item.stock} ชิ้น)`);
  }
};

const decreaseQuantity = (item) => {
  if (item.quantity > 1) {
    item.quantity--;
    updateQuantity(item); // Recalculate discount
  }
};

// 5. ฟังก์ชันจัดการ "ตะกร้าสินค้า" (Cart)

const addToCart = (product) => {
  if (product.stock_quantity <= 0) {
    alert("สินค้านี้หมดสต็อก");
    return;
  }

  // ตรวจสอบว่ามีในตะกร้าหรือยัง
  const existingItem = cart.value.find(
    (item) => item.product_id === product.id
  );

  if (existingItem) {
    // ถ้ามีแล้ว ให้เพิ่มจำนวน
    existingItem.quantity++;
  } else {
    // ถ้ายังไม่มี ให้เพิ่มเข้าไปใหม่
    cart.value.push({
      product_id: product.id,
      name: product.name,
      sell_price: product.sell_price,
      quantity: 1,
      stock: product.stock_quantity,
      discount: 0,
      discountType: 'total', // 'total' or 'unit'
      discountValue: 0
    });
  }
};

const removeFromCart = (index) => {
  cart.value.splice(index, 1);
};

const clearCart = () => {
  if (window.confirm("คุณแน่ใจหรือไม่ว่าต้องการล้างตะกร้า?")) {
    cart.value = [];
    globalDiscount.value = 0; // Reset discount
    saleError.value = null;
  }
};

const updateQuantity = (item) => {
  // ตรวจสอบว่าใส่จำนวนเกินสต็อกหรือไม่
  if (item.quantity > item.stock) {
    alert(`สต็อกไม่พอ! (มี ${item.stock} ชิ้น)`);
    item.quantity = item.stock;
  }
  if (item.quantity < 1) {
    item.quantity = 1;
  }
  
  // Recalculate discount if per unit
  if (item.discountType === 'unit') {
    item.discount = item.discountValue * item.quantity;
  }
};

// ฟังก์ชันแก้ไขส่วนลดรายการ
const editDiscount = async (item) => {
  const { value: formValues } = await Swal.fire({
    title: 'ส่วนลดรายการสินค้า',
    html:
      `<div class="mb-3 text-start">
        <label class="form-label">ประเภทส่วนลด</label>
        <select id="swal-discount-type" class="form-select">
          <option value="total" ${item.discountType === 'total' ? 'selected' : ''}>ยอดรวม (บาท)</option>
          <option value="unit" ${item.discountType === 'unit' ? 'selected' : ''}>ต่อชิ้น (บาท)</option>
        </select>
      </div>
      <div class="mb-3 text-start">
        <label class="form-label">มูลค่าส่วนลด</label>
        <input id="swal-discount-value" type="number" class="form-control" value="${item.discountValue || 0}" min="0">
      </div>`,
    focusConfirm: false,
    showCancelButton: true,
    confirmButtonText: 'บันทึก',
    cancelButtonText: 'ยกเลิก',
    preConfirm: () => {
      return {
        type: document.getElementById('swal-discount-type').value,
        value: Number(document.getElementById('swal-discount-value').value)
      }
    }
  });

  if (formValues) {
    item.discountType = formValues.type;
    item.discountValue = formValues.value;
    
    if (formValues.type === 'unit') {
      item.discount = formValues.value * item.quantity;
    } else {
      item.discount = formValues.value;
    }
  }
};

// ฟังก์ชันคำนวณส่วนลดท้ายบิล
const applyGlobalDiscount = (percent) => {
  // 1. คำนวณยอดสุทธิก่อนปัดเศษ (Raw Net Total)
  const rawDiscount = subtotal.value * (percent / 100);
  const rawNetTotal = subtotal.value - rawDiscount;

  // 2. ปัดเศษยอดสุทธิให้ลงท้ายด้วย 0 หรือ 5 (ปัดทิ้ง / Floor)
  // เช่น 134.83 -> 130, 129.27 -> 125
  const targetNetTotal = Math.floor(rawNetTotal / 5) * 5;

  // 3. คำนวณส่วนลดที่ต้องใช้เพื่อให้ได้ยอดสุทธินั้น
  // ส่วนลด = ยอดรวม - ยอดสุทธิเป้าหมาย
  globalDiscount.value = Math.max(0, subtotal.value - targetNetTotal);
};

// ฟังก์ชันคำนวณรวมต่อรายการ
const getLineTotal = (item) => {
  return (item.sell_price * item.quantity) - (item.discount || 0);
};

// 6. (สำคัญ) การคำนวณยอดรวม (Computed Property)
const subtotal = computed(() => {
  return cart.value.reduce((total, item) => {
    return total + getLineTotal(item);
  }, 0);
});

const totalAmount = computed({
  get() {
    return Math.max(0, subtotal.value - globalDiscount.value);
  },
  set(newValue) {
    // คำนวณส่วนลดย้อนกลับ: ส่วนลด = ยอดรวมสินค้า - ยอดสุทธิที่แก้
    const newDiscount = subtotal.value - newValue;
    globalDiscount.value = parseFloat(newDiscount.toFixed(2));
  }
});

// 7. ฟังก์ชัน "ยืนยันการขาย" (Submit)
const submitSale = async () => {
  // ถ้าเลือก QR code ให้แสดง QR code modal ก่อน
  if (paymentMethod.value === "qrcode") {
    showPaymentModal.value = true;
    return;
  }

  // ถ้าเลือก Transfer ให้ส่ง request เลย
  await confirmPayment();
};

// ฟังก์ชันยืนยันการชำระเงิน
const confirmPayment = async () => {
  isSubmitting.value = true;
  saleError.value = null;

  // เก็บยอดรวมไว้ก่อน เพราะจะรีเซ็ต cart ทีหลัง
  const finalAmount = totalAmount.value;
  const currentCart = [...cart.value]; // Clone cart items
  const currentDiscount = globalDiscount.value;
  const currentReceived = receivedAmount.value;
  const currentChange = changeAmount.value;
  const currentPaymentMethod = paymentMethod.value;

  try {
    // 1. เตรียม "ตะกร้า" (Cart)
    const saleData = {
      cart: cart.value.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        discount_amount: item.discount || 0
      })),
      totalAmount: finalAmount,
      globalDiscount: globalDiscount.value,
      paymentMethod: paymentMethod.value,
      receivedAmount: receivedAmount.value, // ส่งยอดรับเงิน
      changeAmount: changeAmount.value,     // ส่งยอดเงินทอน
    };

    // 2. ยิง API
    const response = await axios.post("/api/sales", saleData, {
      headers: { Authorization: `Bearer ${token.value}` },
    });

    // 3. ถ้าสำเร็จ
    showPaymentModal.value = false;
    cart.value = [];
    globalDiscount.value = 0; // รีเซ็ตส่วนลด
    saleError.value = null;
    paymentMethod.value = "transfer"; // รีเซ็ตเป็น default
    receivedAmount.value = 0;

    // Prepare Receipt Data
    receiptData.value = {
      id: response.data.saleId,
      date: new Date().toLocaleString('th-TH'),
      cashier: 'Admin', // In real app, get from user state
      items: currentCart,
      subtotal: currentCart.reduce((sum, item) => sum + ((item.sell_price * item.quantity) - (item.discount || 0)), 0),
      discount: currentDiscount,
      total: finalAmount,
      received: currentReceived,
      change: currentChange,
      paymentMethod: currentPaymentMethod
    };

    // แสดง Success message พร้อมปุ่มพิมพ์
    const result = await Swal.fire({
      icon: "success",
      title: "บันทึกการขายสำเร็จ!",
      html: `<p style="font-size: 16px;">ยอดรวม</p><h2 style="color: #10b981; font-weight: bold; font-size: 32px;">฿${finalAmount.toLocaleString(
        "th-TH",
        { minimumFractionDigits: 2, maximumFractionDigits: 2 }
      )}</h2>`,
      showCancelButton: true,
      confirmButtonText: '<i class="fas fa-print"></i> พิมพ์ใบเสร็จ',
      cancelButtonText: 'ปิด',
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#6c757d",
      reverseButtons: true
    });

    if (result.isConfirmed) {
      // Trigger Print
      setTimeout(() => {
        window.print();
      }, 500);
    }

    await fetchProducts();
    await fetchRecentSales(); // อัปเดตประวัติการขายทันที
  } catch (err) {
    // ตรวจสอบ Auth Error (403, 401)
    const isAuthError = await handleApiError(err);
    if (isAuthError) return;

    const message = err.response ? err.response.data.message : err.message;
    saleError.value = `เกิดข้อผิดพลาด: ${message}`;
  } finally {
    isSubmitting.value = false;
  }
};

// ฟังก์ชันสำหรับยกเลิก QR code modal
const cancelQRPayment = () => {
  showPaymentModal.value = false;
  qrCodeData.value = null;
};

// ฟังก์ชันลบบิล (Void)
const deleteSale = async (saleId) => {
  const result = await Swal.fire({
    title: 'ยืนยันการยกเลิกบิล?',
    text: `คุณต้องการยกเลิกบิล #${saleId} ใช่หรือไม่? (สต็อกจะถูกคืนกลับ)`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'ใช่, ยกเลิกบิล',
    cancelButtonText: 'ไม่'
  });

  if (result.isConfirmed) {
    try {
      await axios.delete(`/api/sales/${saleId}`, {
        headers: { Authorization: `Bearer ${token.value}` }
      });
      
      await Swal.fire(
        'ยกเลิกสำเร็จ!',
        `บิล #${saleId} ถูกยกเลิกเรียบร้อยแล้ว`,
        'success'
      );
      
      // Refresh data
      fetchRecentSales();
      fetchProducts(); // Update stock
      
    } catch (err) {
      console.error("Error deleting sale:", err);
      Swal.fire(
        'เกิดข้อผิดพลาด',
        err.response?.data?.message || 'ไม่สามารถยกเลิกบิลได้',
        'error'
      );
    }
  }
};

// ฟังก์ชันแก้ไขบิล (ดึงกลับมาทำรายการใหม่)
const editSale = async (sale) => {
  const result = await Swal.fire({
    title: 'แก้ไขบิล?',
    text: `คุณต้องการดึงบิล #${sale.id} กลับมาแก้ไขในตะกร้าหรือไม่? (บิลเดิมจะถูกยกเลิกและสต็อกจะถูกคืน)`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: 'ใช่, ดึงข้อมูลกลับมา',
    cancelButtonText: 'ไม่'
  });

  if (result.isConfirmed) {
    try {
      // 1. ดึงรายละเอียดบิล
      const response = await axios.get(`/api/sales/${sale.id}`, {
        headers: { Authorization: `Bearer ${token.value}` }
      });
      const saleDetails = response.data; // สมมติว่า API นี้คืนรายละเอียดสินค้าด้วย

      // 2. ตรวจสอบว่ามีสินค้าในตะกร้าอยู่แล้วหรือไม่
      if (cart.value.length > 0) {
        const confirmClear = await Swal.fire({
          title: 'ตะกร้าไม่ว่าง',
          text: 'มีสินค้าค้างอยู่ในตะกร้า ต้องการล้างตะกร้าเดิมและแทนที่ด้วยบิลนี้หรือไม่?',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'แทนที่',
          cancelButtonText: 'ยกเลิก'
        });
        if (!confirmClear.isConfirmed) return;
      }

      // 3. ยกเลิกบิลเดิม (คืนสต็อก)
      await axios.delete(`/api/sales/${sale.id}`, {
        headers: { Authorization: `Bearer ${token.value}` }
      });

      // 4. นำสินค้าเข้าตะกร้า
      // หมายเหตุ: ต้อง map ข้อมูลให้ตรงกับโครงสร้าง cart
      // เราอาจต้องดึงข้อมูลสินค้าล่าสุดเพื่อให้ได้ราคาและสต็อกปัจจุบัน
      cart.value = [];
      // (ส่วนนี้ต้องมีการจัดการข้อมูลที่ซับซ้อนขึ้นเล็กน้อย เพื่อให้แน่ใจว่าข้อมูลถูกต้อง)
      // สำหรับตอนนี้ ให้ Redirect ไปหน้าประวัติการขายเพื่อแก้ไขจะปลอดภัยกว่า
       await Swal.fire({
        icon: 'info',
        title: 'ไปที่หน้าประวัติการขาย',
        text: 'ระบบจะนำคุณไปที่หน้าประวัติการขายเพื่อทำการแก้ไขรายละเอียด',
        showConfirmButton: false,
        timer: 1500
      });
      navigateTo('/sales-history');

    } catch (err) {
      console.error("Error editing sale:", err);
      Swal.fire('เกิดข้อผิดพลาด', 'ไม่สามารถดึงข้อมูลบิลได้', 'error');
    }
  }
};
const getCategoryColor = (category) => {
  if (!category) return "bg-secondary bg-opacity-10 text-secondary border-secondary border-opacity-25";
  
  const cat = category.toLowerCase();
  
  // 1. Explicit Mappings (Common Categories)
  if (cat.includes("เสื้อ") || cat.includes("top") || cat.includes("shirt")) {
      return "bg-primary bg-opacity-10 text-primary border-primary border-opacity-25"; // Changed to primary (blue)
  } 
  if (cat.includes("กางเกง") || cat.includes("bottom") || cat.includes("pant") || cat.includes("skirt")) {
      return "bg-success bg-opacity-10 text-success border-success border-opacity-25";
  } 
  if (cat.includes("ชุด") || cat.includes("set") || cat.includes("suit") || cat.includes("dress")) {
      return "bg-info bg-opacity-10 text-info border-info border-opacity-25"; // Changed to info (light blue)
  } 
  if (cat.includes("หมวก") || cat.includes("hat") || cat.includes("cap")) {
      return "bg-warning bg-opacity-10 text-warning border-warning border-opacity-25";
  }
  if (cat.includes("กระเป๋า") || cat.includes("bag")) {
      return "bg-danger bg-opacity-10 text-danger border-danger border-opacity-25";
  }
  if (cat.includes("ถุงเท้า") || cat.includes("sock")) {
      return "bg-dark bg-opacity-10 text-dark border-dark border-opacity-25";
  }
  if (cat.includes("รองเท้า") || cat.includes("shoe")) {
      return "bg-secondary bg-opacity-10 text-secondary border-secondary border-opacity-25";
  }
  if (cat.includes("ลดราคา") || cat.includes("sale") || cat.includes("ตำหนิ")) {
      return "bg-danger text-white border-danger"; // Highlight Sale items more
  } 

  // 2. Hash-based Fallback for other categories
  // This ensures consistent colors for the same category name without manual mapping
  const colors = [
    "bg-primary bg-opacity-10 text-primary border-primary border-opacity-25", // Blue
    "bg-info bg-opacity-10 text-info border-info border-opacity-25",       // Light Blue
    "bg-success bg-opacity-10 text-success border-success border-opacity-25",
    "bg-danger bg-opacity-10 text-danger border-danger border-opacity-25",
    "bg-warning bg-opacity-10 text-warning border-warning border-opacity-25",
    "bg-dark bg-opacity-10 text-dark border-dark border-opacity-25",
    "bg-secondary bg-opacity-10 text-secondary border-secondary border-opacity-25",
  ];
  
  let hash = 0;
  for (let i = 0; i < cat.length; i++) {
    hash = cat.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const index = Math.abs(hash) % colors.length;
  return colors[index];
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
</script>

<style scoped>
* {
  font-family: "Sarabun", -apple-system, BlinkMacSystemFont, "Segoe UI",
    sans-serif;
}

/* Table Styles */
.table {
  margin-bottom: 0;
}

.table thead th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #495057;
  border-bottom: 2px solid #dee2e6;
  vertical-align: middle;
}

.table tbody tr {
  transition: all 0.2s ease;
}

.table tbody tr.cursor-pointer-row {
  cursor: pointer;
}

.cursor-pointer {
  cursor: pointer;
  user-select: none;
}

.cursor-pointer:hover {
  background-color: #f1f5f9;
}

.table tbody tr.cursor-pointer-row:hover {
  background-color: #e7f3ff;
  transform: translateX(4px);
  box-shadow: inset 4px 0 0 0 #3b82f6;
}

.table tbody tr.table-secondary {
  opacity: 0.6;
}

.table tbody tr.table-secondary:hover {
  background-color: #f8f9fa;
  transform: none;
  box-shadow: none;
  cursor: not-allowed;
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
  transform: scale(1.08);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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

/* Action Button Styles */
.action-btn {
  color: #3b82f6;
  padding: 8px 10px;
  font-size: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 36px;
  height: 36px;
  transition: all 0.2s ease;
}

.action-btn:hover:not(:disabled) {
  background-color: #dbeafe;
  color: #1d4ed8;
  transform: scale(1.1);
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Cart Item Styles */
.cart-item {
  background: #f9fafb;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.cart-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background: white;
}

.cart-item .card-body {
  border-radius: 8px;
}

/* Cart Thumbnail Styles */
.cart-item-image {
  display: flex;
  justify-content: center;
  align-items: center;
}

.cart-thumbnail {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Modal Overlay Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 20px;
}

.modal-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 100%;
  animation: slideUp 0.3s ease-out;
}

.payment-modal {
  border: none;
}

.payment-modal .modal-header {
  border-bottom: 2px solid #f0f0f0;
  padding: 20px;
  border-radius: 12px 12px 0 0;
}

.payment-modal .modal-body {
  padding: 30px 20px;
}

.payment-modal .modal-footer {
  border-top: 1px solid #f0f0f0;
  padding: 20px;
  border-radius: 0 0 12px 12px;
}

/* QR Code Styles */
.qr-code-container {
  display: flex;
  justify-content: center;
}

.qr-code-box {
  padding: 20px;
  background: #f9fafb;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
}

.qr-code-image {
  max-width: 100%;
  height: auto;
  max-height: 450px;
  width: auto;
  border-radius: 8px;
}

/* Animation */
@keyframes slideUp {
  from {
    transform: translateY(50px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

/* Form Controls */
.form-control-sm {
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
}

.form-control-sm:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.25);
}

/* Card Styles */
.card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.card-header {
  border-bottom: 1px solid #e5e7eb;
  border-radius: 12px 12px 0 0;
}

/* Badge Styles */
.badge {
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  font-weight: 500;
}

/* Text Formatting */
.fw-bold {
  font-weight: 600;
}

.text-success {
  color: #10b981 !important;
}

/* Responsive Design */
@media (max-width: 992px) {
  /* .row.g-3 { flex-direction: column-reverse; } Removed to fix ordering */

  .col-lg-7,
  .col-lg-5 {
    max-width: 100%;
    flex: 0 0 100%;
  }

  .sticky-top {
    position: static !important;
    margin-top: 20px;
  }

  .table-responsive {
    max-height: 50vh !important;
  }

  .action-btn {
    padding: 6px 8px;
    min-width: 32px;
    height: 32px;
    font-size: 14px;
  }
}

@media (max-width: 768px) {
  .table {
    font-size: 0.875rem;
  }

  .table thead th {
    padding: 0.5rem;
  }

  .table tbody td {
    padding: 0.75rem 0.5rem;
  }

  .product-thumbnail {
    width: 60px;
    height: 60px;
  }

  .product-image-placeholder {
    width: 60px;
    height: 60px;
    font-size: 18px;
  }

  .card-body {
    padding: 1rem;
  }

  .btn-lg {
    padding: 0.75rem 1rem;
    font-size: 1rem;
  }

  .row.g-3 {
    --bs-gutter-x: 1rem;
    --bs-gutter-y: 1rem;
  }
}

@media (max-width: 576px) {
  .table {
    font-size: 0.75rem;
  }

  .table thead th {
    padding: 0.4rem 0.2rem;
  }

  .table tbody td {
    padding: 0.5rem 0.2rem;
  }

  .product-thumbnail {
    width: 50px;
    height: 50px;
  }

  .product-image-placeholder {
    width: 50px;
    height: 50px;
    font-size: 16px;
  }

  .card-header {
    padding: 1rem 0.75rem !important;
  }

  .card-body {
    padding: 0.75rem;
  }

  .h3 {
    font-size: 1.25rem;
  }

  .h5 {
    font-size: 1rem;
  }

  .btn-sm {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }

  .col-md-6 {
    flex: 0 0 100%;
    max-width: 100%;
  }

  .form-control-sm {
    font-size: 0.875rem;
  }

  .text-end {
    text-align: left !important;
  }

  /* Hide less important columns on small screens */
  .table thead th:nth-child(4),
  .table tbody td:nth-child(4) {
    display: none;
  }

  /* QR Code Modal Mobile */
  .modal-overlay {
    padding: 10px;
  }

  .modal-content {
    max-width: 100%;
  }

  .qr-code-box {
    padding: 15px;
  }

  .payment-modal .modal-body {
    padding: 20px 15px;
  }

  .payment-modal .modal-header,
  .payment-modal .modal-footer {
    padding: 15px;
  }
}



/* Animation for loading state */
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.spinner-border {
  animation: spin 1s linear infinite;
}

/* Scrollbar Styling */
.table-responsive::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.table-responsive::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 10px;
}

.table-responsive::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

.table-responsive::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
</style>

<!-- Global Print Styles -->
<style>
/* Print Styles (สำหรับการพิมพ์) */
@media print {
  /* Hide everything by default */
  body > * {
    display: none !important;
  }

  /* Show only the receipt area */
  #receipt-print-area {
    display: block !important;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    margin: 0;
    padding: 0;
    background: white;
    z-index: 9999;
  }

  /* Reset body margins */
  body, html {
    margin: 0;
    padding: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }
}

/* Receipt Styling (Visible only in print or preview) */
#receipt-print-area {
  display: none; /* Hidden on screen */
  width: 58mm; /* Standard thermal paper width */
  font-family: 'Courier New', Courier, monospace; /* Monospace for alignment */
  font-size: 12px;
  line-height: 1.4;
  color: black;
  padding: 10px;
  background: white;
}

.receipt-container {
  width: 100%;
}

.receipt-header {
  text-align: center;
  margin-bottom: 10px;
}

.shop-name {
  font-size: 16px;
  font-weight: bold;
  margin: 0 0 5px 0;
}

.receipt-info {
  font-size: 10px;
  margin: 0;
}

.receipt-divider {
  text-align: center;
  margin: 5px 0;
  overflow: hidden;
  white-space: nowrap;
}

.receipt-divider-dotted {
  text-align: center;
  margin: 5px 0;
  overflow: hidden;
  white-space: nowrap;
  border-bottom: 1px dotted black;
  height: 1px;
}

.receipt-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 5px;
}

.receipt-table th {
  font-size: 10px;
  border-bottom: 1px solid black;
  padding-bottom: 2px;
}

.item-row {
  margin-top: 4px;
}

.item-name {
  font-weight: bold;
  display: block;
}

.item-details {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  padding-left: 10px;
}

.receipt-summary {
  margin-top: 5px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2px;
}

.total-row {
  font-weight: bold;
  font-size: 14px;
  margin-top: 5px;
  border-top: 1px solid black;
  border-bottom: 1px solid black;
  padding: 5px 0;
}

.receipt-footer {
  text-align: center;
  margin-top: 15px;
  font-size: 10px;
}
</style>
