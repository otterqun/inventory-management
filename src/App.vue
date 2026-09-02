<script setup>
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex flex-col">
    <!-- Header akan sentiasa ada kat atas -->
    <Header />

    <!-- <router-view> ni ibarat 'tv screen'. Ia akan tukar-tukar siaran (page) 
         berdasarkan URL, tanpa kacau Header dan Footer -->
    <main class="flex-grow">
      <router-view />
    </main>

    <!-- Footer akan sentiasa ada kat bawah -->
    <Footer />
  </div>
</template>