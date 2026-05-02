/* ============================================================
   PRODUCT ITEM VIEWS — HTML con Tailwind, sin CSS custom
   ============================================================ */

/* ── TIENDA ─────────────────────────────────────────────── */
function renderStoreProductCard(product, options = {}) {
  const {
    index = 0,
    activeIndex = -1,
    quantity = 1,
    onOpen = 'openStoreProduct',
    onQtyChange = 'changeStoreQty',
    onAdd = 'addToCart'
  } = options;

  const discount    = product.badge ? calculateDiscount(product.price, product.sale) : 0;
  const outOfStock  = Number(product.stock || 0) <= 0;
  const isActive    = index === activeIndex;

  const articleCls = [
    'group flex flex-col bg-white rounded-2xl border overflow-hidden',
    'transition-all duration-200 select-none',
    outOfStock
      ? 'opacity-60 cursor-not-allowed border-gray-200 grayscale'
      : 'cursor-pointer border-gray-200 hover:-translate-y-1 hover:shadow-xl hover:border-blue-300',
    isActive ? 'ring-2 ring-blue-500 border-blue-400' : ''
  ].join(' ');

  const badge = product.badge
    ? `<span class="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow z-10">
         ${discount}% OFF
       </span>`
    : '';

  const stockOverlay = outOfStock
    ? `<div class="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
         <span class="text-xs font-bold text-gray-500 uppercase tracking-wide">Sin stock</span>
       </div>`
    : '';

  const priceRegular = product.price !== product.sale
    ? `<span class="text-xs text-gray-400 line-through">${fmt(product.price)}</span>`
    : '';

  const actions = outOfStock ? '' : `
    <div class="flex items-center gap-1 bg-gray-100 rounded-lg p-1" onclick="event.stopPropagation()">
      <button
        class="w-7 h-7 flex items-center justify-center rounded-md bg-white border border-gray-200 font-bold text-gray-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition text-base leading-none"
        onclick="${onQtyChange}('${product.id}', -1)">−</button>
      <input
        type="number" id="qty-${product.id}" value="${quantity}" readonly
        class="w-8 text-center text-sm font-semibold bg-transparent border-0 outline-none p-0 text-gray-700" />
      <button
        class="w-7 h-7 flex items-center justify-center rounded-md bg-white border border-gray-200 font-bold text-gray-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition text-base leading-none"
        onclick="${onQtyChange}('${product.id}', 1)">+</button>
    </div>
    <button
      onclick="event.stopPropagation(); ${onAdd}('${product.id}')"
      class="w-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-semibold py-2 rounded-lg transition-all duration-150 shadow-sm">
      Agregar al carrito
    </button>`;

  return `
    <article class="${articleCls}" onclick="${outOfStock ? '' : `${onOpen}('${product.id}')`}">
      <div class="relative aspect-square bg-gray-50 overflow-hidden flex-shrink-0">
        ${badge}
        ${stockOverlay}
        <img
          src="${product.img}"
          alt="${escapeHtml(product.name)}"
          loading="lazy"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onerror="this.src='https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=70'"
        />
      </div>
      <div class="flex flex-col flex-1 p-3 gap-2">
        <div class="flex-1">
          <h3 class="text-sm font-semibold text-gray-800 leading-tight line-clamp-2 mb-1">
            ${escapeHtml(product.name)}
          </h3>
          <p class="text-[11px] text-gray-400 line-clamp-2 leading-tight">
            ${escapeHtml(product.short || '')}
          </p>
        </div>
        <div class="flex flex-col gap-2 mt-auto">
          <div class="flex flex-col">
            ${priceRegular}
            <span class="text-lg font-bold text-blue-600 leading-tight">${fmt(product.sale)}</span>
          </div>
          ${actions}
        </div>
      </div>
    </article>`;
}

/* ── POS / FACTURACIÓN ──────────────────────────────────── */
function renderPosProductCard(product, options = {}) {
  const { index = 0, activeIndex = -1, onAdd = 'addToAdminCart' } = options;
  const outOfStock = Number(product.stock || 0) <= 0;
  const isActive   = index === activeIndex;
  const lowStock   = !outOfStock && product.stock <= 5;

  const articleCls = [
    'flex flex-col bg-white rounded-xl border overflow-hidden',
    'transition-all duration-150',
    outOfStock
      ? 'opacity-50 cursor-not-allowed border-gray-200 grayscale'
      : 'cursor-pointer border-gray-200 hover:border-blue-400 hover:-translate-y-0.5 hover:shadow-md',
    isActive ? 'border-blue-500 ring-2 ring-blue-200' : ''
  ].join(' ');

  const stockTag = outOfStock
    ? `<span class="absolute top-1 left-1 bg-gray-700 text-white text-[9px] font-bold px-1.5 py-0.5 rounded z-10">Sin stock</span>`
    : lowStock
      ? `<span class="absolute top-1 left-1 bg-amber-400 text-amber-900 text-[9px] font-bold px-1.5 py-0.5 rounded z-10">Últ. ${product.stock}</span>`
      : '';

  const displayPrice = STATE.activePriceListId && typeof getPriceForList === 'function'
    ? getPriceForList(product, STATE.activePriceListId)
    : (typeof applyPriceListFactor === 'function' ? applyPriceListFactor(product.sale) : product.sale);

  return `
    <article
      class="${articleCls}"
      onclick="${outOfStock ? '' : `${onAdd}('${product.id}', { focusQtyInput: true })`}"
    >
      <div class="relative aspect-square bg-gray-100 overflow-hidden flex-shrink-0">
        ${stockTag}
        <img
          src="${escapeHtml(product.img || '')}"
          alt="${escapeHtml(product.name)}"
          class="w-full h-full object-cover"
          onerror="this.src='https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200&q=80'; this.onerror=null;"
        />
      </div>
      <div class="flex flex-col flex-1 p-2 gap-1">
        <p class="text-[11px] font-semibold text-gray-800 leading-tight line-clamp-2">${escapeHtml(product.name)}</p>
        <p class="text-[10px] text-gray-400">SKU: ${escapeHtml(product.sku || '—')}</p>
        <p class="text-[10px] ${lowStock ? 'text-amber-500 font-semibold' : 'text-gray-400'}">
          Stock: <strong>${product.stock}</strong>
        </p>
        <p class="text-sm font-bold text-blue-600 mt-auto pt-1 border-t border-gray-100">${fmt(displayPrice)}</p>
      </div>
    </article>`;
}
