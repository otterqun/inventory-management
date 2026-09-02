<script setup>
defineProps({
  logs: {
    type: Array,
    default: () => []
  }
})

defineEmits(['clear-logs'])

const getBadgeStyle = (type) => {
  switch (type) {
    case 'TAMBAH':
      return 'text-zinc-900 bg-zinc-100 border-zinc-200'
    case 'TOLAK':
      return 'text-zinc-600 bg-zinc-50 border-zinc-200'
    case 'BUANG':
      return 'text-zinc-500 bg-zinc-100 border-zinc-200'
    case 'DAFTAR':
      return 'text-zinc-900 bg-zinc-200 border-zinc-300 font-bold'
    default:
      return 'text-zinc-500 bg-zinc-50 border-zinc-200'
  }
}
</script>

<template>
  <div class="bg-white p-5 rounded-2xl border border-zinc-200 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex flex-col h-[460px]">
    <div class="flex justify-between items-center mb-3">
      <h2 class="text-sm font-semibold tracking-tight text-zinc-900">Jejak Aktiviti</h2>
      <button 
        v-if="logs.length > 0"
        @click="$emit('clear-logs')" 
        class="text-xs text-zinc-600 hover:text-zinc-900 cursor-pointer transition-colors font-mono"
      >
        Kosongkan
      </button>
    </div>

    <div v-if="logs.length === 0" class="flex-grow flex items-center justify-center text-zinc-600 text-xs font-mono">
      Tiada rekod aktiviti
    </div>

    <div v-else class="space-y-1.5 overflow-y-auto pr-1 flex-grow font-mono text-xs">
      <div 
        v-for="log in logs" 
        :key="log.id" 
        class="flex items-center justify-between p-2 rounded-lg border border-zinc-100 bg-zinc-50/50"
      >
        <div class="flex items-center gap-2 min-w-0">
          <span 
            :class="getBadgeStyle(log.type)" 
            class="text-[10px] px-1.5 py-0.5 rounded border uppercase tracking-wider shrink-0"
          >
            {{ log.type }}
          </span>
          <span class="text-zinc-800 truncate font-sans text-xs">{{ log.name }}</span>
        </div>
        <span class="text-[10px] text-zinc-600 shrink-0 ml-2 whitespace-nowrap">
          {{ log.timestamp || log.time }}
        </span>
      </div>
    </div>
  </div>
</template>