<script setup>
import { nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import JsBarcode from 'jsbarcode'

const props = defineProps({
  show: Boolean,
  item: Object
})

const emit = defineEmits(['close'])
const router = useRouter()

watch(
  () => props.show,
  async (isShown) => {
    if (isShown && props.item) {
      await nextTick()
      try {
        JsBarcode('#barcode-svg', props.item.barcode, {
          format: 'CODE128',
          lineColor: '#18181b',
          width: 2,
          height: 55,
          displayValue: true,
          font: 'monospace',
          fontSize: 13,
          textMargin: 4,
          margin: 0
        })
      } catch (err) {
        console.error('Gagal menjana barcode:', err)
      }
    }
  }
)

const goToCatalog = () => {
  emit('close')
  router.push('/katalog')
}
</script>

<template>
  <div v-if="show && item" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
    <div class="bg-white rounded-2xl border border-zinc-200 shadow-xl max-w-sm w-full p-6 space-y-5">
      
      <div class="flex justify-between items-center modal-controls">
        <div>
          <h3 class="text-sm font-semibold tracking-tight text-zinc-900">Pelekat Kod Bar</h3>
          <p class="text-xs text-zinc-500">Pratonton label pelekat barangan</p>
        </div>
        <button 
          @click="emit('close')" 
          class="text-zinc-400 hover:text-zinc-700 text-sm font-mono cursor-pointer"
        >
          ✕
        </button>
      </div>

      <!-- Kad Pelekat -->
      <div id="printable-label" class="border border-zinc-300 rounded-xl p-4 bg-white flex flex-col items-center justify-center text-center space-y-2">
        <div class="w-full border-b border-zinc-200 pb-1.5 mb-1 text-left">
          <p class="text-xs font-semibold text-zinc-900 truncate">{{ item.name }}</p>
          <p class="text-[10px] text-zinc-500 uppercase tracking-wider font-mono">{{ item.category }}</p>
        </div>

        <svg id="barcode-svg" class="max-w-full"></svg>

        <div class="w-full pt-1 text-right">
          <span class="text-[9px] text-zinc-400 font-mono">DIF INVENTORY</span>
        </div>
      </div>

      <div class="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 modal-controls font-mono text-xs">
        <button 
          @click="emit('close')" 
          class="px-3 py-1.5 text-zinc-600 hover:text-zinc-900 rounded-lg transition-colors cursor-pointer"
        >
          Tutup
        </button>
        <button 
          @click="goToCatalog" 
          class="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white font-sans font-medium rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <span>Buka Katalog</span>
        </button>
      </div>

    </div>
  </div>
</template>

<style>
@media print {
  /* Berfungsi HANYA jika dicetuskan oleh butang modal pelekat */
  body.printing-single-label * {
    visibility: hidden !important;
  }

  body.printing-single-label #printable-label,
  body.printing-single-label #printable-label * {
    visibility: visible !important;
  }

  body.printing-single-label #printable-label {
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    width: 60mm !important;
    border: 1px solid #000 !important;
    box-shadow: none !important;
  }
}
</style>