<script setup>
import { ref, computed, watch } from 'vue'
import { Html5Qrcode } from 'html5-qrcode'
import PieChart from '../components/PieChart.vue'
import ScannerBox from '../components/ScannerBox.vue'
import InventoryList from '../components/InventoryList.vue'
import InventoryModals from '../components/InventoryModals.vue'
import ActivityLog from '../components/ActivityLog.vue'
import BarcodeLabelModal from '../components/BarcodeLabelModal.vue'

const inventory = ref(JSON.parse(localStorage.getItem('inv_items') || '[]'))
const categories = ref(JSON.parse(localStorage.getItem('inv_cats') || '["Kering", "Basah", "Mandian", "Lain-lain"]'))
const activityLogs = ref(JSON.parse(localStorage.getItem('inv_logs') || '[]'))

watch(inventory, (val) => localStorage.setItem('inv_items', JSON.stringify(val)), { deep: true })
watch(categories, (val) => localStorage.setItem('inv_cats', JSON.stringify(val)), { deep: true })
watch(activityLogs, (val) => localStorage.setItem('inv_logs', JSON.stringify(val)), { deep: true })

const isScanning = ref(false)
let html5QrCode = null
let isProcessing = false 

const activeTab = ref('Semua') 
const toastMessage = ref('')

const showItemModal = ref(false)
const pendingBarcode = ref('')
const newItemName = ref('')
const newItemCategory = ref('Kering') 

const showCategoryModal = ref(false)
const newCategoryName = ref('')

const showEditModal = ref(false)
const editingItem = ref(null)
const editCategorySelection = ref('')

// State untuk Modal Pelekat Kod Bar
const showLabelModal = ref(false)
const selectedLabelItem = ref(null)

const playBeepSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext
    if (!AudioContext) return

    const audioCtx = new AudioContext()
    const oscillator = audioCtx.createOscillator()
    const gainNode = audioCtx.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioCtx.destination)

    oscillator.type = 'triangle'
    oscillator.frequency.setValueAtTime(950, audioCtx.currentTime)

    gainNode.gain.setValueAtTime(0.8, audioCtx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.15)

    oscillator.start(audioCtx.currentTime)
    oscillator.stop(audioCtx.currentTime + 0.15)

    if (navigator.vibrate) {
      navigator.vibrate(100)
    }
  } catch (err) {
    console.error('Audio beep tidak dapat dimainkan:', err)
  }
}

const addLog = (type, name) => {
  const now = new Date()
  const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
  const day = String(now.getDate()).padStart(2, '0')
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year = now.getFullYear()

  activityLogs.value.unshift({
    id: Date.now(),
    type,
    name,
    timestamp: `[ ${time} | ${day}/${month}/${year} ]`
  })
  if (activityLogs.value.length > 30) activityLogs.value.pop()
}

const showToast = (msg) => {
  toastMessage.value = msg
  setTimeout(() => { toastMessage.value = '' }, 2500)
}

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
      showToast(`Kategori '${name}' ditambah`)
      showCategoryModal.value = false
    } else {
      showToast(`Kategori '${name}' sudah wujud`)
    }
  }
}

const deleteCategory = (cat) => {
  const isUsed = inventory.value.some(item => item.category === cat)
  if (isUsed) {
    showToast(`Kategori '${cat}' masih mempunyai item`)
  } else {
    categories.value = categories.value.filter(c => c !== cat)
    if (activeTab.value === cat) activeTab.value = 'Semua'
    showToast(`Kategori dipadam`)
  }
}

const openEditModal = (item) => {
  editingItem.value = item
  editCategorySelection.value = item.category
  showEditModal.value = true
}

const saveEditCategory = () => {
  if (editingItem.value) {
    editingItem.value.category = editCategorySelection.value
    showToast(`Kategori ${editingItem.value.name} dikemaskini`)
    showEditModal.value = false
    editingItem.value = null
  }
}

const filteredInventory = computed(() => {
  if (activeTab.value === 'Semua') return inventory.value
  return inventory.value.filter(item => item.category === activeTab.value)
})

const handleScan = (scannedBarcode) => {
  if (isProcessing) return
  isProcessing = true

  playBeepSound()

  const existingItem = inventory.value.find(item => item.barcode === scannedBarcode)

  if (existingItem) {
    existingItem.qty++
    addLog('TAMBAH', `${existingItem.name} (+1)`)
    showToast(`${existingItem.name} (+1)`)
    setTimeout(() => { isProcessing = false }, 2000)
  } else {
    pendingBarcode.value = scannedBarcode
    newItemCategory.value = categories.value.length > 0 ? categories.value[0] : '' 
    showItemModal.value = true
  }
}

// Jana Barcode Manual Format DIF-XXXXXX
const handleCreateCustomBarcode = () => {
  const randomSuffix = Math.floor(100000 + Math.random() * 900000)
  pendingBarcode.value = `DIF-${randomSuffix}`
  newItemCategory.value = categories.value.length > 0 ? categories.value[0] : ''
  newItemName.value = ''
  showItemModal.value = true
}

// Buka Modal Cetak Pelekat
const openLabelModal = (item) => {
  selectedLabelItem.value = item
  showLabelModal.value = true
}

const saveNewItem = () => {
  if (newItemName.value.trim() !== '') {
    const newItem = {
      id: Date.now(),
      barcode: pendingBarcode.value,
      name: newItemName.value,
      category: newItemCategory.value,
      qty: 1
    }
    inventory.value.push(newItem)
    addLog('DAFTAR', `${newItemName.value}`)
    showToast(`Item didaftarkan`)
    
    // Jika item kustom DIF, terus tawarkan modal cetak pelekat
    if (newItem.barcode.startsWith('DIF-')) {
      openLabelModal(newItem)
    }

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

    const config = {
      fps: 15,
      qrbox: { width: 300, height: 100 }
    }

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
    addLog('BUANG', `${item.name}`)
    showToast(`${item.name} dikeluarkan`)
  }
}

const clearLogs = () => {
  activityLogs.value = []
  localStorage.removeItem('inv_logs')
  showToast('Log dikosongkan')
}
</script>

<template>
  <main class="min-h-screen bg-[#fafafa] p-4 sm:p-6 md:p-8 font-sans antialiased text-zinc-900 relative">
    
    <div v-if="toastMessage" class="fixed top-4 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-xs font-mono px-4 py-2 rounded-lg shadow-lg z-[100] border border-zinc-800">
      {{ toastMessage }}
    </div>

    <!-- Modals Pendaftaran Sedia Ada -->
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

    <!-- Modal Cetak Pelekat Baru -->
    <BarcodeLabelModal 
      :show="showLabelModal"
      :item="selectedLabelItem"
      @close="showLabelModal = false"
    />

    <!-- Layout Dashboard -->
    <div class="max-w-6xl mx-auto space-y-6">
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
          @create-custom-barcode="handleCreateCustomBarcode"
          @print-label="openLabelModal"
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <PieChart :items="inventory" :categories="categories" />
        <ActivityLog :logs="activityLogs" @clear-logs="clearLogs" />
      </div>
    </div>
  </main>
</template>

<style>
.hide-scrollbar::-webkit-scrollbar { display: none; }
.hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
</style>