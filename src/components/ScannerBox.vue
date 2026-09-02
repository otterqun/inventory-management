<script setup>
defineProps({
  isScanning: Boolean
})

defineEmits(['toggle-scan'])
</script>

<template>
  <div class="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-blue-500 flex flex-col h-[460px]">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold text-slate-800">Scanner Barcode</h2>
      <span v-if="isScanning" class="bg-rose-500 text-white text-xs px-2.5 py-0.5 rounded-full font-bold animate-pulse">Live</span>
    </div>
    
    <div class="flex-grow flex flex-col items-center justify-center mb-4 relative overflow-hidden rounded-xl bg-slate-100 border-2 border-dashed border-slate-200">
      <div id="reader" class="w-full h-full object-cover" :class="{ 'hidden': !isScanning }"></div>
      <div v-if="!isScanning" class="text-slate-400 font-medium">
        Tekan Mula Scan
      </div>
    </div>
    
    <button 
      @click="$emit('toggle-scan')" 
      :class="isScanning ? 'bg-slate-800 hover:bg-slate-900' : 'bg-blue-600 hover:bg-blue-700'"
      class="w-full text-white font-bold py-3.5 px-4 rounded-xl transition-colors shadow-md mt-auto cursor-pointer">
      {{ isScanning ? 'Berhenti' : 'Mula Scan' }}
    </button>
  </div>
</template>