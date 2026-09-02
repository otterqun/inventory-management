<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  items: Array,
  categories: Array,
  activeTab: String
})

defineEmits([
  'change-tab', 
  'open-cat-modal', 
  'delete-cat', 
  'open-edit-modal', 
  'add-qty', 
  'reduce-qty'
])

const searchQuery = ref('')

// Tona neutral halus untuk badge kategori
const getCategoryColor = (cat) => {
  return 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-200/60'
}

const filteredItems = computed(() => {
  return props.items.filter(item => {
    return item.name.toLowerCase().includes(searchQuery.value.toLowerCase().trim()) ||
           item.barcode.includes(searchQuery.value.trim())
  })
})

const getFormattedDateTime = () => {
  const now = new Date()
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year = now.getFullYear()
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')

  return {
    fileSlug: `${day}-${month}-${year}_${hours}-${minutes}`,
    readable: `${day}/${month}/${year} ${hours}:${minutes}`
  }
}

const downloadFile = (content, fileName, contentType) => {
  const blob = new Blob([content], { type: contentType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)
}

const exportJSON = () => {
  if (props.items.length === 0) return
  const { fileSlug, readable } = getFormattedDateTime()
  const payload = { exportedAt: readable, totalItems: props.items.length, data: props.items }
  downloadFile(JSON.stringify(payload, null, 2), `inventory_${fileSlug}.json`, 'application/json')
}

const exportCSV = () => {
  if (props.items.length === 0) return
  const { fileSlug, readable } = getFormattedDateTime()
  const headers = ['ID,Barcode,Nama,Kategori,Kuantiti,Masa Eksport']
  const rows = props.items.map(item => 
    `"${item.id}","${item.barcode}","${item.name}","${item.category}",${item.qty},"${readable}"`
  )
  downloadFile('\uFEFF' + [headers, ...rows].join('\n'), `inventory_${fileSlug}.csv`, 'text/csv;charset=utf-8;')
}
</script>

<template>
  <div class="bg-white p-5 rounded-2xl border border-zinc-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col h-[460px]">
    <!-- Header -->
    <div class="flex justify-between items-center mb-3">
      <div class="flex items-center gap-2">
        <h2 class="text-sm font-semibold tracking-tight text-zinc-900">Senarai Stok</h2>
        <span class="text-xs text-zinc-600 font-mono">({{ filteredItems.length }})</span>
      </div>
      
      <div class="flex items-center gap-1.5 text-xs font-mono">
        <button 
          @click="exportCSV" 
          class="px-2 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-md transition-colors cursor-pointer"
        >
          CSV
        </button>
        <button 
          @click="exportJSON" 
          class="px-2 py-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-md transition-colors cursor-pointer"
        >
          JSON
        </button>
      </div>
    </div>

    <!-- Search Input -->
    <div class="relative mb-3 shrink-0">
      <input 
        v-model="searchQuery"
        type="text" 
        placeholder="Cari item atau kod bar..." 
        class="w-full px-3 py-1.5 text-xs bg-zinc-50 border border-zinc-200 rounded-lg focus:bg-white focus:outline-none focus:border-zinc-400 text-zinc-800 placeholder-zinc-400 font-sans transition-colors"
      />
      <button 
        v-if="searchQuery" 
        @click="searchQuery = ''" 
        class="absolute inset-y-0 right-0 pr-2.5 flex items-center text-zinc-400 hover:text-zinc-600 text-xs cursor-pointer"
      >
        ✕
      </button>
    </div>
    
    <!-- Filter Tabs -->
    <div class="flex items-center overflow-x-auto pb-2 mb-2 hide-scrollbar gap-1.5 shrink-0">
      <button 
        @click="$emit('change-tab', 'Semua')"
        :class="activeTab === 'Semua' ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'"
        class="whitespace-nowrap px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer"
      >
        Semua
      </button>
      
      <div 
        v-for="cat in categories" :key="cat"
        class="flex items-center rounded-md transition-colors shrink-0"
        :class="activeTab === cat ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'"
      >
        <button @click="$emit('change-tab', cat)" class="whitespace-nowrap pl-2.5 pr-1 py-1 text-xs font-medium cursor-pointer">
          {{ cat }}
        </button>
        <button 
          @click.stop="$emit('delete-cat', cat)" 
          class="pr-2 pl-0.5 text-xs opacity-50 hover:opacity-100 cursor-pointer" 
        >
          ×
        </button>
      </div>

      <button 
        @click="$emit('open-cat-modal')"
        class="whitespace-nowrap px-2 py-1 rounded-md text-xs text-zinc-600 hover:text-zinc-900 border border-dashed border-zinc-300 hover:border-zinc-400 transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
      >
        + Kategori
      </button>
    </div>

    <!-- Items List -->
    <div v-if="filteredItems.length === 0" class="flex-grow flex items-center justify-center text-zinc-600 text-xs font-mono">
      {{ searchQuery ? 'Tiada padanan carian' : 'Tiada item' }}
    </div>

    <div v-else class="space-y-1.5 overflow-y-auto pr-1 flex-grow">
      <div 
        v-for="item in filteredItems" 
        :key="item.id" 
        class="flex justify-between items-center p-2.5 rounded-xl border border-zinc-100 hover:border-zinc-200 bg-white transition-colors"
      >
        <div class="flex flex-col items-start gap-1">
          <span class="font-medium text-zinc-900 text-xs">{{ item.name }}</span>
          <button 
            @click="$emit('open-edit-modal', item)" 
            :class="getCategoryColor(item.category)" 
            class="text-[10px] tracking-wide px-1.5 py-0.5 rounded transition-opacity cursor-pointer"
          >
            {{ item.category }}
          </button>
        </div>
        
        <div class="flex items-center gap-1.5 font-mono">
          <button @click="$emit('reduce-qty', item)" class="w-6 h-6 border border-zinc-200 rounded-md hover:bg-zinc-100 text-zinc-600 flex items-center justify-center text-xs transition-colors cursor-pointer">-</button>
          <span class="w-6 text-center text-xs font-medium text-zinc-900">{{ item.qty }}</span>
          <button @click="$emit('add-qty', item)" class="w-6 h-6 border border-zinc-200 rounded-md hover:bg-zinc-100 text-zinc-600 flex items-center justify-center text-xs transition-colors cursor-pointer">+</button>
        </div>
      </div>
    </div>
  </div>
</template>