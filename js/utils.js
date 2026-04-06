/* ============================================================
   UTILITY FUNCTIONS
   ============================================================ */

// LocalStorage
function loadPersistedData() {
  try {
    const savedProducts = JSON.parse(localStorage.getItem(CONFIG.DB_KEYS.products) || 'null');
    const savedClients = JSON.parse(localStorage.getItem(CONFIG.DB_KEYS.clients) || 'null');
    const savedOrders = JSON.parse(localStorage.getItem(CONFIG.DB_KEYS.webOrders) || 'null');
    const savedInvoices = JSON.parse(localStorage.getItem(CONFIG.DB_KEYS.invoices) || 'null');

    if (Array.isArray(savedProducts) && savedProducts.length) {
      STATE.products = savedProducts;
    } else {
      STATE.products = JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
    }

    if (Array.isArray(savedClients) && savedClients.length) {
      STATE.clients = savedClients;
    } else {
      STATE.clients = JSON.parse(JSON.stringify(DEFAULT_CLIENTS));
    }

    if (Array.isArray(savedOrders)) {
      STATE.adminOrders = savedOrders;
    } else {
      STATE.adminOrders = [];
    }

    if (Array.isArray(savedInvoices)) {
      STATE.adminInvoices = savedInvoices;
    } else {
      STATE.adminInvoices = [];
    }
  } catch (err) {
    console.warn('Error loading persisted data:', err);
    STATE.products = JSON.parse(JSON.stringify(DEFAULT_PRODUCTS));
    STATE.clients = JSON.parse(JSON.stringify(DEFAULT_CLIENTS));
    STATE.adminOrders = [];
    STATE.adminInvoices = [];
  }
}

function persistData() {
  try {
    localStorage.setItem(CONFIG.DB_KEYS.products, JSON.stringify(STATE.products));
    localStorage.setItem(CONFIG.DB_KEYS.clients, JSON.stringify(STATE.clients));
    localStorage.setItem(CONFIG.DB_KEYS.webOrders, JSON.stringify(STATE.adminOrders));
    localStorage.setItem(CONFIG.DB_KEYS.invoices, JSON.stringify(STATE.adminInvoices));
  } catch (err) {
    console.warn('Error persisting data:', err);
  }
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

// Number utilities
function roundPrice(price) {
  return Math.round(price);
}

function formatPercentage(value) {
  return value.toFixed(2) + '%';
}

function calculateMargin(cost, salePrice) {
  if (cost === 0) return 0;
  return ((salePrice - cost) / cost) * 100;
}

function calculateSalePrice(cost, marginPercent) {
  return Math.round(cost * (1 + marginPercent / 100));
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
    const query = encodeURIComponent(address + ', Necochea, Buenos Aires, Argentina');
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

// ============================================================
// TOUCH & MOBILE UTILITIES
// ============================================================

function isTouchDevice() {
  return (
    window.matchMedia("(hover: none)").matches ||
    (typeof window.ontouchstart !== "undefined")
  );
}

function isLandscapeMode() {
  return window.innerHeight < window.innerWidth;
}

function getViewportSize() {
  return {
    width: Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
    height: Math.max(document.documentElement.clientHeight, window.innerHeight || 0),
    isMobile: window.innerWidth < 640,
    isTablet: window.innerWidth >= 640 && window.innerWidth < 1024,
    isDesktop: window.innerWidth >= 1024
  };
}
