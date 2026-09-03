<template>
  <header class="bg-white border-b border-zinc-200 sticky top-0 z-40 no-print">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex justify-between items-center">
      <router-link to="/" class="flex items-center gap-2.5 no-underline">
        <span class="w-2.5 h-2.5 rounded-full bg-zinc-900 inline-block"></span>
        <span class="text-sm font-semibold tracking-tight text-zinc-900">Inventory Keeper</span>
      </router-link>

      <nav class="flex items-center gap-1">
        <router-link 
          to="/" 
          class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          :class="$route.path === '/' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'"
        >
          Dashboard
        </router-link>
        <router-link 
          to="/katalog" 
          class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          :class="$route.path === '/katalog' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'"
        >
          Katalog A4
        </router-link>
        <router-link 
          to="/tetapan" 
          class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          :class="$route.path === '/tetapan' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'"
        >
          Tetapan
        </router-link>
        <router-link 
          to="/cerita" 
          class="px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          :class="$route.path === '/cerita' ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'"
        >
          Nota Dev
        </router-link>
      </nav>
    </div>
  </header>
</template>