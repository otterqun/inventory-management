<template>
  <header class="bg-white shadow-sm p-4 mb-6">
    <div class="max-w-7xl mx-auto flex justify-between items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-800">🛒 Inventory Keeper</h1>
        <p class="text-sm text-gray-500">Sistem Pemantauan Stok Rumah</p>
      </div>
      <!-- Link navigasi ke page lain -->
      <nav class="flex gap-4">
        <router-link to="/" class="text-blue-600 font-semibold hover:underline">Utama</router-link>
        <router-link to="/page-baru" class="text-blue-600 font-semibold hover:underline">Page Baru</router-link>
      </nav>
    </div>
  </header>
</template>