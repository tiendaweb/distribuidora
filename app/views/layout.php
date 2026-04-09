<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title><?= htmlspecialchars($pageTitle ?? 'La Distribuidora') ?></title>
<script src="https://cdn.tailwindcss.com"></script>
<script>
  tailwind.config = { theme: { extend: { colors: { brand: { DEFAULT: '#F5C000', dark: '#D4A800', light: '#FDD835', pale: '#FFF9E0' }, ink: '#1A1A1A', frost: '#F7F7F7' }, fontFamily: { display: ['Bebas Neue', 'Impact', 'sans-serif'], body: ['Nunito', 'sans-serif'] } } } }
</script>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Nunito:wght@400;600;700;800&display=swap" rel="stylesheet" />
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css" />
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.css" />
<link rel="stylesheet" href="/css/colors.css" />
<link rel="stylesheet" href="/css/components.css" />
<link rel="stylesheet" href="/css/admin.css" />
<link rel="stylesheet" href="/css/animations.css" />
<link rel="stylesheet" href="/css/responsive.css" />
</head>
<body class="min-h-screen flex flex-col" data-route="<?= htmlspecialchars($currentRoute) ?>" data-admin-tab="<?= htmlspecialchars($activeAdminTab ?? '') ?>" data-store-tab="<?= htmlspecialchars($activeStoreTab ?? '') ?>">

<?php include __DIR__ . '/partials/header.php'; ?>
<?php include __DIR__ . '/' . $contentView; ?>

<div id="cart-overlay" class="overlay fixed inset-0 bg-black/50 z-50 hidden" onclick="toggleCart()"></div>
<aside id="cart-drawer" class="fixed right-0 top-0 h-full w-full max-w-sm bg-white z-50 shadow-2xl flex flex-col hidden">
  <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-ink"><h2 class="font-display text-2xl text-brand">Tu Pedido</h2><button onclick="toggleCart()" class="text-gray-300 hover:text-white text-2xl leading-none">&times;</button></div>
  <div id="cart-items" class="flex-1 overflow-y-auto px-4 py-3 space-y-3"></div>
  <div class="border-t border-gray-200 px-5 py-4 bg-gray-50">
    <div class="mb-4 space-y-2"><input id="store-client-name" type="text" placeholder="Tu Nombre / Negocio" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /><input id="store-client-address" type="text" placeholder="Dirección de entrega" class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm" /></div>
    <div class="flex justify-between font-bold text-xl mb-4"><span>Total</span><span id="cart-total" class="text-brand">$0</span></div>
    <button onclick="enviarPedidoWeb(true)" class="w-full bg-[#25D366] text-white font-bold py-3 rounded-xl mb-2">Enviar por WhatsApp (y Guardar)</button>
    <button onclick="enviarPedidoWeb(false)" class="w-full bg-ink text-white font-bold py-3 rounded-xl">Solo Guardar Pedido</button>
  </div>
</aside>

<div id="product-modal" class="overlay fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 hidden" onclick="if(event.target===this) closeModal('product-modal')">
  <div id="modal-box" class="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden" onclick="event.stopPropagation()">
    <div class="relative">
      <img id="modal-img" src="" alt="" class="w-full h-52 object-cover bg-white" />
      <button id="btn-close-product-modal" class="absolute top-3 right-3 bg-white/90 rounded-full w-8 h-8 flex items-center justify-center font-bold text-lg shadow">&times;</button>
      <span id="modal-badge" class="absolute top-3 left-3 badge-oferta hidden">OFERTA</span>
    </div>
    <div class="p-5">
      <h3 id="modal-name" class="font-bold text-xl text-ink leading-tight"></h3>
      <p id="modal-desc" class="text-gray-500 text-sm mt-1 mb-3"></p>
      <div class="flex items-end gap-3 mb-4">
        <span id="modal-price-regular" class="price-regular"></span>
        <span id="modal-price-sale" class="text-brand font-display text-3xl"></span>
      </div>
      <div class="flex items-center gap-3 mt-2">
        <div class="flex items-center gap-2">
          <button class="qty-btn bg-brand text-ink" onclick="changeModalQty(-1)">−</button>
          <input type="number" id="modal-qty" value="1" min="1" class="qty-input" />
          <button class="qty-btn bg-brand text-ink" onclick="changeModalQty(1)">+</button>
        </div>
        <button id="modal-add-btn" class="flex-1 bg-brand hover:bg-brand-dark text-ink font-bold py-2.5 rounded-xl text-sm transition">Agregar al carrito</button>
      </div>
    </div>
  </div>
</div>

<div id="admin-modal-overlay" class="overlay fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 hidden" onclick="closeAdminModal(event)"><div class="bg-white rounded-xl w-full max-w-sm shadow-2xl overflow-hidden p-5" onclick="event.stopPropagation()"><h3 id="edit-p-name">Editar Producto</h3><input type="hidden" id="edit-p-id"><input type="text" id="edit-p-product-name" class="w-full border rounded p-2 text-sm"><select id="edit-p-cat" class="w-full border rounded p-2 text-sm"><option value="helados">Helados</option><option value="pastas">Pastas</option><option value="congelados">Congelados</option></select><input type="url" id="edit-p-img" class="w-full border rounded p-2 text-sm"><input type="number" id="edit-p-stock" class="w-full border rounded p-2 text-sm"><input type="number" id="edit-p-cost" step="0.01" class="w-full border rounded p-2 text-sm" oninput="recalculatePrice()"><input type="number" id="edit-p-margin" step="0.01" class="w-full border rounded p-2 text-sm" oninput="recalculatePrice()"><input type="number" id="edit-p-sale" step="0.01" readonly class="w-full bg-transparent font-bold text-xl text-brand outline-none mt-1"><button onclick="closeAdminModal()">Cancelar</button><button onclick="deleteProductFromModal()" id="btn-delete-product" class="hidden">Eliminar</button><button onclick="saveAdminProduct()">Guardar</button></div></div>

<div id="admin-order-modal" class="overlay fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4 hidden" onclick="closeOrderModal(event)"><div class="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden p-5 flex flex-col max-h-[90vh]" onclick="event.stopPropagation()"><h3 class="font-bold text-xl mb-2 border-b pb-2 text-ink">Detalle de Pedido Web</h3><div id="order-modal-content" class="flex-1 overflow-y-auto space-y-2 text-sm my-3 text-ink"></div><div class="flex justify-between items-center font-bold text-lg border-t pt-3 mt-2"><span>Total del Pedido:</span><span id="order-modal-total" class="text-brand text-2xl"></span></div><button onclick="closeOrderModal()" class="w-full bg-ink text-white font-bold py-3 rounded-xl mt-4">Cerrar Detalle</button></div></div>

<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js"></script>
<script src="/js/config.js"></script><script src="/js/state.js"></script><script src="/js/data.js"></script><script src="/js/utils.js"></script><script src="/js/ui-helpers.js"></script><script src="/js/store.js"></script><script src="/js/admin.js"></script><script src="/js/pos.js"></script><script src="/js/clients.js"></script><script src="/js/orders.js"></script><script src="/js/products.js"></script><script src="/js/reports.js"></script><script src="/js/pdf.js"></script><script src="/js/app.js"></script>
</body>
</html>
