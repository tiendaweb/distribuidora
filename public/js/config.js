/* ============================================================
   CONFIG & CONSTANTS
   ============================================================ */

const CONFIG = {
  APP_NAME: 'La Distribuidora',
  LOCATION: 'Necochea, Buenos Aires',
  BASE_IMG: 'https://aapp.space/storage/',

  // Database Keys
  DB_KEYS: {
    products: 'dist_products_v1',
    clients: 'dist_clients_v1',
    webOrders: 'dist_web_orders_v1',
    invoices: 'dist_invoices_v1'
  },

  // Format Functions
  formatPrice: (n) => '$' + Number(n || 0).toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
  unformatPrice: (s) => {
    if (typeof s === 'number') return s;
    const normalized = String(s || '').replace(/\./g, '').replace(',', '.').replace(/[^\d.-]/g, '');
    return Number(normalized) || 0;
  },

  // Locale
  LOCALE: 'es-AR',

  // Toast Config
  TOAST_TIMEOUT: 2500,

  // Map Config
  MAP: {
    DEFAULT_LAT: -38.3289,
    DEFAULT_LNG: -58.7367,
    DEFAULT_ZOOM: 13,
    LOCATION_NAME: 'Necochea, Buenos Aires, Argentina'
  },

  // Categories
  CATEGORIES: [
    { id: 'all', name: 'Todos' },
    { id: 'helados', name: 'Helados' },
    { id: 'pastas', name: 'Pastas Frescas' },
    { id: 'congelados', name: 'Congelados' }
  ],

  // Conditions (AFIP)
  TAX_CONDITIONS: [
    'Consumidor Final',
    'Responsable Inscripto',
    'Monotributista'
  ],

  // Document Types
  DOCUMENT_TYPES: [
    { id: 'blanco', name: 'Factura AFIP (Blanco)', label: 'Factura' },
    { id: 'negro', name: 'Presupuesto (Negro)', label: 'Presupuesto' }
  ]
};

const fmt = CONFIG.formatPrice;
const unFmt = CONFIG.unformatPrice;
