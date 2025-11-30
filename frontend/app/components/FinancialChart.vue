<template>
  <div class="chart-container">
    <h3 class="chart-title">ภาพรวมการเงิน (Financial Overview)</h3>
    <div class="chart-wrapper">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

interface FinancialData {
  labels: string[]
  salesData: number[]
  expensesData: number[]
  costData: number[]
}

interface Props {
  data: FinancialData
}

const props = defineProps<Props>()
const chartCanvas = ref<HTMLCanvasElement | null>(null)
let chartInstance: any = null

const initChart = () => {
  if (!chartCanvas.value || !window.Chart) return

  // Destroy previous chart
  if (chartInstance) {
    chartInstance.destroy()
  }

  const ctx = chartCanvas.value.getContext('2d')
  if (!ctx) return

  chartInstance = new window.Chart(ctx, {
    type: 'line',
    data: {
      labels: props.data.labels,
      datasets: [
        {
          label: 'ยอดขาย (Sales)',
          data: props.data.salesData,
          borderColor: '#10b981', // Green
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 3,
          tension: 0.3,
          fill: true,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#10b981',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        },
        {
          label: 'ต้นทุน (Cost)',
          data: props.data.costData,
          borderColor: '#3b82f6', // Blue
          backgroundColor: 'transparent',
          borderWidth: 2,
          tension: 0.3,
          borderDash: [5, 5], // Dashed line
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#3b82f6',
          pointBorderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5
        },
        {
          label: 'รายจ่าย (Expenses)',
          data: props.data.expensesData,
          borderColor: '#ef4444', // Red
          backgroundColor: 'transparent',
          borderWidth: 2,
          tension: 0.3,
          pointBackgroundColor: '#ffffff',
          pointBorderColor: '#ef4444',
          pointBorderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      plugins: {
        legend: {
          position: 'top',
          align: 'end',
          labels: {
            font: { family: "'Sarabun', sans-serif", size: 12 },
            usePointStyle: true,
            boxWidth: 8
          }
        },
        tooltip: {
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          titleColor: '#1f2937',
          bodyColor: '#4b5563',
          borderColor: '#e5e7eb',
          borderWidth: 1,
          titleFont: { family: "'Sarabun', sans-serif", size: 14, weight: 'bold' },
          bodyFont: { family: "'Sarabun', sans-serif", size: 13 },
          padding: 12,
          cornerRadius: 8,
          displayColors: true,
          callbacks: {
            label: function(context: any) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(context.parsed.y);
              }
              return label;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            font: { family: "'Sarabun', sans-serif", size: 12 }
          },
          grid: {
            drawBorder: false,
            color: 'transparent'
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            font: { family: "'Sarabun', sans-serif", size: 12 },
            callback: function(value: any) {
              return '฿' + new Intl.NumberFormat('th-TH', { notation: "compact", compactDisplay: "short" }).format(value);
            }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)',
            drawBorder: false
          }
        }
      }
    }
  })
}

onMounted(() => {
  // Wait for Chart.js to load
  const checkChart = setInterval(() => {
    if (window.Chart) {
      clearInterval(checkChart)
      initChart()
    }
  }, 100)
})

watch(() => props.data, () => {
  initChart()
}, { deep: true })
</script>

<style scoped>
.chart-container {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
  height: 100%;
}

.chart-title {
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 20px 0;
  padding-bottom: 16px;
  border-bottom: 2px solid #f3f4f6;
}

.chart-wrapper {
  position: relative;
  height: 350px;
  width: 100%;
}

@media (max-width: 768px) {
  .chart-container {
    padding: 16px;
  }

  .chart-title {
    font-size: 16px;
  }

  .chart-wrapper {
    height: 300px;
  }
}
</style>
