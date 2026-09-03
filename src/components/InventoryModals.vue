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
  newItemExpiry: String,
  editExpirySelection: String,
  categories: Array
})

defineEmits([
  'close-category-modal',
  'save-category',
  'update:newCategoryName',
  'close-edit-modal',
  'save-edit-category',
  'update:editCategorySelection',
  'update:editExpirySelection',
  'close-item-modal',
  'save-item',
  'update:newItemName',
  'update:newItemCategory',
  'update:newItemExpiry',
  'open-category-modal'
])
</script>

<template>
  <div>
    <!-- Modal Tambah Kategori -->
    <div v-if="showCategoryModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div class="bg-white rounded-2xl border border-zinc-200 shadow-xl max-w-sm w-full p-6 space-y-4">
        <div>
          <h3 class="text-sm font-semibold tracking-tight text-zinc-900">Tambah Kategori Baru</h3>
          <p class="text-xs text-zinc-500">Cipta kategori untuk mengasingkan inventori.</p>
        </div>
        
        <input 
          :value="newCategoryName" 
          @input="$emit('update:newCategoryName', $event.target.value)"
          @keyup.enter="$emit('save-category')"
          type="text" 
          placeholder="Nama kategori..." 
          class="w-full px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:border-zinc-400 text-zinc-800"
          autofocus
        />

        <div class="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 font-mono text-xs">
          <button @click="$emit('close-category-modal')" class="px-3 py-1.5 text-zinc-600 hover:text-zinc-900 cursor-pointer">Batal</button>
          <button @click="$emit('save-category')" class="px-3 py-1.5 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 cursor-pointer font-sans font-medium">Simpan</button>
        </div>
      </div>
    </div>

    <!-- Modal Sunting Item -->
    <div v-if="showEditModal && editingItem" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div class="bg-white rounded-2xl border border-zinc-200 shadow-xl max-w-sm w-full p-6 space-y-4">
        <div>
          <h3 class="text-sm font-semibold tracking-tight text-zinc-900">Kemaskini: {{ editingItem.name }}</h3>
          <p class="text-xs text-zinc-500 font-mono">{{ editingItem.barcode }}</p>
        </div>

        <div class="space-y-3 text-xs">
          <div>
            <label class="block text-zinc-600 font-mono mb-1">Kategori</label>
            <select 
              :value="editCategorySelection" 
              @change="$emit('update:editCategorySelection', $event.target.value)"
              class="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:border-zinc-400 text-zinc-800 cursor-pointer"
            >
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>

          <div>
            <label class="block text-zinc-600 font-mono mb-1">Tarikh Luput (Pilihan)</label>
            <input 
              :value="editExpirySelection"
              @input="$emit('update:editExpirySelection', $event.target.value)"
              type="date" 
              class="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:border-zinc-400 text-zinc-800 font-mono cursor-pointer"
            />
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 font-mono text-xs">
          <button @click="$emit('close-edit-modal')" class="px-3 py-1.5 text-zinc-600 hover:text-zinc-900 cursor-pointer">Batal</button>
          <button @click="$emit('save-edit-category')" class="px-3 py-1.5 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 cursor-pointer font-sans font-medium">Kemas Kini</button>
        </div>
      </div>
    </div>

    <!-- Modal Daftar Item Baru -->
    <div v-if="showItemModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div class="bg-white rounded-2xl border border-zinc-200 shadow-xl max-w-sm w-full p-6 space-y-4">
        <div>
          <h3 class="text-sm font-semibold tracking-tight text-zinc-900">Daftar Item Baru</h3>
          <p class="text-xs text-zinc-500 font-mono">Kod: {{ pendingBarcode }}</p>
        </div>

        <div class="space-y-3 text-xs">
          <div>
            <label class="block text-zinc-600 font-mono mb-1">Nama Item</label>
            <input 
              :value="newItemName" 
              @input="$emit('update:newItemName', $event.target.value)"
              type="text" 
              placeholder="Cth: Susu Segar 1L" 
              class="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:border-zinc-400 text-zinc-800"
              autofocus
            />
          </div>

          <div>
            <div class="flex justify-between items-center mb-1">
              <label class="text-zinc-600 font-mono">Kategori</label>
              <button @click="$emit('open-category-modal')" class="text-[10px] text-zinc-500 hover:text-zinc-900 underline cursor-pointer">+ Kategori Baru</button>
            </div>
            <select 
              :value="newItemCategory" 
              @change="$emit('update:newItemCategory', $event.target.value)"
              class="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:border-zinc-400 text-zinc-800 cursor-pointer"
            >
              <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
            </select>
          </div>

          <div>
            <label class="block text-zinc-600 font-mono mb-1">Tarikh Luput (Pilihan)</label>
            <input 
              :value="newItemExpiry" 
              @input="$emit('update:newItemExpiry', $event.target.value)"
              type="date" 
              class="w-full px-3 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:bg-white focus:outline-none focus:border-zinc-400 text-zinc-800 font-mono cursor-pointer"
            />
          </div>
        </div>

        <div class="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100 font-mono text-xs">
          <button @click="$emit('close-item-modal')" class="px-3 py-1.5 text-zinc-600 hover:text-zinc-900 cursor-pointer">Batal</button>
          <button @click="$emit('save-item')" class="px-3 py-1.5 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 cursor-pointer font-sans font-medium">Simpan Item</button>
        </div>
      </div>
    </div>
  </div>
</template>