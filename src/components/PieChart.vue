<script setup>
import { computed } from 'vue'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Pie } from 'vue-chartjs'

ChartJS.register(ArcElement, Tooltip, Legend)

// Terima data 'inventory' dan senarai 'categories' dari Home.vue
const props = defineProps({
  items: { type: Array, required: true },
  categories: { type: Array, required: true }
})

const chartData = computed(() => {
  // 1. Kira jumlah kuantiti barang untuk setiap kategori yang wujud
  const dataKiraan = props.categories.map(cat => {
    return props.items
      .filter(item => item.category === cat)
      .reduce((total, item) => total + item.qty, 0) // Kira total 'qty', bukan total jenis barang
  })

  // 2. Senarai warna dinamik untuk kategori (akan ulang kalau kategori banyak)
  const warna = ['#f59e0b', '#3b82f6', '#10b981', '#a855f7', '#ec4899', '#6366f1', '#f43f5e', '#f59e0b']

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
    legend: { position: 'bottom' }
  }
}
</script>

<template>
  <div class="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-purple-500 flex flex-col h-[350px]">
    <h3 class="text-lg font-bold text-slate-700 mb-4">Statistik Kuantiti Stok</h3>
    <div class="flex-grow relative">
      <div v-if="items.length === 0" class="absolute inset-0 flex items-center justify-center text-slate-400">
        Tiada stok untuk dianalisis
      </div>
      <Pie v-else :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>