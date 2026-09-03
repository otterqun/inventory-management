<script setup>
import { computed } from 'vue'

const props = defineProps({
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
  categories: Array,
  inventory: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits([
  'close-category-modal',
  'save-category',
  'update:newCategoryName',
  'close-edit-modal',
  'save-edit-category',
  'update:editCategorySelection',
  'update:editExpirySelection',
  'close-item-modal',
  'save-item',
  'increment-existing',
  'regenerate-barcode',
  'update:newItemName',
  'update:newItemCategory',
  'update:newItemExpiry',
  'open-category-modal'
])

// Semak sama ada pendingBarcode sudah wujud dalam senarai inventori
const duplicateItem = computed(() => {
  if (!props.pendingBarcode) return null
  return props.inventory.find(i => i.barcode.trim().toLowerCase() === props.pendingBarcode.trim().toLowerCase())
})
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

    <!-- Modal Daftar Item Baru Bersama Duplicate Warning -->
    <div v-if="showItemModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div class="bg-white rounded-2xl border border-zinc-200 shadow-xl max-w-sm w-full p-6 space-y-4">
        <div>
          <h3 class="text-sm font-semibold tracking-tight text-zinc-900">Daftar Item Baru</h3>
          <div class="flex items-center gap-2 mt-0.5">
            <span class="text-xs text-zinc-500 font-mono">Kod: {{ pendingBarcode }}</span>
            <button 
              v-if="pendingBarcode.startsWith('DIF-')"
              type="button"
              @click="$emit('regenerate-barcode')"
              title="Jana kod rawak lain"
              class="px-1.5 py-0.5 text-[10px] font-mono bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded border border-zinc-200 cursor-pointer transition-colors"
            >
              🔄 Jana Lain
            </button>
          </div>
        </div>

        <!-- Kad Amaran Kod Bar Pendua -->
        <div v-if="duplicateItem" class="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
          <div class="flex items-center gap-1.5 text-amber-800 text-xs font-semibold">
            <span>⚠️</span>
            <span>Kod bar sudah didaftarkan!</span>
          </div>
          <p class="text-[11px] text-amber-700">
            Kod ini milik <strong>{{ duplicateItem.name }}</strong> (Baki stok: {{ duplicateItem.qty }}).
          </p>
          <button 
            @click="$emit('increment-existing', duplicateItem)"
            class="w-full py-1.5 px-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-lg transition-colors cursor-pointer"
          >
            +1 Kuantiti "{{ duplicateItem.name }}" Sekarang
          </button>
        </div>

        <div class="space-y-3 text-xs" :class="{ 'opacity-50 pointer-events-none': duplicateItem }">
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
          <button 
            @click="$emit('save-item')" 
            :disabled="Boolean(duplicateItem)"
            class="px-3 py-1.5 bg-zinc-900 text-white rounded-lg hover:bg-zinc-800 font-sans font-medium transition-colors"
            :class="duplicateItem ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'"
          >
            Simpan Item
          </button>
        </div>
      </div>
    </div>
  </div>
</template>