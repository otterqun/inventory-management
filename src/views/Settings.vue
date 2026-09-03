<script setup>
import { ref, nextTick, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import QRCode from 'qrcode'
import LZString from 'lz-string'
import { Html5Qrcode } from 'html5-qrcode'

const router = useRouter()

const showQrModal = ref(false)
const showScannerModal = ref(false)
const showConfirmDeleteModal = ref(false) // State modal pengesahan padam
const toastMsg = ref('')
const qrCanvasRef = ref(null)
const dataSummary = ref({ itemsCount: 0, rawSize: '0 B', compressedSize: '0 B' })

let qrScanner = null

const triggerToast = (msg) => {
  toastMsg.value = msg
  setTimeout(() => { toastMsg.value = '' }, 3000)
}

// 1. JANA QR KOD DATA
const openGenerateQr = async () => {
  const items = localStorage.getItem('inv_items') || '[]'
  const cats = localStorage.getItem('inv_cats') || '[]'

  const parsedItems = JSON.parse(items)
  if (parsedItems.length === 0) {
    triggerToast('Tiada data untuk dipindahkan.')
    return
  }

  const payload = JSON.stringify({
    version: 1,
    items: parsedItems,
    categories: JSON.parse(cats),
    timestamp: Date.now()
  })

  const compressed = LZString.compressToEncodedURIComponent(payload)
  const fullSyncPayload = `INV_SYNC:${compressed}`

  dataSummary.value = {
    itemsCount: parsedItems.length,
    rawSize: `${(new Blob([payload]).size / 1024).toFixed(2)} KB`,
    compressedSize: `${(new Blob([fullSyncPayload]).size / 1024).toFixed(2)} KB`
  }

  showQrModal.value = true
  await nextTick()

  if (qrCanvasRef.value) {
    QRCode.toCanvas(qrCanvasRef.value, fullSyncPayload, {
      width: 280,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#18181b',
        light: '#ffffff'
      }
    }, (error) => {
      if (error) {
        console.error('Ralat jana QR:', error)
        triggerToast('Data terlalu besar untuk satu kod QR.')
      }
    })
  }
}

// 2. IMBAS QR & SIMPAN KE LOCALSTORAGE PERANTI INI
const startImportScanner = async () => {
  showScannerModal.value = true
  await nextTick()

  qrScanner = new Html5Qrcode('qr-sync-reader')
  const config = { fps: 15, qrbox: { width: 250, height: 250 } }

  try {
    await qrScanner.start(
      { facingMode: 'environment' },
      config,
      (decodedText) => {
        handleReceivedPayload(decodedText)
      },
      () => {}
    )
  } catch (err) {
    console.error('Kamera gagal dimulakan:', err)
    triggerToast('Gagal akses kamera.')
    closeImportScanner()
  }
}

const closeImportScanner = async () => {
  if (qrScanner) {
    try {
      await qrScanner.stop()
      qrScanner.clear()
    } catch (e) {
      console.error(e)
    } finally {
      qrScanner = null
    }
  }
  showScannerModal.value = false
}

const handleReceivedPayload = async (rawCode) => {
  if (!rawCode.startsWith('INV_SYNC:')) {
    triggerToast('Kod QR bukan kod pindahan inventori.')
    return
  }

  try {
    const compressedStr = rawCode.replace('INV_SYNC:', '')
    const decompressedStr = LZString.decompressFromEncodedURIComponent(compressedStr)
    const data = JSON.parse(decompressedStr)

    if (data && data.items) {
      localStorage.setItem('inv_items', JSON.stringify(data.items))
      if (data.categories) {
        localStorage.setItem('inv_cats', JSON.stringify(data.categories))
      }

      await closeImportScanner()
      triggerToast(`Berjaya! ${data.items.length} item diterima ke peranti ini.`)
      
      setTimeout(() => {
        router.push('/')
      }, 1000)
    }
  } catch (err) {
    console.error('Gagal ekstrak data:', err)
    triggerToast('Format QR rosak atau gagal dinyah-mampat.')
  }
}

// Tindakan Selenggara
const loadSampleData = () => {
  const sampleCats = ["Kering", "Basah", "Mandian", "Lain-lain"]
  const sampleItems = [
    { id: 1, barcode: "955600123456", name: "Maggi Kari 5x79g", category: "Kering", qty: 3, expiryDate: "2026-10-15" },
    { id: 2, barcode: "DIF-849201", name: "Bawang Goreng Ranggup", category: "Kering", qty: 2, expiryDate: "2026-09-05" },
    { id: 3, barcode: "955610293847", name: "Sabun Mandi Lavender", category: "Mandian", qty: 4, expiryDate: null }
  ]
  localStorage.setItem('inv_cats', JSON.stringify(sampleCats))
  localStorage.setItem('inv_items', JSON.stringify(sampleItems))
  triggerToast('Data contoh telah dimuatkan.')
}

const triggerDeleteConfirmation = () => {
  showConfirmDeleteModal.value = true
}

const executeDeleteAllData = () => {
  localStorage.removeItem('inv_items')
  localStorage.removeItem('inv_cats')
  localStorage.removeItem('inv_logs')
  showConfirmDeleteModal.value = false
  triggerToast('Semua data dipadam.')
  
  setTimeout(() => { 
    router.push('/')
  }, 600)
}

onBeforeUnmount(() => {
  closeImportScanner()
})
</script>

<template>
  <main class="min-h-screen bg-[#fafafa] p-4 sm:p-6 md:p-8 font-sans antialiased text-zinc-900">
    <div v-if="toastMsg" class="fixed top-4 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-xs font-mono px-4 py-2 rounded-lg shadow-lg z-[100]">
      {{ toastMsg }}
    </div>

    <div class="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 class="text-base font-semibold tracking-tight text-zinc-900">Tetapan & Penyelenggaraan</h1>
        <p class="text-xs text-zinc-500">Urus data storan peranti dan pemindahan luar talian.</p>
      </div>

      <!-- Kad Pemindahan Data P2P via QR -->
      <section class="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div class="border-b border-zinc-100 pb-3">
          <h2 class="text-xs font-bold font-mono tracking-wider uppercase text-zinc-800">Pemindahan Data Antara Peranti (P2P QR)</h2>
          <p class="text-xs text-zinc-500 mt-0.5">Pindahkan keseluruhan inventori ke telefon atau peranti lain tanpa perlukan internet atau database server.</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div class="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/50 flex flex-col justify-between space-y-3">
            <div>
              <p class="text-xs font-semibold text-zinc-800">1. Hantar Data (Laptop / Sumber)</p>
              <p class="text-[11px] text-zinc-500 mt-1">Papar QR kod termampat di skrin ini untuk diimbas oleh telefon.</p>
            </div>
            <button 
              @click="openGenerateQr"
              class="w-full py-2 px-3 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              Jana QR Pemindahan
            </button>
          </div>

          <div class="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/50 flex flex-col justify-between space-y-3">
            <div>
              <p class="text-xs font-semibold text-zinc-800">2. Terima Data (Telefon / Sasaran)</p>
              <p class="text-[11px] text-zinc-500 mt-1">Buka kamera peranti ini untuk imbas QR di skrin laptop.</p>
            </div>
            <button 
              @click="startImportScanner"
              class="w-full py-2 px-3 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-200 text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              Imbas QR Pindahan
            </button>
          </div>
        </div>
      </section>

      <!-- Kad Pengurusan Data -->
      <section class="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-3">
        <div class="border-b border-zinc-100 pb-3">
          <h2 class="text-xs font-bold font-mono tracking-wider uppercase text-zinc-800">Penyelenggaraan Storan</h2>
        </div>

        <div class="flex items-center justify-between py-2 border-b border-zinc-100">
          <div>
            <p class="text-xs font-semibold text-zinc-900">Muat Data Contoh</p>
            <p class="text-[11px] text-zinc-500">Isi storan dengan rekod simulasi bagi tujuan pengujian.</p>
          </div>
          <button 
            @click="loadSampleData"
            class="px-3 py-1.5 border border-zinc-200 hover:bg-zinc-100 text-zinc-800 rounded-lg text-xs font-mono transition-colors cursor-pointer"
          >
            Muat Data
          </button>
        </div>

        <div class="flex items-center justify-between py-2">
          <div>
            <p class="text-xs font-semibold text-rose-600">Kosongkan Semua Rekod</p>
            <p class="text-[11px] text-zinc-500">Padamkan data LocalStorage dan kembalikan kepada kosong.</p>
          </div>
          <button 
            @click="triggerDeleteConfirmation"
            class="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-mono transition-colors cursor-pointer"
          >
            Padam Data
          </button>
        </div>
      </section>
    </div>

    <!-- Modal Pengesahan Padam Data (Gaya Custom) -->
    <div v-if="showConfirmDeleteModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div class="bg-white rounded-2xl border border-zinc-200 shadow-xl max-w-sm w-full p-6 space-y-4">
        <div>
          <h3 class="text-sm font-semibold tracking-tight text-zinc-900">Padam Semua Rekod?</h3>
          <p class="text-xs text-zinc-500 mt-1">Tindakan ini akan mengosongkan inventori, senarai kategori, serta rekod aktiviti sepenuhnya daripada peranti ini.</p>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 font-mono text-xs">
          <button 
            @click="showConfirmDeleteModal = false" 
            class="px-3 py-1.5 text-zinc-600 hover:text-zinc-900 cursor-pointer"
          >
            Batal
          </button>
          <button 
            @click="executeDeleteAllData" 
            class="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-sans font-medium rounded-lg transition-colors cursor-pointer"
          >
            Ya, Padam
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Paparan QR Kod (Penghantar) -->
    <div v-if="showQrModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div class="bg-white rounded-2xl border border-zinc-200 shadow-xl max-w-sm w-full p-6 text-center space-y-4">
        <div>
          <h3 class="text-sm font-semibold text-zinc-900">Imbas Menggunakan Telefon</h3>
          <p class="text-xs text-zinc-500 mt-0.5">Buka halaman Tetapan pada telefon dan tekan "Imbas QR Pindahan".</p>
        </div>

        <div class="flex justify-center bg-white p-3 rounded-xl border border-zinc-200">
          <canvas ref="qrCanvasRef" class="max-w-full"></canvas>
        </div>

        <div class="bg-zinc-50 p-2.5 rounded-lg border border-zinc-200 text-left font-mono text-[10px] text-zinc-500 space-y-0.5">
          <div class="flex justify-between"><span>Jumlah Item:</span> <span class="text-zinc-900 font-semibold">{{ dataSummary.itemsCount }}</span></div>
          <div class="flex justify-between"><span>Saiz Mentah:</span> <span>{{ dataSummary.rawSize }}</span></div>
          <div class="flex justify-between"><span>Saiz Termampat:</span> <span class="text-emerald-600 font-semibold">{{ dataSummary.compressedSize }}</span></div>
        </div>

        <button 
          @click="showQrModal = false"
          class="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-medium cursor-pointer"
        >
          Selesai / Tutup
        </button>
      </div>
    </div>

    <!-- Modal Pengimbas QR (Penerima) -->
    <div v-if="showScannerModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div class="bg-white rounded-2xl border border-zinc-200 shadow-xl max-w-sm w-full p-5 space-y-4">
        <div class="flex justify-between items-center">
          <div>
            <h3 class="text-sm font-semibold text-zinc-900">Imbas QR Komputer</h3>
            <p class="text-[11px] text-zinc-500">Halakan kamera ke QR di skrin komputer.</p>
          </div>
          <button @click="closeImportScanner" class="text-zinc-400 hover:text-zinc-600 font-mono text-sm cursor-pointer">✕</button>
        </div>

        <div class="relative bg-black rounded-xl overflow-hidden min-h-[260px] flex items-center justify-center">
          <div id="qr-sync-reader" class="w-full"></div>
        </div>

        <button 
          @click="closeImportScanner"
          class="w-full py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-800 rounded-xl text-xs font-medium cursor-pointer"
        >
          Batal
        </button>
      </div>
    </div>
  </main>
</template>