/* ============================================================
   GLOBAL STATE MANAGER
   ============================================================ */

const STATE = {
  // Store (Cliente)
  cart: [],
  currentFilter: 'all',
  currentSearch: '',
  storeSearchActiveIndex: -1,
  sliderIdx: 0,
  sliderTimer: null,
  isAdminMode: false,

  // Admin (Caja)
  adminCart: [],
  adminSelectedClient: null,
  adminDocumentType: 'blanco',
  adminPosCategory: 'all',
  posSearchActiveIndex: -1,

  // Products & Clients & Orders
  products: [],
  clients: [],
  adminOrders: [],
  adminInvoices: [],
  slides: [],

  // UI States
  selectedProductsForBulkEdit: new Set(),
  isMapVisible: true,
  currentMapMarker: null
};

// Getters
function getCart() {
  return STATE.cart;
}

function getAdminCart() {
  return STATE.adminCart;
}

function getProducts() {
  return STATE.products;
}

function getClients() {
  return STATE.clients;
}

function getOrders() {
  return STATE.adminOrders;
}

function isAdminMode() {
  return STATE.isAdminMode;
}

// Setters
function setCart(cart) {
  STATE.cart = cart;
}

function setAdminCart(cart) {
  STATE.adminCart = cart;
}

function setProducts(products) {
  STATE.products = products;
}

function setClients(clients) {
  STATE.clients = clients;
}

function setOrders(orders) {
  STATE.adminOrders = orders;
}

function setAdminMode(mode) {
  STATE.isAdminMode = mode;
}

function setSelectedClient(clientId) {
  STATE.adminSelectedClient = clientId;
}

function setDocumentType(type) {
  STATE.adminDocumentType = type;
}

function addSelectedProduct(productId) {
  STATE.selectedProductsForBulkEdit.add(productId);
}

function removeSelectedProduct(productId) {
  STATE.selectedProductsForBulkEdit.delete(productId);
}

function clearSelectedProducts() {
  STATE.selectedProductsForBulkEdit.clear();
}

function getSelectedProducts() {
  return Array.from(STATE.selectedProductsForBulkEdit);
}

function hasSelectedProducts() {
  return STATE.selectedProductsForBulkEdit.size > 0;
}
