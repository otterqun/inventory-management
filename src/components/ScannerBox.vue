<script setup>
defineProps({
  isScanning: Boolean
})

defineEmits(['toggle-scan'])
</script>

<template>
  <div class="bg-white p-5 rounded-2xl border border-zinc-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col h-[460px]">
    <div class="flex justify-between items-center mb-3">
      <h2 class="text-sm font-semibold tracking-tight text-zinc-900">Pengimbas Kod Bar</h2>
      <span v-if="isScanning" class="bg-zinc-900 text-white text-[10px] tracking-wide uppercase px-2 py-0.5 rounded-full font-mono animate-pulse">
        Live
      </span>
    </div>
    
    <div class="flex-grow flex flex-col items-center justify-center mb-3 overflow-hidden rounded-xl bg-zinc-900 relative">
      <div 
        id="reader" 
        class="w-full flex items-center justify-center overflow-hidden" 
        :class="{ 'hidden': !isScanning }"
      ></div>
      
      <div v-if="!isScanning" class="text-zinc-500 font-medium text-xs font-mono">
        Tekan Mula Imbas
      </div>
    </div>
    
    <button 
      @click="$emit('toggle-scan')" 
      :class="isScanning ? 'bg-zinc-900 hover:bg-zinc-800 text-white' : 'bg-zinc-900 text-white hover:bg-zinc-800'"
      class="w-full text-xs font-medium py-3 px-4 rounded-xl transition-colors mt-auto cursor-pointer">
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