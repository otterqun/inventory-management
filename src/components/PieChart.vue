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

  // Tona monokrom / slate bersahaja
  const neutralPalette = [
    '#18181b', // zinc-900
    '#52525b', // zinc-600
    '#a1a1aa', // zinc-400
    '#d4d4d8', // zinc-300
    '#71717a', // zinc-500
    '#3f3f46'  // zinc-700
  ]

  return {
    labels: props.categories,
    datasets: [
      {
        backgroundColor: props.categories.map((_, index) => neutralPalette[index % neutralPalette.length]),
        borderWidth: 2,
        borderColor: '#ffffff',
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
        boxWidth: 10,
        padding: 12,
        font: { size: 11, family: 'sans-serif' },
        color: '#52525b'
      }
    }
  }
}
</script>

<template>
  <div class="bg-white p-5 rounded-2xl border border-zinc-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col h-[460px]">
    <div class="flex justify-between items-center mb-3">
      <h2 class="text-sm font-semibold tracking-tight text-zinc-900">Pecahan Mengikut Kategori</h2>
    </div>

    <div class="flex-grow relative flex items-center justify-center min-h-0">
      <div v-if="items.length === 0" class="text-zinc-600 text-xs font-mono">
        Tiada data untuk dianalisis
      </div>
      <div v-else class="w-full h-full pb-2">
        <Pie :data="chartData" :options="chartOptions" />
      </div>
    </div>
  </div>
</template>