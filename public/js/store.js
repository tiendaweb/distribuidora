/* ============================================================
   STORE (TIENDA - LADO CLIENTE)
   ============================================================ */

// PRODUCT FILTERING & RENDERING
function getFilteredProducts() {
  let filtered = STATE.products;

  // Filter by category
  if (STATE.currentFilter !== 'all') {
    filtered = filtered.filter(p => p.cat === STATE.currentFilter);
  }

  // Filter by search
  if (STATE.currentSearch) {
    const q = STATE.currentSearch.toLowerCase();
    filtered = filtered.filter(p =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.short || '').toLowerCase().includes(q) ||
      (p.desc || '').toLowerCase().includes(q) ||
      (p.sku || '').toLowerCase().includes(q) ||
      (p.id || '').toLowerCase().includes(q)
    );
  }

  return filtered;
}

function renderProducts() {
  const grid = document.getElementById('products-grid');
  const noRes = document.getElementById('no-results');
  if (!grid) return;

  const filtered = getFilteredProducts();
  const lastIndex = filtered.length - 1;

  if (lastIndex < 0) {
    STATE.storeSearchActiveIndex = -1;
  } else if (STATE.storeSearchActiveIndex > lastIndex) {
    STATE.storeSearchActiveIndex = lastIndex;
  }

  if (!filtered.length) {
    grid.innerHTML = '';
    if (noRes) noRes.classList.remove('hidden');
    return;
  }

  if (noRes) noRes.classList.add('hidden');

  grid.innerHTML = filtered.map((p, index) => {
    const cartItem = STATE.cart.find(c => c.id === p.id);
    const qty = cartItem ? cartItem.qty : 1;

    return renderStoreProductCard(p, {
      index,
      activeIndex: STATE.storeSearchActiveIndex,
      quantity: qty
    });
  }).join('');
}

// CART MANAGEMENT
function addToCart(productId, qty = null) {
  const product = STATE.products.find(p => p.id === productId);
  if (!product || product.stock <= 0) return;

  if (!qty) {
    const input = document.getElementById('qty-' + productId);
    qty = input ? parseInt(input.value) || 1 : 1;
  }

  const existing = STATE.cart.find(c => c.id === productId);
  let finalQty = existing ? existing.qty + qty : qty;

  if (finalQty > product.stock) {
    finalQty = product.stock;
    showToast(`Solo quedan ${product.stock} unidades`, 'warning');
  }

  if (existing) {
    existing.qty = finalQty;
  } else {
    STATE.cart.push({
      id: productId,
      name: product.name,
      price: product.sale,
      qty: finalQty,
      img: product.img,
      stock: product.stock
    });
  }

  updateStoreCartUI();
  persistData();
  showToast('Agregado al carrito', 'success');
}

function removeFromCart(productId) {
  STATE.cart = STATE.cart.filter(c => c.id !== productId);
  updateStoreCartUI();
  persistData();
}

function updateCartQty(productId, delta) {
  const item = STATE.cart.find(c => c.id === productId);
  if (!item) return;

  let newQty = item.qty + delta;
  if (newQty > item.stock) {
    showToast('Stock máximo: ' + item.stock, 'warning');
    return;
  }

  if (newQty <= 0) {
    removeFromCart(productId);
  } else {
    item.qty = newQty;
    updateStoreCartUI();
  }

  persistData();
}

function updateStoreCartUI() {
  const badge = document.getElementById('cart-badge');
  const totalEl = document.getElementById('cart-total');
  const itemsContainer = document.getElementById('cart-items');

  if (!badge || !totalEl || !itemsContainer) return;

  const total = STATE.cart.reduce((s, c) => s + c.price * c.qty, 0);
  const count = STATE.cart.reduce((s, c) => s + c.qty, 0);

  badge.textContent = count;
  badge.classList.toggle('hidden', count === 0);
  totalEl.textContent = fmt(total);

  if (!STATE.cart.length) {
    itemsContainer.innerHTML = '<p style="color: #999; font-size: 13px; text-align: center; padding: 20px 0;">Tu carrito está vacío</p>';
    return;
  }

  itemsContainer.innerHTML = STATE.cart.map(c => `
    <div style="display: flex; align-items: center; gap: 12px; background: white; border: 1px solid #eee; border-radius: 10px; padding: 8px; margin-bottom: 8px;">
      <img src="${c.img}" alt="${c.name}" style="width: 56px; height: 56px; object-fit: cover; border-radius: 8px; background: #f5f5f5; flex-shrink: 0;"/>
      <div style="flex: 1; min-width: 0;">
        <p style="margin: 0; font-weight: bold; font-size: 12px; color: var(--color-ink); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(c.name)}</p>
        <p style="margin: 2px 0 0; font-size: 11px; color: #666;">${fmt(c.price)} × ${c.qty}</p>
        <p style="margin: 4px 0 0; font-size: 13px; font-weight: 800; color: var(--color-brand);">${fmt(c.price * c.qty)}</p>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; flex-shrink: 0;">
        <div style="display: flex; align-items: center; gap: 4px; background: #f5f5f5; border-radius: 4px; padding: 2px;">
          <button class="qty-btn" style="width: 24px; height: 24px; font-size: 13px; background: white; border: 1px solid #ddd;" onclick="updateCartQty('${c.id}', -1)">−</button>
          <span style="font-size: 11px; font-weight: bold; width: 16px; text-align: center;">${c.qty}</span>
          <button class="qty-btn" style="width: 24px; height: 24px; font-size: 13px; background: white; border: 1px solid #ddd;" onclick="updateCartQty('${c.id}', 1)">+</button>
        </div>
        <button onclick="removeFromCart('${c.id}')" style="color: #ef4444; background: none; border: none; font-size: 11px; font-weight: bold; cursor: pointer; padding: 0; text-transform: uppercase;">Quitar</button>
      </div>
    </div>`).join('');
}

function changeStoreQty(productId, delta) {
  const product = STATE.products.find(p => p.id === productId);
  const input = document.getElementById('qty-' + productId);
  if (!input || !product) return;

  let v = parseInt(input.value) + delta;
  if (v < 1) v = 1;
  if (v > product.stock) {
    v = product.stock;
    showToast('Stock máximo: ' + product.stock, 'warning');
  }
  input.value = v;
}

// PRODUCT MODAL
function openStoreProduct(productId) {
  const product = STATE.products.find(p => p.id === productId);
  if (!product) return;

  const modalImg = document.getElementById('modal-img');
  const modalName = document.getElementById('modal-name');
  const modalDesc = document.getElementById('modal-desc');
  const modalPriceSale = document.getElementById('modal-price-sale');
  const modalPriceRegular = document.getElementById('modal-price-regular');
  const modalBadge = document.getElementById('modal-badge');
  const modalQty = document.getElementById('modal-qty');
  const modalAddBtn = document.getElementById('modal-add-btn');

  if (modalImg) modalImg.src = product.img;
  if (modalName) modalName.textContent = escapeHtml(product.name);
  if (modalDesc) modalDesc.textContent = escapeHtml(product.short);
  if (modalPriceSale) modalPriceSale.textContent = fmt(product.sale);

  if (modalPriceRegular) {
    if (product.price !== product.sale) {
      modalPriceRegular.textContent = fmt(product.price);
      modalPriceRegular.classList.remove('hidden');
    } else {
      modalPriceRegular.classList.add('hidden');
    }
  }

  if (modalBadge) {
    if (product.badge) {
      modalBadge.textContent = calculateDiscount(product.price, product.sale) + '% OFF';
      modalBadge.classList.remove('hidden');
    } else {
      modalBadge.classList.add('hidden');
    }
  }

  if (modalQty) {
    modalQty.value = 1;
    modalQty.max = product.stock;
  }

  if (modalAddBtn) {
    modalAddBtn.onclick = () => {
      const qty = parseInt(modalQty?.value) || 1;
      addToCart(productId, qty);
      closeModal('product-modal');
    };
  }

  openModal('product-modal');
}

// CATEGORY & SEARCH
function filterByCategory(category, btnElement = null) {
  STATE.currentFilter = category;
  STATE.storeSearchActiveIndex = -1;
  if (btnElement) {
    document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
    btnElement.classList.add('active');
  }
  renderProducts();
}

function searchProducts(query) {
  STATE.currentSearch = query.trim();
  STATE.storeSearchActiveIndex = -1;
  switchTab('catalogo');
  renderProducts();
}

function handleStoreSearchKeydown(event) {
  const { key } = event;
  if (!['ArrowDown', 'ArrowUp', 'Enter'].includes(key)) return;

  const filtered = getFilteredProducts();
  if (!filtered.length) return;

  if (key === 'Enter') {
    if (STATE.storeSearchActiveIndex >= 0) {
      event.preventDefault();
      const selected = filtered[STATE.storeSearchActiveIndex];
      if (selected) {
        addToCart(selected.id);
      }
    }
    return;
  }

  event.preventDefault();
  const lastIndex = filtered.length - 1;
  if (key === 'ArrowDown') {
    STATE.storeSearchActiveIndex = Math.min(
      STATE.storeSearchActiveIndex + 1,
      lastIndex
    );
  } else {
    STATE.storeSearchActiveIndex = Math.max(
      STATE.storeSearchActiveIndex - 1,
      0
    );
  }

  renderProducts();
}

function setupStoreSearchInputListeners() {
  const searchInput = document.getElementById('search-input');
  if (!searchInput) return;
  searchInput.addEventListener('keydown', handleStoreSearchKeydown);
}

// SLIDER
function getActiveSlides() {
  const sourceSlides = Array.isArray(STATE.slides) && STATE.slides.length ? STATE.slides : DEFAULT_SLIDES;
  return sourceSlides
    .filter(slide => Number(slide.is_active ?? 1) === 1)
    .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
}

function renderSlider() {
  const track = document.getElementById('slider-track');
  const dots = document.getElementById('slider-dots');
  if (!track || !dots) return;

  const slides = getActiveSlides();
  const resolvedSlides = slides.length ? slides : DEFAULT_SLIDES;

  track.innerHTML = resolvedSlides.map((slide, index) => `
    <img src="${normalizeSlideImageUrl(slide.image_url)}" class="slide w-full" alt="${escapeHtml(slide.title || `Banner ${index + 1}`)}" />
  `).join('');

  dots.innerHTML = resolvedSlides.map((_, index) => `
    <div class="dot ${index === 0 ? 'active' : ''}" onclick="goToSlide(${index})"></div>
  `).join('');

  STATE.sliderIdx = 0;
  goToSlide(0);
}

function changeSlide(direction) {
  const totalSlides = Math.max(getActiveSlides().length, 1);
  STATE.sliderIdx = (STATE.sliderIdx + direction + totalSlides) % totalSlides;
  goToSlide(STATE.sliderIdx);
}

function goToSlide(index) {
  STATE.sliderIdx = index;
  const track = document.getElementById('slider-track');
  if (track) {
    track.style.transform = `translateX(-${index * 100}%)`;
  }
  document.querySelectorAll('.dot').forEach((d, i) => {
    d.classList.toggle('active', i === index);
  });
  resetSliderTimer();
}

function resetSliderTimer() {
  clearInterval(STATE.sliderTimer);
  if (Math.max(getActiveSlides().length, 1) <= 1) {
    return;
  }
  STATE.sliderTimer = setInterval(() => changeSlide(1), 4500);
}

// WEB ORDER
function submitWebOrder(sendViaWhatsApp = false) {
  if (!STATE.cart.length) {
    showToast('El carrito está vacío', 'error');
    return;
  }

  const isAuthenticated = document.body.dataset.authenticated === '1';
  let name, address;

  if (isAuthenticated) {
    // Get client from authenticated selector
    const clientSelect = document.getElementById('store-authenticated-client');
    const selectedClientId = clientSelect?.value;

    if (!selectedClientId) {
      showToast('Por favor selecciona un cliente', 'warning');
      return;
    }

    const client = STATE.clients?.find(c => c.id === selectedClientId);
    if (!client) {
      showToast('Error: cliente no encontrado', 'error');
      return;
    }

    name = client.name;
    address = client.address || '';
  } else {
    // Get client from regular inputs
    const nameInput = document.getElementById('store-client-name');
    const addressInput = document.getElementById('store-client-address');

    if (!nameInput || !addressInput) {
      showToast('Error: formulario no encontrado', 'error');
      return;
    }

    name = nameInput.value.trim();
    address = addressInput.value.trim();

    if (!name) {
      showToast('Por favor ingresa tu Nombre / Negocio', 'warning');
      return;
    }
  }

  const total = STATE.cart.reduce((s, c) => s + c.price * c.qty, 0);
  const date = formatDate(new Date());
  const time = formatTime(new Date());

  // Save to admin orders
  const newOrder = {
    id: generateId('ord'),
    date: `${date} ${time}`,
    client: name,
    address: address || '—',
    items: [...STATE.cart],
    total: total,
    source: 'web',
    status: 'pending'
  };

  STATE.adminOrders.unshift(newOrder);
  persistData();

  if (sendViaWhatsApp) {
    let msg = `🛒 *NUEVO PEDIDO*\n`;
    msg += `👤 Cliente: ${name}\n`;
    if (address) msg += `📍 Envío a: ${address}\n`;
    msg += `📅 ${date} ${time}\n\n`;

    STATE.cart.forEach(c => {
      msg += `• ${c.qty}x ${c.name} (${fmt(c.price)}) = *${fmt(c.price * c.qty)}*\n`;
    });
    msg += `\n💰 *TOTAL: ${fmt(total)}*\n`;

    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/5492262556648?text=${encoded}`, '_blank');
  }

  // Clear cart & form
  STATE.cart = [];

  if (!isAuthenticated) {
    const nameInput = document.getElementById('store-client-name');
    const addressInput = document.getElementById('store-client-address');
    if (nameInput) nameInput.value = '';
    if (addressInput) addressInput.value = '';
  } else {
    const clientSelect = document.getElementById('store-authenticated-client');
    if (clientSelect && STATE.clients?.length > 0) {
      clientSelect.value = STATE.clients[0].id;
    }
  }

  updateStoreCartUI();
  closeDrawer('cart-drawer');
  showToast('Pedido guardado con éxito', 'success');
}

// Legacy compatibility for inline handlers in index.html
function filterCat(category, btnElement = null) {
  filterByCategory(category, btnElement);
}

function slideChange(direction) {
  changeSlide(direction);
}

function enviarPedidoWeb(sendViaWhatsApp = false) {
  submitWebOrder(sendViaWhatsApp);
}

function changeModalQty(delta) {
  const input = document.getElementById('modal-qty');
  if (!input) return;

  let qty = parseInt(input.value, 10) || 1;
  const max = parseInt(input.max, 10) || Number.MAX_SAFE_INTEGER;
  qty += delta;

  if (qty < 1) qty = 1;
  if (qty > max) qty = max;
  input.value = qty;
}

// Initialize client selector if authenticated
function initializeAuthenticatedClientSelector() {
  const isAuthenticated = document.body.dataset.authenticated === '1';
  const clientSelect = document.getElementById('store-authenticated-client');

  if (!isAuthenticated || !clientSelect) return;

  // Check if clients are already loaded
  const checkAndLoad = setInterval(() => {
    if (STATE && STATE.clients && STATE.clients.length > 0) {
      clearInterval(checkAndLoad);
      populateClientSelector();
    }
  }, 100);

  // Timeout after 5 seconds
  setTimeout(() => clearInterval(checkAndLoad), 5000);
}

function populateClientSelector() {
  const clientSelect = document.getElementById('store-authenticated-client');
  if (!clientSelect || !STATE?.clients) return;

  clientSelect.innerHTML = '<option value="">Seleccionar cliente...</option>' +
    STATE.clients.map(c => `<option value="${escapeHtml(c.id)}">${escapeHtml(c.name)}</option>`).join('');

  // Auto-select first client (usually "Consumidor Final")
  if (STATE.clients.length > 0) {
    clientSelect.value = STATE.clients[0].id;
  }

  clientSelect.addEventListener('change', (e) => {
    STATE.storeSelectedClient = e.target.value;
  });
}

document.addEventListener('DOMContentLoaded', initializeAuthenticatedClientSelector);
