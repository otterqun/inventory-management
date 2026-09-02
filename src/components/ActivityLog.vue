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
      return 'bg-emerald-100 text-emerald-700 border-emerald-300'
    case 'TOLAK':
      return 'bg-amber-100 text-amber-700 border-amber-300'
    case 'BUANG':
      return 'bg-rose-100 text-rose-700 border-rose-300'
    case 'DAFTAR':
      return 'bg-blue-100 text-blue-700 border-blue-300'
    default:
      return 'bg-slate-100 text-slate-700 border-slate-300'
  }
}
</script>

<template>
  <div class="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-amber-500 flex flex-col h-[350px]">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-bold text-slate-700">Sejarah Aktiviti</h3>
      <button 
        v-if="logs.length > 0"
        @click="$emit('clear-logs')" 
        class="text-xs text-rose-500 hover:text-rose-700 font-semibold cursor-pointer"
      >
        Kosongkan
      </button>
    </div>

    <!-- Paparan jika log kosong -->
    <div v-if="logs.length === 0" class="flex-grow flex items-center justify-center text-slate-400">
      Tiada rekod aktiviti setakat ini.
    </div>

    <!-- Senarai Rekod -->
    <div v-else class="space-y-2.5 overflow-y-auto pr-1 flex-grow">
      <div 
        v-for="log in logs" 
        :key="log.id" 
        class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-sm"
      >
        <div class="flex items-center gap-2.5 min-w-0">
          <span 
            :class="getBadgeStyle(log.type)" 
            class="text-[10px] font-bold px-2 py-0.5 rounded-md border tracking-wide uppercase shrink-0"
          >
            {{ log.type }}
          </span>
          <span class="font-medium text-slate-700 truncate">{{ log.name }}</span>
        </div>
        <span class="text-xs text-slate-400 shrink-0 ml-2 font-mono">{{ log.time }}</span>
      </div>
    </div>
  </div>
</template>