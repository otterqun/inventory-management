<script setup>
defineProps({
  isScanning: Boolean,
  scanMode: {
    type: String,
    default: 'in' // 'in' atau 'out'
  }
})

defineEmits(['toggle-scan', 'update:scanMode'])
</script>

<template>
  <div class="bg-white p-5 rounded-2xl border border-zinc-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col h-[460px]">
    <!-- Header & Suis Mod Masuk/Keluar -->
    <div class="flex justify-between items-center mb-3">
      <div class="flex items-center gap-2">
        <h2 class="text-sm font-semibold tracking-tight text-zinc-900">Pengimbas Kod Bar</h2>
        <span v-if="isScanning" class="bg-zinc-900 text-white text-[10px] tracking-wide uppercase px-2 py-0.5 rounded-full font-mono animate-pulse">
          Live
        </span>
      </div>

      <!-- Suis Mod: Masuk (+1) vs Keluar (-1) -->
      <div class="flex items-center bg-zinc-100 p-0.5 rounded-lg font-mono text-[11px] border border-zinc-200/80">
        <button 
          @click="$emit('update:scanMode', 'in')"
          :class="scanMode === 'in' ? 'bg-white text-zinc-900 shadow-xs font-semibold' : 'text-zinc-500 hover:text-zinc-800'"
          class="px-2.5 py-1 rounded-md transition-all cursor-pointer"
        >
          + Masuk
        </button>
        <button 
          @click="$emit('update:scanMode', 'out')"
          :class="scanMode === 'out' ? 'bg-zinc-900 text-white shadow-xs font-semibold' : 'text-zinc-500 hover:text-zinc-800'"
          class="px-2.5 py-1 rounded-md transition-all cursor-pointer"
        >
          - Keluar
        </button>
      </div>
    </div>
    
    <!-- Viewfinder Kamera (Setting Asal Dikekalkan) -->
    <div class="flex-grow flex flex-col items-center justify-center mb-3 overflow-hidden rounded-xl bg-zinc-900 relative">
      <div 
        id="reader" 
        class="w-full flex items-center justify-center overflow-hidden" 
        :class="{ 'hidden': !isScanning }"
      ></div>
      
      <div v-if="!isScanning" class="text-zinc-500 font-medium text-xs font-mono">
        Tekan Mula Imbas
      </div>

      <!-- Penunjuk Mod Semasa Scanning Aktif -->
      <div 
        v-if="isScanning" 
        class="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider backdrop-blur-md z-10"
        :class="scanMode === 'in' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'"
      >
        Mod: {{ scanMode === 'in' ? 'Kemasukan (+1)' : 'Pengeluaran (-1)' }}
      </div>
    </div>
    
    <!-- Butang Tindakan Asal -->
    <button 
      @click="$emit('toggle-scan')" 
      :class="isScanning ? 'bg-zinc-900 hover:bg-zinc-800 text-white' : 'bg-zinc-900 text-white hover:bg-zinc-800'"
      class="w-full text-xs font-medium py-3 px-4 rounded-xl transition-colors mt-auto cursor-pointer"
    >
      {{ isScanning ? 'Berhenti' : 'Mula Imbas' }}
    </button>
  </div>
</template>

<style>
/* Pastikan video mengekalkan nisbah asal di dalam reader */
#reader video {
  border-radius: 0.75rem;
  max-height: 320px;
  width: 100% !important;
}
</style>