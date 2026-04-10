/* ============================================================
   UTILITY FUNCTIONS
   ============================================================ */

// API Persistence
async function apiFetch(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });

  if (!response.ok) {
    throw new Error(`API ${response.status}: ${url}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function loadPersistedData() {
  const clone = (value) => JSON.parse(JSON.stringify(value));

  const normalizeProduct = (product = {}) => {
    const normalized = { ...product };
    if (!Object.prototype.hasOwnProperty.call(normalized, 'sku')) {
      normalized.sku = typeof normalized.id === 'string' && normalized.id
        ? `SKU-${normalized.id}`
        : '';
    }
    return normalized;
  };

  const normalizeClient = (client = {}) => {
    const normalized = { ...client };
    if (!Object.prototype.hasOwnProperty.call(normalized, 'client_code')) {
      normalized.client_code = normalized.codigo || '';
    }
    return normalized;
  };

  const resolveDefaults = async () => {
    try {
      const defaults = await apiFetch('/api/defaults');
      return {
        products: Array.isArray(defaults?.products) ? defaults.products : clone(DEFAULT_PRODUCTS),
        clients: Array.isArray(defaults?.clients) ? defaults.clients : clone(DEFAULT_CLIENTS),
        slides: Array.isArray(defaults?.slides) ? defaults.slides : clone(DEFAULT_SLIDES)
      };
    } catch (err) {
      console.warn('Error loading backend defaults:', err);
      return {
        products: clone(DEFAULT_PRODUCTS),
        clients: clone(DEFAULT_CLIENTS),
        slides: clone(DEFAULT_SLIDES)
      };
    }
  };

  try {
    const defaults = await resolveDefaults();
    const state = await apiFetch('/api/bootstrap');

    STATE.products = Array.isArray(state?.products) && state.products.length
      ? state.products.map(normalizeProduct)
      : defaults.products.map(normalizeProduct);

    STATE.clients = Array.isArray(state?.clients) && state.clients.length
      ? state.clients.map(normalizeClient)
      : defaults.clients.map(normalizeClient);

    STATE.adminOrders = Array.isArray(state?.orders) ? state.orders : [];
    STATE.adminInvoices = Array.isArray(state?.invoices) ? state.invoices : [];
    STATE.slides = Array.isArray(state?.slides) && state.slides.length
      ? state.slides
      : defaults.slides;
  } catch (err) {
    console.warn('Error loading persisted data:', err);
    const defaults = await resolveDefaults();
    STATE.products = defaults.products.map(normalizeProduct);
    STATE.clients = defaults.clients.map(normalizeClient);
    STATE.adminOrders = [];
    STATE.adminInvoices = [];
    STATE.slides = defaults.slides;
  }
}

async function persistData() {
  try {
    await apiFetch('/api/state', {
      method: 'PUT',
      body: JSON.stringify({
        products: STATE.products,
        clients: STATE.clients,
        orders: STATE.adminOrders,
        invoices: STATE.adminInvoices,
        slides: STATE.slides || []
      })
    });
  } catch (err) {
    console.warn('Error persisting data:', err);
  }
}

async function saveProductApi(product) {
  return apiFetch(`/api/products/${encodeURIComponent(product.id)}`, { method: 'PUT', body: JSON.stringify(product) });
}

async function saveClientApi(client) {
  return apiFetch(`/api/clients/${encodeURIComponent(client.id)}`, { method: 'PUT', body: JSON.stringify(client) });
}

async function saveOrderApi(order) {
  return apiFetch(`/api/orders/${encodeURIComponent(order.id)}`, { method: 'PUT', body: JSON.stringify(order) });
}

async function saveInvoiceApi(invoice) {
  return apiFetch(`/api/invoices/${encodeURIComponent(invoice.id)}`, { method: 'PUT', body: JSON.stringify(invoice) });
}

async function saveSlideApi(slide) {
  return apiFetch(`/api/slides/${encodeURIComponent(slide.id)}`, { method: 'PUT', body: JSON.stringify(slide) });
}

function normalizeSlideImageUrl(url) {
  const rawUrl = (url || '').trim();
  if (!rawUrl) return '';
  return rawUrl.replace('/storage/images/', '/storage/store/images/');
}


// Validation
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePhone(phone) {
  // Simple Argentine phone validation
  const re = /^[0-9\-\+\s\(\)]{7,20}$/;
  return re.test(phone);
}

function validateCUIT(cuit) {
  // CUIT format: XX-XXXXXXXX-X
  const re = /^\d{2}-\d{8}-\d$/;
  return re.test(cuit);
}

function validateDNI(dni) {
  // DNI format: XX.XXX.XXX or XXXXXXXX
  const re = /^(\d{1,2}\.\d{3}\.\d{3}|\d{7,8})$/;
  return re.test(dni);
}

function validateURL(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Date/Time Formatting
function formatDate(date) {
  if (typeof date === 'string') date = new Date(date);
  return date.toLocaleDateString(CONFIG.LOCALE);
}

function formatTime(date) {
  if (typeof date === 'string') date = new Date(date);
  return date.toLocaleTimeString(CONFIG.LOCALE, { hour: '2-digit', minute: '2-digit' });
}

function formatDateTime(date) {
  if (typeof date === 'string') date = new Date(date);
  return date.toLocaleString(CONFIG.LOCALE);
}

function getCurrentDate() {
  return new Date().toLocaleDateString(CONFIG.LOCALE);
}

function getCurrentTime() {
  return new Date().toLocaleTimeString(CONFIG.LOCALE, { hour: '2-digit', minute: '2-digit' });
}

function getCurrentDateTime() {
  return new Date().toLocaleString(CONFIG.LOCALE);
}

// String utilities
function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function truncate(str, length) {
  if (str.length <= length) return str;
  return str.substring(0, length) + '...';
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function normalizeText(text) {
  // Remove diacritics and convert to lowercase for accent-insensitive search
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // Remove diacritical marks
    .toLowerCase();
}

// Number utilities
function roundPrice(price) {
  return Number((Number(price) || 0).toFixed(2));
}

function formatPercentage(value) {
  return value.toFixed(2) + '%';
}

function calculateMargin(cost, salePrice) {
  if (cost === 0) return 0;
  return ((salePrice - cost) / cost) * 100;
}

function calculateSalePrice(cost, marginPercent) {
  return roundPrice((Number(cost) || 0) * (1 + (Number(marginPercent) || 0) / 100));
}

function calculateDiscount(originalPrice, salePrice) {
  if (originalPrice === 0) return 0;
  return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
}

// Array utilities
function sortBy(array, key, order = 'asc') {
  const sorted = [...array];
  sorted.sort((a, b) => {
    if (a[key] < b[key]) return order === 'asc' ? -1 : 1;
    if (a[key] > b[key]) return order === 'asc' ? 1 : -1;
    return 0;
  });
  return sorted;
}

function filterByCategory(items, category) {
  if (category === 'all') return items;
  return items.filter(item => item.cat === category);
}

function searchItems(items, query, searchFields) {
  if (!query) return items;
  const q = query.toLowerCase();
  return items.filter(item =>
    searchFields.some(field => {
      const value = item[field];
      return value && value.toString().toLowerCase().includes(q);
    })
  );
}

function groupBy(array, key) {
  return array.reduce((result, item) => {
    const group = item[key];
    if (!result[group]) result[group] = [];
    result[group].push(item);
    return result;
  }, {});
}

function sumBy(array, key) {
  return array.reduce((sum, item) => sum + (item[key] || 0), 0);
}

function unique(array, key) {
  const seen = new Set();
  return array.filter(item => {
    const value = key ? item[key] : item;
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

// Random/UUID
function generateId(prefix = 'id') {
  return prefix + '-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Clipboard
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).catch(err => {
    console.error('Error copying to clipboard:', err);
  });
}

// Debounce & Throttle
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// Geolocation
async function geocodeAddress(address) {
  try {
    const normalizedAddress = (address || '').trim();
    if (!normalizedAddress) return null;

    const hasCityContext = /necochea|buenos aires|argentina/i.test(normalizedAddress);
    const fullAddress = hasCityContext
      ? normalizedAddress
      : `${normalizedAddress}, Necochea, Buenos Aires, Argentina`;
    const query = encodeURIComponent(fullAddress);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`
    );
    const data = await response.json();
    if (data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        displayName: data[0].display_name
      };
    }
    return null;
  } catch (err) {
    console.error('Geocoding error:', err);
    return null;
  }
}

// Deep cloning
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}
