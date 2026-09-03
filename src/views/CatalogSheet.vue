<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import JsBarcode from 'jsbarcode'

const rawItems = ref([])
const categories = ref([])

// Menyimpan kuantiti cetakan setiap item: { [itemId]: number }
const printQuantities = ref({})

const loadData = () => {
  rawItems.value = JSON.parse(localStorage.getItem('inv_items') || '[]')
  categories.value = JSON.parse(localStorage.getItem('inv_cats') || '["Kering", "Basah", "Mandian", "Lain-lain"]')
  
  // Tetapkan nilai lalai: 1 salinan bagi setiap item
  const initialQty = {}
  rawItems.value.forEach(item => {
    initialQty[item.id] = 1
  })
  printQuantities.value = initialQty
}

// Konfigurasi Lembaran
const selectedCategory = ref('Semua')
const gridColumns = ref(3)
const showCategoryName = ref(true)
const showBorderBox = ref(true)

// Tapis item untuk senarai pemilih di panel tetapan
const availableItems = computed(() => {
  if (selectedCategory.value === 'Semua') return rawItems.value
  return rawItems.value.filter(i => i.category === selectedCategory.value)
})

// Gandakan item mengikut kuantiti yang ditetapkan oleh pengguna
const itemsToPrint = computed(() => {
  const result = []
  availableItems.value.forEach(item => {
    const count = printQuantities.value[item.id] || 0
    for (let i = 0; i < count; i++) {
      result.push({
        ...item,
        uniquePrintKey: `${item.id}-${i}`
      })
    }
  })
  return result
})

// Fungsi ubah kuantiti salinan
const updateQty = (id, delta) => {
  const current = printQuantities.value[id] || 0
  const next = Math.max(0, current + delta)
  printQuantities.value[id] = next
}

const setAllQty = (qty) => {
  availableItems.value.forEach(item => {
    printQuantities.value[item.id] = qty
  })
}

// Render semua kod bar SVG pada lembaran
const renderAllBarcodes = async () => {
  await nextTick()
  itemsToPrint.value.forEach(entry => {
    const el = document.getElementById(`catalog-barcode-${entry.uniquePrintKey}`)
    if (!el) return

    try {
      JsBarcode(el, String(entry.barcode), {
        format: entry.barcode.startsWith('DIF-') ? 'CODE128' : 'auto',
        lineColor: '#000000',
        width: 1.5,
        height: 38,
        displayValue: true,
        font: 'monospace',
        fontSize: 11,
        textMargin: 2,
        margin: 0
      })
    } catch {
      try {
        JsBarcode(el, String(entry.barcode), {
          format: 'CODE128',
          lineColor: '#000000',
          width: 1.3,
          height: 35,
          displayValue: true
        })
      } catch (err) {
        console.error(`Gagal render barcode: ${entry.name}`, err)
      }
    }
  })
}

onMounted(() => {
  loadData()
  renderAllBarcodes()
})

watch([itemsToPrint, gridColumns], () => {
  renderAllBarcodes()
})

const handlePrint = () => {
  document.body.classList.add('printing-catalog')
  window.print()
  setTimeout(() => {
    document.body.classList.remove('printing-catalog')
  }, 500)
}
</script>

<template>
  <div class="catalog-page min-h-screen bg-[#fafafa] py-8 px-4 sm:px-6 font-sans antialiased text-zinc-900">
    <div class="max-w-5xl mx-auto space-y-6">

      <!-- Panel Konfigurasi Atas (Sembunyi Bila Print) -->
      <section class="screen-only bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-4">
          <div>
            <h1 class="text-base font-semibold tracking-tight text-zinc-900">Katalog Barcode (A4)</h1>
            <p class="text-xs text-zinc-500">Pilih item dan tetapkan bilangan pelekat yang ingin dicetak.</p>
          </div>
          <button 
            @click="handlePrint"
            :disabled="itemsToPrint.length === 0"
            :class="itemsToPrint.length === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-zinc-800 cursor-pointer'"
            class="px-4 py-2 bg-zinc-900 text-white rounded-xl text-xs font-medium transition-colors self-start sm:self-auto"
          >
            Cetak Lembaran A4 ({{ itemsToPrint.length }})
          </button>
        </div>

        <!-- Tetapan Reka Letak -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div>
            <label class="block text-zinc-500 mb-1">Tapis Kategori</label>
            <select 
              v-model="selectedCategory" 
              class="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-1.5 text-zinc-800 focus:outline-none focus:border-zinc-400 cursor-pointer"
            >
              <option value="Semua">Semua Kategori</option>
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>

          <div>
            <label class="block text-zinc-500 mb-1">Susunan Lajur</label>
            <select 
              v-model.number="gridColumns" 
              class="w-full bg-zinc-50 border border-zinc-200 rounded-lg p-1.5 text-zinc-800 focus:outline-none focus:border-zinc-400 cursor-pointer"
            >
              <option :value="2">2 Lajur (Besar)</option>
              <option :value="3">3 Lajur (Standard)</option>
              <option :value="4">4 Lajur (Kompak)</option>
            </select>
          </div>

          <div class="flex items-center gap-2 pt-4">
            <input 
              id="chk-cat" 
              type="checkbox" 
              v-model="showCategoryName" 
              class="rounded border-zinc-300 text-zinc-900 focus:ring-0 cursor-pointer"
            />
            <label for="chk-cat" class="text-zinc-700 cursor-pointer">Papar Kategori</label>
          </div>

          <div class="flex items-center gap-2 pt-4">
            <input 
              id="chk-border" 
              type="checkbox" 
              v-model="showBorderBox" 
              class="rounded border-zinc-300 text-zinc-900 focus:ring-0 cursor-pointer"
            />
            <label for="chk-border" class="text-zinc-700 cursor-pointer">Kotak Border</label>
          </div>
        </div>

        <!-- Pemilih Item & Kuantiti Salinan -->
        <div class="border-t border-zinc-100 pt-4">
          <div class="flex justify-between items-center mb-3">
            <span class="text-xs font-semibold text-zinc-800">Kuantiti Salinan Setiap Item</span>
            <div class="flex gap-2 text-[11px] font-mono">
              <button @click="setAllQty(1)" class="text-zinc-600 hover:text-zinc-900 cursor-pointer underline">Semua 1</button>
              <span class="text-zinc-300">|</span>
              <button @click="setAllQty(0)" class="text-zinc-600 hover:text-zinc-900 cursor-pointer underline">Kosongkan</button>
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
            <div 
              v-for="item in availableItems" 
              :key="item.id"
              class="flex items-center justify-between p-2 rounded-lg border border-zinc-200 bg-zinc-50"
            >
              <div class="truncate mr-2">
                <p class="text-xs font-medium text-zinc-900 truncate">{{ item.name }}</p>
                <p class="text-[10px] text-zinc-500 font-mono">{{ item.barcode }}</p>
              </div>

              <!-- Butang Tambah / Tolak Bilangan Label -->
              <div class="flex items-center gap-1 shrink-0 font-mono text-xs">
                <button 
                  @click="updateQty(item.id, -1)" 
                  class="w-6 h-6 rounded bg-white border border-zinc-200 hover:bg-zinc-100 flex items-center justify-center text-zinc-600 cursor-pointer"
                >
                  -
                </button>
                <span class="w-6 text-center font-bold text-zinc-800">
                  {{ printQuantities[item.id] || 0 }}
                </span>
                <button 
                  @click="updateQty(item.id, 1)" 
                  class="w-6 h-6 rounded bg-white border border-zinc-200 hover:bg-zinc-100 flex items-center justify-center text-zinc-600 cursor-pointer"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Zon Helaian Cetakan A4 -->
      <div 
        id="print-zone"
        class="bg-white border border-zinc-300 rounded-2xl p-8 shadow-sm"
      >
        <header class="border-b border-zinc-200 pb-3 mb-6 flex justify-between items-end">
          <div>
            <h2 class="text-base font-bold tracking-tight text-zinc-900 font-mono">MASTER PANTRY SHEET</h2>
            <p class="text-[11px] text-zinc-500 font-mono">Jumlah Pelekat: {{ itemsToPrint.length }} keping</p>
          </div>
          <span class="text-[10px] text-zinc-400 font-mono">Inventory Keeper</span>
        </header>

        <div v-if="itemsToPrint.length === 0" class="text-center py-12 text-xs font-mono text-zinc-400">
          Tiada barcode dipilih untuk dicetak. Sila naikkan kuantiti salinan di atas.
        </div>

        <!-- Grid Cetakan -->
        <div 
          v-else 
          class="grid gap-3"
          :class="{
            'grid-cols-2': gridColumns === 2,
            'grid-cols-3': gridColumns === 3,
            'grid-cols-4': gridColumns === 4
          }"
        >
          <div 
            v-for="entry in itemsToPrint" 
            :key="entry.uniquePrintKey"
            :class="showBorderBox ? 'border border-zinc-300 rounded-xl p-3' : 'p-2'"
            class="flex flex-col items-center justify-center text-center bg-white sheet-card"
          >
            <p class="text-xs font-semibold text-zinc-900 truncate w-full mb-0.5">{{ entry.name }}</p>
            <p v-if="showCategoryName" class="text-[9px] text-zinc-500 font-mono uppercase tracking-wider mb-1">
              {{ entry.category }}
            </p>
            <svg :id="'catalog-barcode-' + entry.uniquePrintKey" class="w-full flex justify-center"></svg>
          </div>
        </div>

        <footer class="mt-8 pt-3 border-t border-zinc-200 text-center text-[10px] font-mono text-zinc-400">
          Lekatkan helaian ini di pintu stor / kabinet untuk pengimbasan pantas.
        </footer>
      </div>

    </div>
  </div>
</template>

<style>
@media print {
  @page {
    size: A4 portrait;
    margin: 8mm;
  }

  body.printing-catalog {
    background: #ffffff !important;
  }

  body.printing-catalog header,
  body.printing-catalog nav,
  body.printing-catalog footer:not(#print-zone footer),
  body.printing-catalog .screen-only {
    display: none !important;
  }

  body.printing-catalog #print-zone {
    display: block !important;
    width: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    border: none !important;
    box-shadow: none !important;
    background: #ffffff !important;
  }

  body.printing-catalog .sheet-card {
    break-inside: avoid !important;
    page-break-inside: avoid !important;
  }
}
</style>