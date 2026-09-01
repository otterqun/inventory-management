<script setup>
import { ref, computed } from 'vue'
import { Html5Qrcode } from 'html5-qrcode'

// State Utama
const inventory = ref([])
const isScanning = ref(false)
let html5QrCode = null
let isProcessing = false 

const categories = ref(['Kering', 'Basah', 'Mandian', 'Lain-lain'])
const activeTab = ref('Semua') 
const toastMessage = ref('')

// State Modals
const showItemModal = ref(false)
const pendingBarcode = ref('')
const newItemName = ref('')
const newItemCategory = ref('Kering') 

const showCategoryModal = ref(false)
const newCategoryName = ref('')

const showEditModal = ref(false)
const editingItem = ref(null)
const editCategorySelection = ref('')

// --- Sistem Notifikasi (Toast) ---
const showToast = (msg) => {
  toastMessage.value = msg
  setTimeout(() => { toastMessage.value = '' }, 3000)
}

// --- Pengurusan Kategori ---
const openCategoryModal = () => {
  newCategoryName.value = ''
  showCategoryModal.value = true
}

const saveNewCategory = () => {
  const name = newCategoryName.value.trim()
  if (name !== '') {
    if (!categories.value.includes(name)) {
      categories.value.push(name)
      // Kalau tambah dari modal barang baru, auto-pilih kategori tu
      if (showItemModal.value) newItemCategory.value = name 
      showToast(`Kategori '${name}' berjaya ditambah!`)
      showCategoryModal.value = false
    } else {
      showToast(`Gagal: Kategori '${name}' sudah wujud.`)
    }
  }
}

const deleteCategory = (cat) => {
  // Syarat: Semak kalau ada barang guna kategori ni
  const isUsed = inventory.value.some(item => item.category === cat)
  
  if (isUsed) {
    showToast(`Gagal: Kategori '${cat}' tak kosong! Alih/buang barang dulu.`)
  } else {
    categories.value = categories.value.filter(c => c !== cat)
    if (activeTab.value === cat) activeTab.value = 'Semua'
    showToast(`Kategori '${cat}' dipadam.`)
  }
}

// --- Pengurusan Edit Kategori Barang ---
const openEditModal = (item) => {
  editingItem.value = item
  editCategorySelection.value = item.category
  showEditModal.value = true
}

const saveEditCategory = () => {
  if (editingItem.value) {
    editingItem.value.category = editCategorySelection.value
    showToast(`Kategori ${editingItem.value.name} dikemaskini.`)
    showEditModal.value = false
    editingItem.value = null
  }
}

// --- Pengurusan Scanner & Inventori (Sama macam sebelum ni) ---
const filteredInventory = computed(() => {
  if (activeTab.value === 'Semua') return inventory.value
  return inventory.value.filter(item => item.category === activeTab.value)
})

const handleScan = (scannedBarcode) => {
  if (isProcessing) return; 
  isProcessing = true;

  const existingItem = inventory.value.find(item => item.barcode === scannedBarcode)

  if (existingItem) {
    existingItem.qty++
    showToast(`${existingItem.name} ditambah! (Kuantiti: ${existingItem.qty})`)
    setTimeout(() => { isProcessing = false; }, 2000);
  } else {
    pendingBarcode.value = scannedBarcode
    newItemCategory.value = categories.value.length > 0 ? categories.value[0] : '' 
    showItemModal.value = true
  }
}

const saveNewItem = () => {
  if (newItemName.value.trim() !== '') {
    inventory.value.push({
      id: Date.now(),
      barcode: pendingBarcode.value,
      name: newItemName.value,
      category: newItemCategory.value,
      qty: 1
    })
    showToast(`${newItemName.value} didaftarkan!`)
    closeItemModal()
  }
}

const closeItemModal = () => {
  showItemModal.value = false
  newItemName.value = ''
  pendingBarcode.value = ''
  setTimeout(() => { isProcessing = false }, 1000)
}

const toggleScan = async () => {
  if (isScanning.value) {
    if (html5QrCode) {
      await html5QrCode.stop()
      html5QrCode.clear()
    }
    isScanning.value = false
  } else {
    isScanning.value = true
    html5QrCode = new Html5Qrcode("reader")
    const config = { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 }
    
    try {
      await html5QrCode.start(
        { facingMode: "environment" },
        config,
        (decodedText) => handleScan(decodedText),
        (errorMessage) => {}
      )
    } catch (err) {
      console.error("Gagal buka kamera:", err)
      showToast("Gagal akses kamera.")
      isScanning.value = false
    }
  }
}

const addQty = (item) => item.qty++
const reduceQty = (item) => {
  if (item.qty > 1) item.qty--
  else {
    inventory.value = inventory.value.filter(i => i.id !== item.id)
    showToast(`${item.name} dibuang.`)
  }
}

const getCategoryColor = (cat) => {
  const colorPalette = [
    'bg-orange-100 text-orange-700', 'bg-blue-100 text-blue-700',
    'bg-teal-100 text-teal-700', 'bg-purple-100 text-purple-700',
    'bg-pink-100 text-pink-700', 'bg-indigo-100 text-indigo-700',
    'bg-rose-100 text-rose-700', 'bg-amber-100 text-amber-700'
  ]
  const index = categories.value.indexOf(cat)
  return index >= 0 ? colorPalette[index % colorPalette.length] : 'bg-gray-100 text-gray-700'
}
</script>

<template>
  <div class="min-h-screen bg-slate-100 p-4 md:p-8 font-sans relative">
    
    <!-- Toast Message -->
    <div v-if="toastMessage" class="fixed top-4 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-lg z-[100] flex items-center gap-2 transition-all animate-bounce">
      <span class="text-emerald-400">✓</span> {{ toastMessage }}
    </div>

    <!-- Modal 1: Cipta Kategori Baru (z-[60] supaya boleh tindih modal barang) -->
    <div v-if="showCategoryModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div class="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl transform transition-all">
        <h3 class="text-lg font-bold text-slate-800 mb-4">Cipta Kategori Baru</h3>
        <input 
          v-model="newCategoryName" 
          type="text" 
          placeholder="Cth: Peti Ais, Rempah"
          class="w-full border-2 border-slate-200 rounded-xl p-3 mb-6 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          @keyup.enter="saveNewCategory"
          autofocus
        >
        <div class="flex gap-3 justify-end">
          <button @click="showCategoryModal = false" class="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold">Batal</button>
          <button @click="saveNewCategory" class="px-4 py-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl font-bold">Tambah</button>
        </div>
      </div>
    </div>

    <!-- Modal 2: Edit Kategori Barang -->
    <div v-if="showEditModal" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl transform transition-all">
        <h3 class="text-lg font-bold text-slate-800 mb-2">Tukar Kategori</h3>
        <p class="text-sm text-slate-500 mb-4">Barang: <span class="font-bold text-slate-700">{{ editingItem?.name }}</span></p>
        
        <div class="flex flex-wrap gap-2 mb-6">
          <button 
            v-for="cat in categories" :key="cat"
            @click="editCategorySelection = cat"
            :class="editCategorySelection === cat ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'"
            class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            {{ cat }}
          </button>
        </div>

        <div class="flex gap-3 justify-end">
          <button @click="showEditModal = false" class="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold">Batal</button>
          <button @click="saveEditCategory" class="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-xl font-bold">Simpan</button>
        </div>
      </div>
    </div>

    <!-- Modal 3: Daftar Barang Baru -->
    <div v-if="showItemModal" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl transform transition-all">
        <h3 class="text-xl font-bold text-slate-800 mb-2">Tambah Barang Baru</h3>
        <p class="text-sm text-slate-500 mb-4">Barcode: <span class="font-mono bg-slate-100 px-2 py-1 rounded text-blue-600">{{ pendingBarcode }}</span></p>

        <input 
          v-model="newItemName" 
          type="text" 
          placeholder="Nama barang (Cth: Susu Pekat)"
          class="w-full border-2 border-slate-200 rounded-xl p-3 mb-4 focus:outline-none focus:border-blue-500"
          @keyup.enter="saveNewItem"
        >

        <div class="mb-6">
          <div class="flex justify-between items-center mb-2">
            <p class="text-sm font-semibold text-slate-600">Pilih Kategori:</p>
            <!-- Butang ni sekarang buka Modal Kategori (z-60) -->
            <button @click="openCategoryModal" class="text-xs font-bold text-blue-600 hover:text-blue-800">+ Kategori Baru</button>
          </div>
          <div class="flex flex-wrap gap-2">
            <button 
              v-for="cat in categories" :key="cat"
              @click="newItemCategory = cat"
              :class="newItemCategory === cat ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
              class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
            >
              {{ cat }}
            </button>
          </div>
        </div>

        <div class="flex gap-3 justify-end">
          <button @click="closeItemModal" class="px-5 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold">Batal</button>
          <button @click="saveNewItem" class="px-5 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-xl font-bold shadow-md">Simpan</button>
        </div>
      </div>
    </div>

    <header class="mb-8 text-center md:text-left">
      <h1 class="text-3xl font-bold text-slate-800">🛒 Inventoy Keeper</h1>
      <p class="text-slate-500">Sistem Pemantauan Stok Rumah</p>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
      
      <!-- Bahagian Scanner -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-blue-500 flex flex-col h-full">
        <h2 class="text-xl font-semibold mb-4 text-slate-700">Scanner Barcode</h2>
        
        <div class="flex-grow flex flex-col items-center justify-center mb-4 relative">
          <div v-if="isScanning" class="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-pulse z-10">Live</div>
          <div id="reader" class="w-full rounded-xl overflow-hidden shadow-inner" :class="{ 'hidden': !isScanning }"></div>
          
          <div v-if="!isScanning" class="w-full bg-slate-200 aspect-video rounded-xl flex items-center justify-center text-slate-500 border-2 border-dashed border-slate-300">
            <p class="font-medium">Tekan Mula Scan</p>
          </div>
        </div>
        
        <button 
          @click="toggleScan" 
          :class="isScanning ? 'bg-slate-800 hover:bg-slate-900' : 'bg-blue-600 hover:bg-blue-700'"
          class="w-full text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-md mt-auto">
          {{ isScanning ? 'Berhenti' : 'Mula Scan' }}
        </button>
      </div>

      <!-- Bahagian Inventori -->
      <div class="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-emerald-500 flex flex-col">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-slate-700">Stok Semasa ({{ filteredInventory.length }})</h2>
        </div>
        
        <!-- Filter Tabs + Tambah Kategori -->
        <div class="flex items-center overflow-x-auto pb-2 mb-4 hide-scrollbar gap-2">
          <button 
            @click="activeTab = 'Semua'"
            :class="activeTab === 'Semua' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
            class="whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-bold transition-colors"
          >
            Semua
          </button>
          
          <!-- Tab Kategori dengan Butang Padam (×) -->
          <div 
            v-for="cat in categories" :key="cat"
            class="flex items-center rounded-full transition-colors"
            :class="activeTab === cat ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
          >
            <button @click="activeTab = cat" class="whitespace-nowrap pl-4 pr-2 py-1.5 text-sm font-bold">
              {{ cat }}
            </button>
            <button 
              @click.stop="deleteCategory(cat)" 
              class="pr-3 pl-1 text-lg leading-none hover:text-red-500 opacity-60 hover:opacity-100 transition-opacity" 
              title="Padam Kategori"
            >
              ×
            </button>
          </div>

          <button 
            @click="openCategoryModal"
            class="whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-bold bg-blue-100 text-blue-600 hover:bg-blue-200 border border-dashed border-blue-400 transition-colors flex items-center gap-1"
          >
            <span>+</span> Kategori
          </button>
        </div>

        <div v-if="filteredInventory.length === 0" class="text-center py-10 text-slate-400 flex-grow">
          <p>Tiada stok dalam senarai ini.</p>
        </div>

        <div v-else class="space-y-3 overflow-y-auto max-h-[500px] pr-2">
          <div v-for="item in filteredInventory" :key="item.id" 
               class="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-200 hover:shadow-sm transition-shadow">
            
            <div class="flex flex-col items-start gap-1">
              <span class="font-bold text-slate-700">{{ item.name }}</span>
              <!-- Kategori Badge (Boleh klik untuk edit) -->
              <button 
                @click="openEditModal(item)" 
                :class="getCategoryColor(item.category)" 
                class="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md hover:opacity-75 transition-opacity flex items-center gap-1 cursor-pointer"
                title="Tukar Kategori"
              >
                {{ item.category }} <span>✎</span>
              </button>
            </div>
            
            <div class="flex items-center gap-3">
              <button @click="reduceQty(item)" class="bg-red-100 text-red-600 w-8 h-8 rounded-lg hover:bg-red-200 font-bold flex items-center justify-center transition-colors">-</button>
              <span class="w-6 text-center font-bold text-slate-800">{{ item.qty }}</span>
              <button @click="addQty(item)" class="bg-emerald-100 text-emerald-700 w-8 h-8 rounded-lg hover:bg-emerald-200 font-bold flex items-center justify-center transition-colors">+</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>