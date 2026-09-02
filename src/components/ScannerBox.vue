<script setup>
defineProps({
  isScanning: Boolean
})

defineEmits(['toggle-scan'])
</script>

<template>
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
      @click="$emit('toggle-scan')" 
      :class="isScanning ? 'bg-slate-800 hover:bg-slate-900' : 'bg-blue-600 hover:bg-blue-700'"
      class="w-full text-white font-bold py-3 px-4 rounded-xl transition-colors shadow-md mt-auto cursor-pointer">
      {{ isScanning ? 'Berhenti' : 'Mula Scan' }}
    </button>
  </div>
</template>