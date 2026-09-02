<script setup>
const props = defineProps({
  items: Array,
  categories: Array,
  activeTab: String
})

defineEmits(['change-tab', 'open-cat-modal', 'delete-cat', 'open-edit-modal', 'add-qty', 'reduce-qty'])

const getCategoryColor = (cat) => {
  const colorPalette = [
    'bg-orange-100 text-orange-700', 'bg-blue-100 text-blue-700',
    'bg-teal-100 text-teal-700', 'bg-purple-100 text-purple-700',
    'bg-pink-100 text-pink-700', 'bg-indigo-100 text-indigo-700',
    'bg-rose-100 text-rose-700', 'bg-amber-100 text-amber-700'
  ]
  const index = props.categories.indexOf(cat)
  return index >= 0 ? colorPalette[index % colorPalette.length] : 'bg-gray-100 text-gray-700'
}
</script>

<template>
  <div class="bg-white p-6 rounded-2xl shadow-sm border-t-4 border-emerald-500 flex flex-col">
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-semibold text-slate-700">Stok Semasa ({{ items.length }})</h2>
    </div>
    
    <!-- Filter Tabs + Tambah Kategori -->
    <div class="flex items-center overflow-x-auto pb-2 mb-4 hide-scrollbar gap-2">
      <button 
        @click="$emit('change-tab', 'Semua')"
        :class="activeTab === 'Semua' ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
        class="whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-bold transition-colors cursor-pointer"
      >
        Semua
      </button>
      
      <div 
        v-for="cat in categories" :key="cat"
        class="flex items-center rounded-full transition-colors"
        :class="activeTab === cat ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
      >
        <button @click="$emit('change-tab', cat)" class="whitespace-nowrap pl-4 pr-2 py-1.5 text-sm font-bold cursor-pointer">
          {{ cat }}
        </button>
        <button 
          @click.stop="$emit('delete-cat', cat)" 
          class="pr-3 pl-1 text-lg leading-none hover:text-red-500 opacity-60 hover:opacity-100 transition-opacity cursor-pointer" 
          title="Padam Kategori"
        >
          ×
        </button>
      </div>

      <button 
        @click="$emit('open-cat-modal')"
        class="whitespace-nowrap px-3 py-1.5 rounded-full text-sm font-bold bg-blue-100 text-blue-600 hover:bg-blue-200 border border-dashed border-blue-400 transition-colors flex items-center gap-1 cursor-pointer"
      >
        <span>+</span> Kategori
      </button>
    </div>

    <!-- Senarai Item -->
    <div v-if="items.length === 0" class="text-center py-10 text-slate-400 flex-grow">
      <p>Tiada stok dalam senarai ini.</p>
    </div>

    <div v-else class="space-y-3 overflow-y-auto max-h-[500px] pr-2">
      <div v-for="item in items" :key="item.id" 
           class="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-200 hover:shadow-sm transition-shadow">
        
        <div class="flex flex-col items-start gap-1">
          <span class="font-bold text-slate-700">{{ item.name }}</span>
          <button 
            @click="$emit('open-edit-modal', item)" 
            :class="getCategoryColor(item.category)" 
            class="text-[10px] uppercase font-bold px-2 py-0.5 rounded-md hover:opacity-75 transition-opacity flex items-center gap-1 cursor-pointer"
            title="Tukar Kategori"
          >
            {{ item.category }} <span>✎</span>
          </button>
        </div>
        
        <div class="flex items-center gap-3">
          <button @click="$emit('reduce-qty', item)" class="bg-red-100 text-red-600 w-8 h-8 rounded-lg hover:bg-red-200 font-bold flex items-center justify-center transition-colors cursor-pointer">-</button>
          <span class="w-6 text-center font-bold text-slate-800">{{ item.qty }}</span>
          <button @click="$emit('add-qty', item)" class="bg-emerald-100 text-emerald-700 w-8 h-8 rounded-lg hover:bg-emerald-200 font-bold flex items-center justify-center transition-colors cursor-pointer">+</button>
        </div>
      </div>
    </div>
  </div>
</template>