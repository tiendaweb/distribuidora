/* ============================================================
   PRODUCT ITEM VIEWS (STORE + POS)
   ============================================================ */

function renderStoreProductCard(product, options = {}) {
  const {
    index = 0,
    activeIndex = -1,
    quantity = 1,
    onOpen = 'openStoreProduct',
    onQtyChange = 'changeStoreQty',
    onAdd = 'addToCart'
  } = options;

  const discount = product.badge ? calculateDiscount(product.price, product.sale) : 0;
  const outOfStock = Number(product.stock || 0) <= 0;
  const isActive = index === activeIndex;

  return `
    <article
      class="product-card product-card--store ${outOfStock ? 'disabled' : ''} ${isActive ? 'search-active' : ''}"
      onclick="${outOfStock ? '' : `${onOpen}('${product.id}')`}"
    >
      <div class="product-card-media">
        <img
          src="${product.img}"
          alt="${escapeHtml(product.name)}"
          class="product-card-img"
          loading="lazy"
          onerror="this.src='https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=70'"
        />
        ${product.badge ? `<span class="badge-oferta product-card-badge">${discount}% OFF</span>` : ''}
        ${outOfStock ? '<div class="product-card-out">Sin stock</div>' : ''}
      </div>

      <div class="product-card-body">
        <h3 class="product-card-name">${escapeHtml(product.name)}</h3>
        <p class="product-card-short">${escapeHtml(product.short)}</p>

        <div class="product-card-footer">
          ${product.price !== product.sale ? `<div class="price-regular">${fmt(product.price)}</div>` : ''}
          <div class="price-sale">${fmt(product.sale)}</div>

          ${outOfStock ? '' : `
            <div class="store-qty-row">
              <button class="qty-btn" onclick="event.stopPropagation(); ${onQtyChange}('${product.id}', -1)">−</button>
              <input
                type="number"
                id="qty-${product.id}"
                value="${quantity}"
                min="1"
                max="${product.stock}"
                class="qty-input"
                readonly
              />
              <button class="qty-btn" onclick="event.stopPropagation(); ${onQtyChange}('${product.id}', 1)">+</button>
            </div>
            <button
              onclick="event.stopPropagation(); ${onAdd}('${product.id}')"
              class="btn btn-primary store-add-btn"
            >
              Agregar
            </button>
          `}
        </div>
      </div>
    </article>`;
}

function renderPosProductCard(product, options = {}) {
  const { index = 0, activeIndex = -1, onAdd = 'addToAdminCart' } = options;
  const outOfStock = Number(product.stock || 0) <= 0;
  const isActive = index === activeIndex;

  return `
    <article
      class="admin-pos-product-card ${isActive ? 'search-active' : ''} ${outOfStock ? 'disabled' : ''}"
      onclick="${outOfStock ? '' : `${onAdd}('${product.id}', { focusQtyInput: true })`}"
    >
      <img
        class="admin-pos-product-thumb"
        src="${escapeHtml(product.img || '')}"
        alt="${escapeHtml(product.name)}"
        loading="lazy"
        onerror="this.src='https://images.unsplash.com/photo-1488477181946-6428a0291777?w=200&q=80'; this.onerror=null;"
      >
      <div class="admin-pos-product-info">
        <p class="admin-pos-product-name">${escapeHtml(product.name)}</p>
        <p class="admin-pos-product-meta">SKU: ${escapeHtml(product.sku || '') || '—'}</p>
        <p class="admin-pos-product-meta">Stock: ${product.stock}</p>
      </div>
      <div class="admin-pos-product-price-row">
        <span class="admin-pos-product-price">${fmt(product.sale)}</span>
      </div>
    </article>
  `;
}
