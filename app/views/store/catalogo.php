<div id="view-store" class="flex-1">
  <div id="tab-catalogo" class="tab-section">

    <!-- SLIDER -->
    <section class="px-4 py-4 lg:py-5">
      <div class="relative max-w-2xl mx-auto">
        <div id="slider-container" class="relative overflow-hidden rounded-2xl aspect-video bg-gray-900 shadow-xl">
          <div id="slider-track" class="flex h-full"></div>
          <button onclick="slideChange(-1)"
            class="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-white w-9 h-9 rounded-full flex items-center justify-center text-xl leading-none transition-colors">‹</button>
          <button onclick="slideChange(1)"
            class="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-black/40 hover:bg-black/60 text-white w-9 h-9 rounded-full flex items-center justify-center text-xl leading-none transition-colors">›</button>
        </div>
        <div id="slider-dots" class="flex justify-center gap-2 mt-3"></div>
      </div>
    </section>

    <!-- CATEGORY PILLS -->
    <section class="bg-white border-b border-gray-100 py-3 px-4 sticky top-[108px] z-30 shadow-sm">
      <div class="max-w-7xl mx-auto flex gap-2 overflow-x-auto no-scrollbar" id="cat-pills">
        <button class="cat-btn active text-sm px-4 py-1.5 rounded-full border border-gray-200" data-category="all">Todos</button>
        <button class="cat-btn text-sm px-4 py-1.5 rounded-full border border-gray-200" data-category="helados">Helados</button>
        <button class="cat-btn text-sm px-4 py-1.5 rounded-full border border-gray-200" data-category="pastas">Pastas Frescas</button>
        <button class="cat-btn text-sm px-4 py-1.5 rounded-full border border-gray-200" data-category="congelados">Congelados</button>
      </div>
    </section>

    <!-- SEARCH -->
    <section class="bg-white border-b border-gray-100 py-4 px-4">
      <div class="max-w-7xl mx-auto">
        <div class="relative">
          <input id="search-input" type="text" placeholder="🔍 Buscar por nombre o código..."
            class="w-full pl-10 pr-4 py-2.5 rounded-lg bg-gray-50" />
        </div>
      </div>
    </section>

    <!-- PRODUCT GRID: 2 cols mobile · 4 cols desktop -->
    <main class="max-w-7xl mx-auto">
      <div id="no-results" class="hidden text-center py-16 text-gray-400">
        <p class="font-semibold">No se encontraron productos</p>
      </div>
      <div id="products-grid"
        class="grid grid-cols-2 lg:grid-cols-4 gap-3 p-3 lg:gap-5 lg:p-5"></div>
    </main>

  </div>
</div>
