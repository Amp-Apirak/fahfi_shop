<template>
  <div class="stat-card" :class="`stat-card-${variant}`">
    <div class="stat-header">
      <div class="d-flex align-items-center gap-2">
        <h3 class="stat-title">{{ title }}</h3>
        <i v-if="tooltip" class="fas fa-info-circle" :title="tooltip" style="opacity: 0.7; cursor: help; font-size: 0.85em;"></i>
      </div>
      <i :class="`fas fa-${getFontAwesomeIcon()}`" class="stat-icon"></i>
    </div>
    <div class="stat-value">{{ formattedValue }}</div>
    <div class="stat-unit">{{ unit }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  value: number | string
  unit?: string
  icon?: string
  variant?: 'blue' | 'purple' | 'orange' | 'red' | 'green' | 'teal'
  tooltip?: string
}

const props = withDefaults(defineProps<Props>(), {
  unit: '',
  icon: 'chart-pie',
  variant: 'blue',
  tooltip: ''
})

const getFontAwesomeIcon = () => {
  const iconMap: Record<string, string> = {
    'chart-line': 'chart-line',
    'wallet': 'wallet',
    'pie-chart': 'chart-pie',
    'money': 'coins',
    'box': 'box',
    'cart': 'shopping-cart',
    'package': 'box-open',
    'trending-up': 'arrow-trend-up',
    'dollar': 'sack-dollar',
    'users': 'users'
  }
  return iconMap[props.icon || 'chart-pie'] || 'chart-pie'
}

const formattedValue = computed(() => {
  const num = Number(props.value) || 0
  return num.toLocaleString('th-TH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  })
})
</script>

<style scoped>
.stat-card {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  transition: all 0.3s ease;
  flex: 1;
  min-width: 200px;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.stat-title {
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
  letter-spacing: 0.5px;
}

.stat-icon {
  font-size: 24px;
  color: rgba(255, 255, 255, 0.7);
  display: inline-block;
  flex-shrink: 0;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8px;
  letter-spacing: -1px;
}

.stat-unit {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  letter-spacing: 0.5px;
}

/* Variants */
.stat-card-blue {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
}

.stat-card-purple {
  background: linear-gradient(135deg, #a855f7 0%, #7c3aed 100%);
}

.stat-card-orange {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
}

.stat-card-red {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}

.stat-card-green {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.stat-card-teal {
  background: linear-gradient(135deg, #14b8a6 0%, #0f766e 100%);
}

/* Hover effects for variants */
.stat-card-blue:hover {
  box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
}

.stat-card-purple:hover {
  box-shadow: 0 8px 20px rgba(168, 85, 247, 0.4);
}

.stat-card-orange:hover {
  box-shadow: 0 8px 20px rgba(249, 115, 22, 0.4);
}

.stat-card-red:hover {
  box-shadow: 0 8px 20px rgba(239, 68, 68, 0.4);
}

.stat-card-green:hover {
  box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4);
}

.stat-card-teal:hover {
  box-shadow: 0 8px 20px rgba(20, 184, 166, 0.4);
}

/* Responsive */
@media (max-width: 768px) {
  .stat-card {
    padding: 16px;
  }

  .stat-value {
    font-size: 24px;
  }

  .stat-title {
    font-size: 12px;
  }

  .stat-icon {
    font-size: 20px;
  }
}
</style>
