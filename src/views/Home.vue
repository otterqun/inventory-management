<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { Html5Qrcode } from 'html5-qrcode'
import PieChart from '../components/PieChart.vue'
import ScannerBox from '../components/ScannerBox.vue'
import InventoryList from '../components/InventoryList.vue'
import InventoryModals from '../components/InventoryModals.vue'
import ActivityLog from '../components/ActivityLog.vue'

// --- State Utama & LocalStorage ---
const inventory = ref(JSON.parse(localStorage.getItem('inv_items') || '[]'))
const categories = ref(JSON.parse(localStorage.getItem('inv_cats') || '["Kering", "Basah", "Mandian", "Lain-lain"]'))
const activityLogs = ref(JSON.parse(localStorage.getItem('inv_logs') || '[]'))

// Auto-sync ke LocalStorage
watch(inventory, (val) => localStorage.setItem('inv_items', JSON.stringify(val)), { deep: true })
watch(categories, (val) => localStorage.setItem('inv_cats', JSON.stringify(val)), { deep: true })
watch(activityLogs, (val) => localStorage.setItem('inv_logs', JSON.stringify(val)), { deep: true })

const isScanning = ref(false)
let html5QrCode = null
let isProcessing = false 

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

// --- Sistem Log & Toast ---
const addLog = (type, name) => {
  const now = new Date()

  // Format masa: HH:mm (cth: 08:30 PM atau 20:30)
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })

  // Format tarikh: dd/mm/yyyy
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year = now.getFullYear()
  const dateFormatted = `${day}/${month}/${year}`

  activityLogs.value.unshift({
    id: Date.now(),
    type,
    name,
    timestamp: `[ ${time} | ${dateFormatted} ]`
  })

  // Hadkan simpanan kepada 30 rekod terkini
  if (activityLogs.value.length > 30) {
    activityLogs.value.pop()
  }
}

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
      if (showItemModal.value) newItemCategory.value = name 
      showToast(`Kategori '${name}' berjaya ditambah!`)
      showCategoryModal.value = false
    } else {
      showToast(`Gagal: Kategori '${name}' sudah wujud.`)
    }
  }
}

const deleteCategory = (cat) => {
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

// --- Pengurusan Scanner & Inventori ---
const filteredInventory = computed(() => {
  if (activeTab.value === 'Semua') return inventory.value
  return inventory.value.filter(item => item.category === activeTab.value)
})

const handleScan = (scannedBarcode) => {
  if (isProcessing) return
  isProcessing = true

  const existingItem = inventory.value.find(item => item.barcode === scannedBarcode)

  if (existingItem) {
    existingItem.qty++
    addLog('TAMBAH', `${existingItem.name} (+1)`)
    showToast(`${existingItem.name} ditambah! (Kuantiti: ${existingItem.qty})`)
    setTimeout(() => { isProcessing = false }, 2000)
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
    addLog('DAFTAR', `${newItemName.value} (Daftar Baharu)`)
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
        () => {}
      )
    } catch (err) {
      console.error("Gagal buka kamera:", err)
      showToast("Gagal akses kamera.")
      isScanning.value = false
    }
  }
}

const addQty = (item) => {
  item.qty++
  addLog('TAMBAH', `${item.name} (+1)`)
}

const reduceQty = (item) => {
  if (item.qty > 1) {
    item.qty--
    addLog('TOLAK', `${item.name} (-1)`)
  } else {
    inventory.value = inventory.value.filter(i => i.id !== item.id)
    addLog('BUANG', `${item.name} (Keluarkan Stok)`)
    showToast(`${item.name} dibuang.`)
  }
}

const clearLogs = () => {
  activityLogs.value = []
  localStorage.removeItem('inv_logs')
  showToast('Sejarah aktiviti dikosongkan.')
}
</script>

<template>
  <div class="min-h-screen bg-slate-100 p-4 md:p-8 font-sans relative">
    
    <!-- Toast Message -->
    <div v-if="toastMessage" class="fixed top-4 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-lg z-[100] flex items-center gap-2 transition-all animate-bounce">
      <span class="text-emerald-400">✓</span> {{ toastMessage }}
    </div>

    <!-- Modals -->
    <InventoryModals 
      :show-category-modal="showCategoryModal"
      v-model:new-category-name="newCategoryName"
      :show-edit-modal="showEditModal"
      :editing-item="editingItem"
      v-model:edit-category-selection="editCategorySelection"
      :show-item-modal="showItemModal"
      :pending-barcode="pendingBarcode"
      v-model:new-item-name="newItemName"
      v-model:new-item-category="newItemCategory"
      :categories="categories"
      @close-category-modal="showCategoryModal = false"
      @save-category="saveNewCategory"
      @close-edit-modal="showEditModal = false"
      @save-edit-category="saveEditCategory"
      @close-item-modal="closeItemModal"
      @save-item="saveNewItem"
      @open-category-modal="openCategoryModal"
    />

    <!-- Dashboard Container -->
    <div class="max-w-6xl mx-auto space-y-6 pb-10">
      
      <!-- GRID ATAS (Scanner & Inventori) -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <ScannerBox 
          :is-scanning="isScanning" 
          @toggle-scan="toggleScan" 
        />
        <InventoryList 
          :items="filteredInventory" 
          :categories="categories" 
          :active-tab="activeTab"
          @change-tab="activeTab = $event"
          @open-cat-modal="openCategoryModal"
          @delete-cat="deleteCategory"
          @open-edit-modal="openEditModal"
          @add-qty="addQty"
          @reduce-qty="reduceQty"
        />
      </div>

      <!-- GRID BAWAH (Carta & Sejarah) -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <PieChart :items="inventory" :categories="categories" />
        <ActivityLog :logs="activityLogs" @clear-logs="clearLogs" />
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