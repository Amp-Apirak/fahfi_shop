<template>
  <div class="chart-container">
    <h3 class="chart-title">Top 5 สินค้าขายดี</h3>
    <div class="chart-wrapper">
      <canvas ref="chartCanvas"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'

interface Product {
  name: string
  totalQuantity: number
  totalRevenue: number
}

interface Props {
  products: Product[]
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

  const labels = props.products.map(p => p.name)
  const data = props.products.map(p => p.totalQuantity)
  const colors = [
    'rgba(59, 130, 246, 0.8)',    // Blue
    'rgba(168, 85, 247, 0.8)',    // Purple
    'rgba(249, 115, 22, 0.8)',    // Orange
    'rgba(239, 68, 68, 0.8)',     // Red
    'rgba(16, 185, 129, 0.8)'     // Green
  ]

  chartInstance = new window.Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'จำนวนชิ้นที่ขาย',
          data: data,
          backgroundColor: colors,
          borderColor: colors.map(c => c.replace('0.8', '1')),
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false
        }
      ]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleFont: { family: "'Sarabun', sans-serif", size: 14 },
          bodyFont: { family: "'Sarabun', sans-serif", size: 13 },
          padding: 12,
          cornerRadius: 8,
          displayColors: false,
          callbacks: {
            label: function(context: any) {
              return `${context.parsed.x} ชิ้น`
            }
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            font: { family: "'Sarabun', sans-serif", size: 12 }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
        y: {
          ticks: {
            font: { family: "'Sarabun', sans-serif", size: 13, weight: '600' }
          },
          grid: {
            drawBorder: false,
            color: 'transparent'
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

watch(() => props.products, () => {
  initChart()
}, { deep: true })
</script>

<style scoped>
.chart-container {
  background: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
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
  height: 300px;
}

canvas {
  max-height: 300px;
}

@media (max-width: 768px) {
  .chart-container {
    padding: 16px;
  }

  .chart-title {
    font-size: 16px;
  }

  .chart-wrapper {
    height: 250px;
  }
}
</style>
