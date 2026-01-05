<template>
  <div class="dashboard-container">
    <!-- Date Filter Section -->
    <div class="filter-section">
      <div class="filter-header">
        <h3>ตัวกรองข้อมูล</h3>
      </div>

      <div class="filter-controls">
        <!-- Quick Date Range Tabs -->
        <div class="date-tabs">
          <button
            v-for="tab in dateTabs"
            :key="tab.value"
            @click="selectDateTab(tab.value)"
            class="tab-btn"
            :class="{ active: selectedDateTab === tab.value }"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- Custom Date Range -->
        <div class="custom-date-range" v-show="selectedDateTab === 'custom'">
          <div class="date-inputs">
            <div class="input-group">
              <label>วันที่เริ่มต้น:</label>
              <input
                v-model="startDate"
                type="date"
                class="date-input"
                @change="applyDateRange"
              />
            </div>
            <div class="input-group">
              <label>วันที่สิ้นสุด:</label>
              <input
                v-model="endDate"
                type="date"
                class="date-input"
                @change="applyDateRange"
              />
            </div>
            <button @click="applyDateRange" class="apply-btn">
              <i class="fas fa-check"></i> ใช้ช่วงวันที่
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading & Error States -->
    <div v-if="pending" class="loading-state">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">กำลังโหลด...</span>
      </div>
    </div>

    <div v-if="error" class="alert alert-danger alert-dismissible fade show" role="alert">
      <i class="fas fa-exclamation-circle"></i> เกิดข้อผิดพลาดในการดึงข้อมูล: {{ error.message }}
    </div>

    <!-- Summary Cards Section -->
    <div v-if="summary" class="summary-section">
      <!-- KPI Stats Cards -->
      <div class="stats-grid">
        <StatCard
          title="ยอดขาย"
          :value="summary.totalSales"
          unit="บาท"
          icon="money"
          variant="blue"
        />
        <StatCard
          title="ค่าใช้จ่าย"
          :value="summary.totalExpenses"
          unit="บาท"
          icon="dollar"
          variant="orange"
        />
        <StatCard
          title="จำนวนออเดอร์"
          :value="summary.totalOrders"
          unit="ใบ"
          icon="cart"
          variant="purple"
        />
        <StatCard
          title="สินค้าที่ขายออก"
          :value="summary.totalItemsSold"
          unit="ชิ้น"
          icon="box-open"
          variant="orange"
        />
        <StatCard
          title="ส่วนลดรวม"
          :value="summary.totalDiscount"
          unit="บาท"
          icon="tags"
          variant="pink"
          tooltip="ยอดส่วนลดท้ายบิลรวมทั้งหมด"
        />
        <StatCard
          title="สินค้าในระบบ"
          :value="summary.totalProducts"
          unit="ชิ้น"
          icon="package"
          variant="red"
        />
        <StatCard
          v-if="summary.capital"
          title="ROI (ผลตอบแทน)"
          :value="formatNumber(summary.capital.roi)"
          unit="%"
          icon="percent"
          variant="teal"
        />
      </div>
    </div>

    <!-- Charts Section -->
    <div v-if="chartData" class="charts-section">
      <!-- Financial Trend Chart (New) -->
      <div class="financial-chart-section" v-if="chartData.financialTrend">
        <FinancialChart :data="chartData.financialTrend" />
      </div>

      <div class="charts-grid">
        <!-- Top 5 Products Chart -->
        <TopProductsChart
          v-if="chartData.top5Products && chartData.top5Products.length > 0"
          :products="chartData.top5Products"
        />

        <!-- Stock Chart -->
        <StockChart
          v-if="chartData.productStock && chartData.productStock.length > 0"
          :products="chartData.productStock"
        />
      </div>

      <!-- Sales Table -->
      <SalesTable
        v-if="chartData.latest10Sales && chartData.latest10Sales.length > 0"
        :sales="chartData.latest10Sales"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios'
import { ref, onMounted, computed } from 'vue'
import { useAuth } from '~/composables/useAuth'

// Page Metadata & Middleware
definePageMeta({
  layout: 'default',
  middleware: defineNuxtRouteMiddleware(() => {
    const { isAdmin } = useAuth()
    if (!isAdmin.value) {
      return navigateTo('/pos')
    }
  })
})

// State
const summary = ref<any>(null)
const chartData = ref<any>(null)
const pending = ref(true)
const error = ref<any>(null)
const token = useCookie('token')
const auth = useAuth()
const { handleApiError } = useApiError()

// Date Range State
const selectedDateTab = ref('today')
const startDate = ref('')
const endDate = ref('')

// Date Tab Options
const dateTabs = [
  { label: 'วันนี้', value: 'today' },
  { label: 'เมื่อวาน', value: 'yesterday' },
  { label: 'สัปดาห์นี้', value: 'week' },
  { label: 'เดือนนี้', value: 'month' },
  { label: 'ปีนี้', value: 'year' },
  { label: 'ทั้งหมด', value: 'all' },
  { label: 'กำหนดเอง', value: 'custom' }
]

// Get date range based on selected tab
const getDateRange = (tab: string) => {
  const today = new Date()
  const start = new Date()
  const end = new Date(today)

  switch (tab) {
    case 'today':
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      break
    case 'yesterday':
      start.setDate(today.getDate() - 1)
      start.setHours(0, 0, 0, 0)
      end.setDate(today.getDate() - 1)
      end.setHours(23, 59, 59, 999)
      break
    case 'week':
      // Set to start of week (Sunday or Monday based on locale)
      const dayOfWeek = today.getDay()
      start.setDate(today.getDate() - dayOfWeek)
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      break
    case 'month':
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      break
    case 'year':
      start.setMonth(0)
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      break
    case 'all':
      return { startDate: '', endDate: '' }
    case 'custom':
      if (startDate.value && endDate.value) {
        return { startDate: startDate.value, endDate: endDate.value }
      }
      return { startDate: '', endDate: '' }
  }

  return {
    startDate: start.toISOString().split('T')[0],
    endDate: end.toISOString().split('T')[0]
  }
}

// Select Date Tab
const selectDateTab = async (tab: string) => {
  selectedDateTab.value = tab

  if (tab !== 'custom') {
    const range = getDateRange(tab)
    startDate.value = range.startDate || ''
    endDate.value = range.endDate || ''
    await fetchCharts(range.startDate, range.endDate)
  }
}

// Apply Custom Date Range
const applyDateRange = async () => {
  if (startDate.value && endDate.value) {
    await fetchCharts(startDate.value, endDate.value)
  }
}

// Fetch Dashboard Charts Data
const fetchCharts = async (start?: string | null, end?: string | null) => {
  pending.value = true
  error.value = null

  if (!token.value) {
    console.warn('⚠️ No Token - Please Login')
    pending.value = false
    return
  }

  try {
    const params: any = {}
    if (start) params.startDate = start
    if (end) params.endDate = end

    // Try to fetch from /api/dashboard/charts
    try {
      const response = await axios.get('/api/dashboard/charts', {
        headers: { 'Authorization': `Bearer ${token.value}` },
        params
      })
      chartData.value = response.data
      summary.value = response.data.summary
      console.log('✅ Dashboard charts data:', response.data)
    } catch (chartError: any) {
      // Fallback to summary endpoint if charts fails
      console.warn('⚠️ Charts endpoint failed, using summary endpoint:', chartError.message)
      const summaryResponse = await axios.get('/api/dashboard/summary', {
        headers: { 'Authorization': `Bearer ${token.value}` },
        params
      })
      summary.value = summaryResponse.data
      // Mock chart data for display
      chartData.value = {
        summary: summaryResponse.data,
        top5Products: [],
        latest10Sales: [],
        productStock: [],
        financialTrend: null
      }
      console.log('✅ Dashboard summary data (fallback):', summaryResponse.data)
    }
  } catch (err: any) {
    // ใช้ composable จัดการ Error
    const isAuthError = await handleApiError(err)
    if (isAuthError) return

    error.value = err
  } finally {
    pending.value = false
  }
}

// Format Number Helper
const formatNumber = (value: any) => {
  const num = Number(value) || 0
  return num.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

// Lifecycle
onMounted(() => {
  // Set initial date range to today
  const today = new Date().toISOString().split('T')[0] || ''
  startDate.value = today
  endDate.value = today
  fetchCharts(today, today)
})
</script>

<style scoped>
.dashboard-container {
  display: flex;
  flex-direction: column;
  gap: 30px;
  max-width: 1400px;
  margin: 0 auto;
  font-family: 'Sarabun', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}

/* Filter Section */
.filter-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
}

.filter-header {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f3f4f6;
}

.filter-header h3 {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}

.filter-controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Date Tabs */
.date-tabs {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.tab-btn {
  padding: 10px 20px;
  border: 2px solid #e5e7eb;
  background: white;
  color: #6b7280;
  border-radius: 12px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.tab-btn:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background: rgba(59, 130, 246, 0.05);
}

.tab-btn.active {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border-color: #3b82f6;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

/* Custom Date Range */
.custom-date-range {
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.date-inputs {
  display: flex;
  gap: 16px;
  align-items: flex-end;
  flex-wrap: wrap;
  padding: 16px;
  background: #f9fafb;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 200px;
}

.input-group label {
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.date-input {
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
  background: white;
  color: #1f2937;
}

.date-input:hover {
  border-color: #3b82f6;
}

.date-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.apply-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}

.apply-btn:hover {
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
  transform: translateY(-2px);
}

.apply-btn:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .filter-section {
    padding: 16px;
  }

  .date-tabs {
    gap: 8px;
  }

  .tab-btn {
    padding: 8px 16px;
    font-size: 12px;
  }

  .date-inputs {
    flex-direction: column;
    align-items: stretch;
  }

  .input-group {
    min-width: auto;
  }

  .apply-btn {
    width: 100%;
    justify-content: center;
  }
}

/* Loading State */
.loading-state {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.loading-state .spinner-border {
  width: 50px;
  height: 50px;
  border-width: 4px;
}

/* Summary Section */
.summary-section {
  width: 100%;
}

.summary-section {
  margin-bottom: 30px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

/* Charts Section */
.charts-section {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
  gap: 30px;
}

.financial-chart-section {
  height: 400px;
  width: 100%;
}

/* Stat Card Base */
.stat-card {
  border-radius: 16px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  cursor: pointer;
  color: white;
}

.stat-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
}

/* Stat Card Colors - Solid Background */
.stat-card-blue {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

.stat-card-purple {
  background: linear-gradient(135deg, #a855f7 0%, #7e22ce 100%);
}

.stat-card-orange {
  background: linear-gradient(135deg, #f97316 0%, #c2410c 100%);
}

.stat-card-red {
  background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
}

/* Stat Card Content */
.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.stat-title {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  flex: 1;
}

.stat-icon {
  font-size: 24px;
  opacity: 0.7;
}

.stat-value {
  font-size: 36px;
  font-weight: 700;
  color: white;
  line-height: 1;
}

.stat-currency {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

/* Low Stock Section */
.low-stock-section {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
}

.section-header {
  margin-bottom: 20px;
  border-bottom: 2px solid #f3f4f6;
  padding-bottom: 16px;
}

.section-title {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-title i {
  font-size: 20px;
  color: #f59e0b;
}

/* Low Stock List */
.low-stock-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.stock-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f9fafb;
  border-radius: 12px;
  transition: all 0.3s ease;
  border-left: 4px solid #f3f4f6;
}

.stock-item:hover {
  background: #f3f4f6;
  border-left-color: #ef4444;
}

.stock-icon {
  width: 44px;
  height: 44px;
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #6b7280;
  flex-shrink: 0;
}

.stock-info {
  flex: 1;
  min-width: 0;
}

.stock-name {
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.stock-category {
  font-size: 13px;
  color: #9ca3af;
  margin: 4px 0 0 0;
}

.stock-quantity {
  display: flex;
  align-items: center;
}

.quantity-badge {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  min-width: 50px;
  text-align: center;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
}

.empty-state i {
  font-size: 48px;
  color: #10b981;
  margin-bottom: 16px;
  display: block;
}

.empty-state p {
  font-size: 16px;
  color: #6b7280;
  margin: 0;
}

/* Alert Style */
.alert {
  border-radius: 12px;
  border: none;
  background: #fee2e2;
  color: #991b1b;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.alert i {
  font-size: 18px;
  flex-shrink: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .dashboard-container {
    gap: 20px;
  }

  .stats-grid {
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 12px;
  }

  .charts-grid {
    grid-template-columns: 1fr;
  }

  .stat-card {
    padding: 16px;
  }

  .stat-value {
    font-size: 20px;
  }

  .stat-title {
    font-size: 11px;
  }

  .low-stock-section {
    padding: 16px;
  }

  .stock-item {
    padding: 12px;
    gap: 12px;
  }

  .stock-icon {
    width: 40px;
    height: 40px;
    font-size: 18px;
  }

  .stock-name {
    font-size: 14px;
  }
}
</style>
