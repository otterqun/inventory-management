<script setup>
defineProps({
  showCategoryModal: Boolean,
  newCategoryName: String,
  showEditModal: Boolean,
  editingItem: Object,
  editCategorySelection: String,
  showItemModal: Boolean,
  pendingBarcode: String,
  newItemName: String,
  newItemCategory: String,
  categories: Array
})

defineEmits([
  'update:newCategoryName',
  'update:editCategorySelection',
  'update:newItemName',
  'update:newItemCategory',
  'close-category-modal',
  'save-category',
  'close-edit-modal',
  'save-edit-category',
  'close-item-modal',
  'save-item',
  'open-category-modal'
])
</script>

<template>
  <!-- Modal 1: Cipta Kategori Baru -->
  <div v-if="showCategoryModal" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
    <div class="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
      <h3 class="text-lg font-bold text-slate-800 mb-4">Cipta Kategori Baru</h3>
      <input 
        :value="newCategoryName" 
        @input="$emit('update:newCategoryName', $event.target.value)"
        type="text" 
        placeholder="Cth: Peti Ais, Rempah"
        class="w-full border-2 border-slate-200 rounded-xl p-3 mb-6 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        @keyup.enter="$emit('save-category')"
        autofocus
      >
      <div class="flex gap-3 justify-end">
        <button @click="$emit('close-category-modal')" class="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold">Batal</button>
        <button @click="$emit('save-category')" class="px-4 py-2 text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl font-bold">Tambah</button>
      </div>
    </div>
  </div>

  <!-- Modal 2: Edit Kategori Barang -->
  <div v-if="showEditModal" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
      <h3 class="text-lg font-bold text-slate-800 mb-2">Tukar Kategori</h3>
      <p class="text-sm text-slate-500 mb-4">Barang: <span class="font-bold text-slate-700">{{ editingItem?.name }}</span></p>
      
      <div class="flex flex-wrap gap-2 mb-6">
        <button 
          v-for="cat in categories" :key="cat"
          @click="$emit('update:editCategorySelection', cat)"
          :class="editCategorySelection === cat ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'"
          class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
        >
          {{ cat }}
        </button>
      </div>

      <div class="flex gap-3 justify-end">
        <button @click="$emit('close-edit-modal')" class="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold">Batal</button>
        <button @click="$emit('save-edit-category')" class="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-xl font-bold">Simpan</button>
      </div>
    </div>
  </div>

  <!-- Modal 3: Daftar Barang Baru -->
  <div v-if="showItemModal" class="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div class="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
      <h3 class="text-xl font-bold text-slate-800 mb-2">Tambah Barang Baru</h3>
      <p class="text-sm text-slate-500 mb-4">Barcode: <span class="font-mono bg-slate-100 px-2 py-1 rounded text-blue-600">{{ pendingBarcode }}</span></p>

      <input 
        :value="newItemName"
        @input="$emit('update:newItemName', $event.target.value)"
        type="text" 
        placeholder="Nama barang (Cth: Susu Pekat)"
        class="w-full border-2 border-slate-200 rounded-xl p-3 mb-4 focus:outline-none focus:border-blue-500"
        @keyup.enter="$emit('save-item')"
      >

      <div class="mb-6">
        <div class="flex justify-between items-center mb-2">
          <p class="text-sm font-semibold text-slate-600">Pilih Kategori:</p>
          <button @click="$emit('open-category-modal')" class="text-xs font-bold text-blue-600 hover:text-blue-800">+ Kategori Baru</button>
        </div>
        <div class="flex flex-wrap gap-2">
          <button 
            v-for="cat in categories" :key="cat"
            @click="$emit('update:newItemCategory', cat)"
            :class="newItemCategory === cat ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
            class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors"
          >
            {{ cat }}
          </button>
        </div>
      </div>

      <div class="flex gap-3 justify-end">
        <button @click="$emit('close-item-modal')" class="px-5 py-2.5 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold">Batal</button>
        <button @click="$emit('save-item')" class="px-5 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-xl font-bold shadow-md">Simpan</button>
      </div>
    </div>
  </div>
</template>