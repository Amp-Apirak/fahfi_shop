<template>
  <div class="table-container">
    <h3 class="table-title">รายการขายล่าสุด 10 ลำดับ</h3>
    <div class="table-wrapper">
      <table class="sales-table">
        <thead>
          <tr>
            <th>ลำดับ</th>
            <th>วันที่-เวลา</th>
            <th>ชื่อสินค้า</th>
            <th>จำนวนรายการ</th>
            <th>ส่วนลด</th>
            <th>ยอดรวมสุทธิ</th>
            <th>ยอดขาย (รวม)</th>
            <th>ผู้ขาย</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(sale, index) in sales" :key="sale.id" :class="{ 'highlight-row': index % 2 === 0 }">
            <td class="text-center">{{ index + 1 }}</td>
            <td>{{ formatDateTime(sale.sale_date) }}</td>
            <td class="product-names">
              <div class="product-list">{{ sale.product_names || '-' }}</div>
            </td>
            <td class="text-center">
              <span class="badge">{{ sale.items_count }}</span>
            </td>
            <td class="text-end">
              <span class="discount-amount">{{ formatNumber(sale.total_discount || 0) }}</span>
            </td>
            <td class="text-end">
              <span class="net-total">{{ formatNumber(sale.net_total || 0) }}</span>
            </td>
            <td class="text-end">
              <span class="amount">{{ formatNumber(sale.total_amount) }}</span>
            </td>
            <td>
              <span class="seller-name">{{ sale.seller_name || '-' }}</span>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="sales.length === 0" class="empty-state">
        <i class="fas fa-inbox"></i>
        <p>ไม่มีข้อมูลการขาย</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Sale {
  id: number
  sale_date: string
  total_amount: number
  items_count: number
  seller_name: string
  product_names?: string
  total_discount?: number
  net_total?: number
}

interface Props {
  sales: Sale[]
}

defineProps<Props>()

const formatDateTime = (dateStr: string) => {
  const date = new Date(dateStr)
  return date.toLocaleString('th-TH', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatNumber = (value: number) => {
  const num = Number(value) || 0
  return num.toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}
</script>

<style scoped>
.table-container {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
}

.table-title {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 20px 0;
  padding-bottom: 16px;
  border-bottom: 2px solid #f3f4f6;
}

.table-wrapper {
  overflow-x: auto;
}

.sales-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.sales-table thead {
  background: #f9fafb;
  border-bottom: 2px solid #e5e7eb;
}

.sales-table th {
  padding: 16px 12px;
  text-align: left;
  font-weight: 600;
  color: #374151;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.sales-table td {
  padding: 14px 12px;
  border-bottom: 1px solid #f3f4f6;
  color: #6b7280;
}

.sales-table tbody tr:hover {
  background: #f9fafb;
  transition: background-color 0.2s ease;
}

.highlight-row {
  background: #fafbfc;
}

.text-center {
  text-align: center;
}

.text-end {
  text-align: right;
}

.badge {
  display: inline-block;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-weight: 600;
  font-size: 12px;
}

.amount {
  font-weight: 700;
  color: #10b981;
  font-size: 15px;
}

.seller-name {
  color: #6366f1;
  font-weight: 500;
}

.product-names {
  max-width: 200px;
}

.product-list {
  font-size: 13px;
  color: #1f2937;
  word-wrap: break-word;
  white-space: normal;
  line-height: 1.4;
}

.discount-amount {
  color: #ef4444;
  font-weight: 600;
}

.net-total {
  color: #8b5cf6;
  font-weight: 700;
  font-size: 14px;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: #9ca3af;
}

.empty-state i {
  font-size: 48px;
  margin-bottom: 12px;
  color: #d1d5db;
}

.empty-state p {
  font-size: 14px;
  margin: 0;
}

@media (max-width: 768px) {
  .table-container {
    padding: 16px;
  }

  .table-title {
    font-size: 16px;
  }

  .sales-table {
    font-size: 12px;
  }

  .sales-table th,
  .sales-table td {
    padding: 10px 8px;
  }

  .amount {
    font-size: 13px;
  }
}
</style>
