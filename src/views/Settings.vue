<script setup>
import { ref, computed } from 'vue'

const items = ref(JSON.parse(localStorage.getItem('inv_items') || '[]'))
const categories = ref(JSON.parse(localStorage.getItem('inv_cats') || '["Kering", "Basah", "Mandian", "Lain-lain"]'))
const logs = ref(JSON.parse(localStorage.getItem('inv_logs') || '[]'))

const toastMessage = ref('')

const showToast = (msg) => {
  toastMessage.value = msg
  setTimeout(() => { toastMessage.value = '' }, 2500)
}

const totalQty = computed(() => {
  return items.value.reduce((acc, item) => acc + (item.qty || 0), 0)
})

const getFormattedTimestamp = () => {
  const now = new Date()
  const d = String(now.getDate()).padStart(2, '0')
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const y = now.getFullYear()
  const hh = String(now.getHours()).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  return `${d}-${m}-${y}_${hh}-${mm}`
}

const exportFullBackup = () => {
  const fullData = {
    backupDate: new Date().toISOString(),
    inventory: items.value,
    categories: categories.value,
    logs: logs.value
  }
  const blob = new Blob([JSON.stringify(fullData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `backup_${getFormattedTimestamp()}.json`
  a.click()
  URL.revokeObjectURL(url)
  showToast('Sandaran JSON dimuat turun')
}

const exportLogsCSV = () => {
  if (logs.value.length === 0) {
    showToast('Tiada rekod aktiviti')
    return
  }
  const headers = ['Jenis,Nama,Masa']
  const rows = logs.value.map(l => `"${l.type}","${l.name}","${l.timestamp || l.time}"`)
  const blob = new Blob(['\uFEFF' + [headers, ...rows].join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `logs_${getFormattedTimestamp()}.csv`
  a.click()
  URL.revokeObjectURL(url)
  showToast('Log CSV dimuat turun')
}

const loadSampleData = () => {
  if (confirm('Gantikan data semasa dengan data contoh?')) {
    const sampleItems = [
      { id: 101, barcode: '9556001234567', name: 'Maggi Kari 5x79g', category: 'Kering', qty: 4 },
      { id: 102, barcode: '9556007654321', name: 'Spritzer Mineral 1.5L', category: 'Basah', qty: 6 },
      { id: 103, barcode: '9555123400012', name: 'Beras Basmathi 5kg', category: 'Kering', qty: 2 },
      { id: 104, barcode: '9558999887711', name: 'Dettol Shower Gel 950ml', category: 'Mandian', qty: 1 }
    ]
    const sampleCats = ['Kering', 'Basah', 'Mandian', 'Lain-lain']
    const sampleLogs = [
      { id: 1, type: 'DAFTAR', name: 'Maggi Kari 5x79g', timestamp: '[ 10:15 | 02/09/2026 ]' },
      { id: 2, type: 'TAMBAH', name: 'Spritzer Mineral 1.5L (+1)', timestamp: '[ 11:30 | 02/09/2026 ]' }
    ]

    items.value = sampleItems
    categories.value = sampleCats
    logs.value = sampleLogs

    localStorage.setItem('inv_items', JSON.stringify(sampleItems))
    localStorage.setItem('inv_cats', JSON.stringify(sampleCats))
    localStorage.setItem('inv_logs', JSON.stringify(sampleLogs))

    showToast('Data contoh dimuatkan')
  }
}

const resetAllData = () => {
  if (confirm('Padam semua data dan pulihkan tetapan asal?')) {
    localStorage.removeItem('inv_items')
    localStorage.removeItem('inv_cats')
    localStorage.removeItem('inv_logs')

    items.value = []
    categories.value = ['Kering', 'Basah', 'Mandian', 'Lain-lain']
    logs.value = []

    localStorage.setItem('inv_cats', JSON.stringify(categories.value))
    showToast('Semua data dikosongkan')
  }
}
</script>

<template>
  <main class="min-h-screen bg-[#fafafa] text-zinc-800 py-12 px-6 font-sans antialiased">
    <!-- Toast -->
    <div v-if="toastMessage" class="fixed top-4 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-xs font-mono px-4 py-2 rounded-lg shadow-lg z-[100]">
      {{ toastMessage }}
    </div>

    <div class="max-w-2xl mx-auto space-y-10">
      
      <!-- Header -->
      <header class="border-b border-zinc-200 pb-6 space-y-2">
        <p class="text-xs font-mono uppercase tracking-widest text-zinc-600">Sistem</p>
        <h1 class="text-2xl font-semibold tracking-tight text-zinc-900">Tetapan & Pengurusan Data</h1>
        <p class="text-xs text-zinc-600">Konfigurasi storan lokal peranti dan sandaran fail.</p>
      </header>

      <!-- Metrik Ringkas -->
      <section class="grid grid-cols-4 gap-3 border border-zinc-200 rounded-xl bg-white p-4 text-center font-mono">
        <div>
          <p class="text-[10px] text-zinc-600 uppercase">Barang</p>
          <p class="text-base font-semibold text-zinc-900 mt-0.5">{{ items.length }}</p>
        </div>
        <div>
          <p class="text-[10px] text-zinc-600 uppercase">Unit</p>
          <p class="text-base font-semibold text-zinc-900 mt-0.5">{{ totalQty }}</p>
        </div>
        <div>
          <p class="text-[10px] text-zinc-600 uppercase">Kategori</p>
          <p class="text-base font-semibold text-zinc-900 mt-0.5">{{ categories.length }}</p>
        </div>
        <div>
          <p class="text-[10px] text-zinc-600 uppercase">Log</p>
          <p class="text-base font-semibold text-zinc-900 mt-0.5">{{ logs.length }}</p>
        </div>
      </section>

      <!-- Seksyen Sandaran -->
      <section class="space-y-4">
        <h2 class="text-xs font-mono uppercase tracking-wider text-zinc-600">Sandaran & Eksport</h2>
        <div class="border border-zinc-200 rounded-xl bg-white divide-y divide-zinc-100 text-xs">
          <div class="p-4 flex items-center justify-between">
            <div>
              <p class="font-medium text-zinc-900">Fail Sandaran Penuh (.JSON)</p>
              <p class="text-zinc-600 mt-0.5">Gabungan senarai stok, kategori, dan log transaksi.</p>
            </div>
            <button @click="exportFullBackup" class="px-3 py-1.5 border border-zinc-300 hover:border-zinc-400 rounded-md font-medium transition-colors cursor-pointer">
              Eksport JSON
            </button>
          </div>
          <div class="p-4 flex items-center justify-between">
            <div>
              <p class="font-medium text-zinc-900">Arkib Log Aktiviti (.CSV)</p>
              <p class="text-zinc-600 mt-0.5">Jadual audit bagi setiap aktiviti keluar masuk.</p>
            </div>
            <button @click="exportLogsCSV" class="px-3 py-1.5 border border-zinc-300 hover:border-zinc-400 rounded-md font-medium transition-colors cursor-pointer">
              Eksport CSV
            </button>
          </div>
        </div>
      </section>

      <!-- Seksyen Penyelenggaraan -->
      <section class="space-y-4">
        <h2 class="text-xs font-mono uppercase tracking-wider text-zinc-600">Penyelenggaraan Storan</h2>
        <div class="border border-zinc-200 rounded-xl bg-white divide-y divide-zinc-100 text-xs">
          <div class="p-4 flex items-center justify-between">
            <div>
              <p class="font-medium text-zinc-900">Muat Data Contoh</p>
              <p class="text-zinc-600 mt-0.5">Isi storan dengan set barangan simulasi.</p>
            </div>
            <button @click="loadSampleData" class="px-3 py-1.5 border border-zinc-300 hover:bg-zinc-50 rounded-md font-medium transition-colors cursor-pointer">
              Muat Data
            </button>
          </div>
          <div class="p-4 flex items-center justify-between">
            <div>
              <p class="font-medium text-zinc-900">Kosongkan Semua Rekod</p>
              <p class="text-zinc-600 mt-0.5">Padam data localStorage dan kembalikan ke tetapan asal.</p>
            </div>
            <button @click="resetAllData" class="px-3 py-1.5 border border-zinc-300 hover:bg-zinc-100 text-zinc-700 rounded-md font-medium transition-colors cursor-pointer">
              Padam Data
            </button>
          </div>
        </div>
      </section>

    </div>
  </main>
</template>