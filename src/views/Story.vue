<script setup>
</script>

<template>
  <main class="min-h-screen bg-[#fafafa] text-zinc-800 py-12 px-6 font-sans antialiased">
    <article class="max-w-2xl mx-auto space-y-12">
      
      <!-- Tajuk & Metadata Ringkas -->
      <header class="border-b border-zinc-200 pb-8 space-y-3">
        <p class="text-xs font-mono uppercase tracking-widest text-zinc-600">Dev Note</p>
        <h1 class="text-3xl font-semibold tracking-tight text-zinc-900">
          Nota Pembangunan: Kenapa Bina Sistem Ini?
        </h1>
        <p class="text-sm text-zinc-600 leading-relaxed">
          Penyelesaian mudah kepada masalah belian berulang dan pengurusan inventori peribadi.
        </p>
      </header>

      <!-- Bahagian 1 -->
      <section class="space-y-3">
        <h2 class="text-base font-semibold tracking-tight text-zinc-900">
          Masalah belian berulang
        </h2>
        <p class="text-sm leading-relaxed text-zinc-600">
          Masalah biasa di pasar raya adalah terlupa baki barangan di rumah. Selalunya kita terbeli barangan yang sama kerana menyangka stok sudah habis, sedangkan masih ada baki tersimpan di belakang almari. Catatan manual di atas kertas atau aplikasi nota telefon sering kali terbiar kerana renyah untuk dikemas kini satu demi satu.
        </p>
      </section>

      <!-- Bahagian 2 -->
      <section class="space-y-3">
        <h2 class="text-base font-semibold tracking-tight text-zinc-900">
          Kenapa guna imbasan kod bar?
        </h2>
        <p class="text-sm leading-relaxed text-zinc-600">
          Sistem ini dibina berasaskan pengimbas kod bar supaya proses merekod barangan tidak memerlukan input teks yang panjang. Hanya halakan kamera peranti pada kod bar sedia ada untuk menambah atau menyemak baki kuantiti secara terus.
        </p>
      </section>

      <!-- Bahagian 3 -->
      <section class="space-y-3">
        <h2 class="text-base font-semibold tracking-tight text-zinc-900">
          Arkitektur ringkas & storan lokal
        </h2>
        <p class="text-sm leading-relaxed text-zinc-600">
          Aplikasi ini sengaja tidak bergantung pada pelayan pangkalan data yang kompleks. Semua rekod disimpan secara terus di dalam storan lokal peranti (LocalStorage) untuk memastikan capaian pantas tanpa lengah masa dan privasi data terjamin, di samping pilihan sandaran melalui format CSV dan JSON.
        </p>
      </section>

      <!-- Bahagian Penutup -->
      <footer class="pt-8 border-t border-zinc-200 flex items-center justify-between text-xs text-zinc-600 font-mono">
        <span>Vue 3 · Tailwind CSS</span>
        <router-link to="/" class="text-zinc-900 underline underline-offset-4 hover:text-zinc-600 transition-colors">
          Kembali ke Dashboard →
        </router-link>
      </footer>

    </article>
  </main>
</template>