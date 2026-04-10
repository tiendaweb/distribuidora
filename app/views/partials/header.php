<header class="bg-gradient-to-r from-amber-50 via-yellow-50 to-white sticky top-0 z-40 shadow-md border-b border-amber-200">
  <div class="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
    <a class="flex items-center gap-2 shrink-0 cursor-pointer" href="/">
      <div class="bg-brand rounded-lg w-9 h-9 flex items-center justify-center">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 3h18l-2 13H5L3 3z" stroke="#1A1A1A" stroke-width="2" stroke-linejoin="round"/><circle cx="9" cy="21" r="1.5" fill="#1A1A1A"/><circle cx="16" cy="21" r="1.5" fill="#1A1A1A"/></svg>
      </div>
      <div class="hidden sm:block">
        <div class="logo-text text-brand text-xl leading-none">La Distribuidora</div>
        <div class="text-amber-700/70 text-[10px] leading-none font-body">Mayorista de Alimentos</div>
      </div>
    </a>

    <div class="flex items-center gap-2 shrink-0">
      <?php if (!empty($isAuthenticated)): ?>
      <a href="/admin" id="btn-admin" class="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 text-xs sm:text-sm font-bold px-3 py-2 rounded-lg transition-all shadow-sm hover:shadow-md">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82L4.21 7.2a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h0a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51h0a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v0a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        <span class="hidden sm:inline">Administración</span>
      </a>
      <a href="/logout" class="bg-gray-800 hover:bg-gray-900 text-white text-xs sm:text-sm font-bold px-3 py-2 rounded-lg">Salir</a>
      <?php endif; ?>

      <button onclick="toggleCart()" id="btn-cart-header" class="relative bg-brand hover:bg-brand-dark text-ink font-bold px-4 py-2 rounded-lg flex items-center gap-2 text-sm transition-colors <?= $isAdminRoute ? 'hidden' : '' ?>">
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M3 3h18l-2 13H5L3 3z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="9" cy="21" r="1.5" fill="currentColor"/><circle cx="16" cy="21" r="1.5" fill="currentColor"/></svg>
        <span class="hidden sm:inline">Mi Pedido</span>
        <span id="cart-badge" class="cart-badge hidden">0</span>
      </button>
    </div>
  </div>
</header>
