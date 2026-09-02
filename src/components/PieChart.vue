<script setup>
import { computed } from 'vue'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Pie } from 'vue-chartjs'

ChartJS.register(ArcElement, Tooltip, Legend)

const props = defineProps({
  items: { type: Array, required: true },
  categories: { type: Array, required: true }
})

const chartData = computed(() => {
  const dataKiraan = props.categories.map(cat => {
    return props.items
      .filter(item => item.category === cat)
      .reduce((total, item) => total + item.qty, 0)
  })

  const warna = ['#f59e0b', '#3b82f6', '#10b981', '#a855f7', '#ec4899', '#6366f1', '#f43f5e']

  return {
    labels: props.categories,
    datasets: [
      {
        backgroundColor: props.categories.map((_, index) => warna[index % warna.length]),
        data: dataKiraan
      }
    ]
  }
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        boxWidth: 12,
        padding: 15,
        font: { size: 12, weight: 'bold' }
      }
    }
  }
}
</script>

<template>
  <div class="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-purple-500 flex flex-col h-[460px]">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold text-slate-800">Statistik Kuantiti Stok</h2>
    </div>

    <div class="flex-grow relative flex items-center justify-center min-h-0">
      <div v-if="items.length === 0" class="text-slate-400 font-medium">
        Tiada stok untuk dianalisis.
      </div>
      <div v-else class="w-full h-full pb-2">
        <Pie :data="chartData" :options="chartOptions" />
      </div>
    </div>
  </div>
</template>